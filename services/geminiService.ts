
import { GoogleGenAI, Modality } from "@google/genai";
import { CameraAction } from '../types';
import { VEO_PROMPT_TEMPLATE, LOADING_MESSAGES } from "../constants";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const base64ToParts = (base64: string) => {
    const match = base64.match(/^data:(image\/.+);base64,(.+)$/);
    if (!match) {
        throw new Error("Invalid base64 string format");
    }
    const mimeType = match[1];
    const data = match[2];
    return { mimeType, data };
};


export const generateInitialImage = async (prompt: string, styleReferenceImage?: string | null): Promise<string> => {
    const { mimeType, data } = styleReferenceImage ? base64ToParts(styleReferenceImage) : { mimeType: null, data: null };

    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        ...(styleReferenceImage && data && mimeType && {
            image: {
                imageBytes: data,
                mimeType: mimeType,
            }
        }),
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9',
        },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new Error("Image generation failed, no images returned.");
    }
    return response.generatedImages[0].image.imageBytes;
};


export const editImage = async (base64Image: string, prompt: string, styleReferenceImage?: string | null): Promise<string> => {
    const mainImageParts = base64ToParts(base64Image);
    const styleImageParts = styleReferenceImage ? base64ToParts(styleReferenceImage) : null;
    
    // Fix: Explicitly type the 'parts' array to allow both image ({inlineData: ...}) and text ({text: ...}) parts.
    // TypeScript was inferring the type from only the first element, causing an error when a text part was pushed.
    const parts: ({ inlineData: { data: string; mimeType: string; }; } | { text: string; })[] = [
        { inlineData: { data: mainImageParts.data, mimeType: mainImageParts.mimeType } },
    ];
    
    let textPrompt = prompt;

    if (styleImageParts) {
        parts.push({ inlineData: { data: styleImageParts.data, mimeType: styleImageParts.mimeType } });
        textPrompt = `${prompt}. Important: Strictly adhere to the artistic style of the second image provided.`;
    }
    
    parts.push({ text: textPrompt });

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: parts },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }

    throw new Error("Image editing failed to return a new image.");
};

const VEO_TRANSITION_TEMPLATE = (startDesc: string, endDesc: string, transitionDesc: string) =>
  `Create a seamless, high-quality cinematic video transition. The video must start with a scene that looks exactly like the uploaded image, which is described as: "${startDesc}". The video must smoothly transform into a final frame that is described as: "${endDesc}".
The style of the transition should be: "${transitionDesc}".
This is a single, continuous shot with no cuts. Duration: 4 seconds. 8k, hyper-realistic, Unreal Engine 5 look. 60fps, 720p, 16:9 aspect ratio. Seed: 12345`;


export const generateTransitionVideo = async (
    startFrameBase64: string,
    startFrameDesc: string,
    endFrameDesc: string,
    transitionPrompt: string,
    updateLoadingMessage: (message: string) => void
): Promise<string> => {
     const { mimeType, data } = base64ToParts(startFrameBase64);
    
    let messageIndex = 0;
    const updateMessage = () => {
        updateLoadingMessage(`Generating transition: ${LOADING_MESSAGES[messageIndex]}`);
        messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
    };
    updateMessage();

    const prompt = VEO_TRANSITION_TEMPLATE(startFrameDesc, endFrameDesc, transitionPrompt);

    let operation = await ai.models.generateVideos({
        model: 'veo-2.0-generate-001',
        prompt: prompt,
        image: {
            imageBytes: data,
            mimeType: mimeType,
        },
        config: {
            numberOfVideos: 1,
        }
    });

    const interval = setInterval(updateMessage, 10000);

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    
    clearInterval(interval);

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error("Video generation completed, but no download link was found.");
    }

    const videoUrl = `${downloadLink}&key=${process.env.API_KEY}`;
    
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
        throw new Error(`Failed to fetch video: ${videoResponse.statusText}`);
    }
    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);
}


export const generateNextVideo = async (
    lastFrameBase64: string, 
    action: CameraAction,
    animationPrompt: string | undefined,
    updateLoadingMessage: (message: string) => void,
    isStyleLocked: boolean,
): Promise<string> => {
    const { mimeType, data } = base64ToParts(lastFrameBase64);
    
    let messageIndex = 0;
    updateLoadingMessage(LOADING_MESSAGES[messageIndex]);

    let operation = await ai.models.generateVideos({
        model: 'veo-2.0-generate-001',
        prompt: VEO_PROMPT_TEMPLATE(action, animationPrompt, isStyleLocked),
        image: {
            imageBytes: data,
            mimeType: mimeType,
        },
        config: {
            numberOfVideos: 1,
        }
    });

    const interval = setInterval(() => {
      messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
      updateLoadingMessage(LOADING_MESSAGES[messageIndex]);
    }, 10000);

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    
    clearInterval(interval);

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error("Video generation completed, but no download link was found.");
    }

    const videoUrl = `${downloadLink}&key=${process.env.API_KEY}`;
    
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
        throw new Error(`Failed to fetch video: ${videoResponse.statusText}`);
    }
    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);
};

export const generateStereoVideo = async (
    leftEyeFrameBase64: string,
    action: CameraAction,
    animationPrompt: string | undefined,
    updateLoadingMessage: (message: string) => void,
    isStyleLocked: boolean,
): Promise<{ left: string; right: string; }> => {
    updateLoadingMessage("Generating right eye perspective...");
    // Pass the style lock down to the editImage call implicitly by not providing a separate style image
    const rightEyeFrameBase64 = await editImage(
        leftEyeFrameBase64,
        "Generate a stereoscopic right-eye view for this image, creating a slight horizontal offset for 3D depth. Do not change the content, style, or composition of the image."
    );

    updateLoadingMessage("Generating stereo video streams...");

    const [leftVideoUrl, rightVideoUrl] = await Promise.all([
        generateNextVideo(leftEyeFrameBase64, action, animationPrompt, () => {}, isStyleLocked),
        generateNextVideo(rightEyeFrameBase64, action, animationPrompt, () => {}, isStyleLocked)
    ]);

    return { left: leftVideoUrl, right: rightVideoUrl };
};

export const generateAudioDescription = async (scenePrompt: string): Promise<string> => {
    const systemInstruction = `You are an expert sound designer. Based on a scene description, create a detailed prompt for a hypothetical AI audio generation model. The prompt should describe a fitting, atmospheric soundtrack and ambient sound effects. Focus on mood, key sounds, and musical style. The output should be a single, concise paragraph.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Scene description: "${scenePrompt}"`,
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.8,
        }
    });
    return response.text;
};

// A library of placeholder audio clips with associated keywords to simulate a text-to-audio model.
const AMBIENT_SOUNDS: { keywords: string[]; url: string }[] = [
    // --- Urban Environments ---
    { 
        keywords: ['city', 'urban', 'street', 'traffic', 'cars', 'metropolis'], 
        url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4' 
    },
    { 
        keywords: ['rain', 'storm', 'thunder', 'wet', 'puddles', 'gloomy'], 
        url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4' // This one has a dramatic, stormy feel
    },
    { 
        keywords: ['sirens', 'emergency', 'police', 'ambulance', 'night city'], 
        url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4' // Has some intense city sounds
    },
    
    // --- Natural Environments ---
    { 
        keywords: ['forest', 'jungle', 'woods', 'trees', 'nature'], 
        url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' 
    },
    { 
        keywords: ['birds', 'chirping', 'animals', 'wildlife', 'meadow'], 
        url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' 
    },
    { 
        keywords: ['water', 'river', 'ocean', 'waves', 'stream', 'beach'], 
        url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' // This has boat/water scenes
    },
    { 
        keywords: ['wind', 'howling', 'desert', 'empty', 'desolate', 'plains'], 
        url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' // Open road, windy feel
    },

    // --- Sci-Fi / Fantasy ---
    { 
        keywords: ['sci-fi', 'futuristic', 'dystopian', 'cyberpunk', 'neon', 'robot', 'machinery', 'industrial'], 
        url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' // Perfect for sci-fi/robotics
    },
    { 
        keywords: ['surreal', 'dream', 'space', 'alien', 'ethereal', 'magical'], 
        url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' 
    },
    
    // --- Action & Specific Effects ---
    { 
        keywords: ['war', 'battle', 'fire', 'explosion', 'dramatic', 'intense', 'conflict'], 
        url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4' 
    },
    { 
        keywords: ['adventure', 'journey', 'explore', 'driving', 'flying'], 
        url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' 
    },
    { 
        keywords: ['footsteps', 'gravel', 'walking', 'path', 'dirt road', 'quiet'], 
        url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4' // Has distinct dirt road sounds
    },
];
const DEFAULT_AUDIO_URL = 'https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4';


export const generateAmbientSoundtrack = async (audioDescription: string): Promise<string> => {
    // This function simulates a call to an audio generation model.
    // It finds the best match from the library by scoring based on keyword frequency.
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

    const lowercasedDescription = audioDescription.toLowerCase();
    
    let bestMatch = { url: DEFAULT_AUDIO_URL, score: 0 };

    AMBIENT_SOUNDS.forEach(sound => {
        const score = sound.keywords.reduce((acc, keyword) => {
            if (lowercasedDescription.includes(keyword)) {
                return acc + 1;
            }
            return acc;
        }, 0);

        if (score > bestMatch.score) {
            bestMatch = { url: sound.url, score: score };
        }
    });

    return bestMatch.url;
};

export const generateArTutorial = async (platform: 'instagram' | 'snapchat', modelName: string): Promise<string> => {
    const tool = platform === 'instagram' ? "Meta's Spark AR Studio" : "Snap's Lens Studio";
    const systemInstruction = `You are an expert developer for AR filters. Your audience is a complete beginner who has a 3D model and wants to create a filter. Your tone should be encouraging, simple, and clear. Use markdown for formatting, including bolding for emphasis and numbered lists for steps. Do not include any preamble or sign-off, just the tutorial.`;
    
    const userPrompt = `Generate a step-by-step guide for a beginner to create an AR filter for ${platform}. 
    
    The user has their 3D model ready. The filename is "${modelName}".
    
    The guide must cover these essential steps:
    1.  Downloading and installing the required software (${tool}).
    2.  Creating a new project and choosing a basic template (e.g., a face tracker).
    3.  How to import their specific 3D model file.
    4.  How to attach the model to the face tracker so it moves with the user's head.
    5.  How to preview the filter on their computer and on their phone.
    6.  The final step of publishing the filter.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.5,
        }
    });

    return response.text;
};

// Placeholder 3D model library to simulate a text-to-3D model.
const MODEL_LIBRARY: { keywords: string[]; url: string; name: string }[] = [
    { 
        keywords: ['astronaut', 'space', 'helmet', 'sci-fi'], 
        url: 'https://storage.googleapis.com/ar-lab-models/astronaut_helmet.glb',
        name: 'AstronautHelmet.glb'
    },
    { 
        keywords: ['sunglasses', 'glasses', 'shades', 'cool', 'aviator'], 
        url: 'https://storage.googleapis.com/ar-lab-models/cool_sunglasses.glb',
        name: 'CoolSunglasses.glb'
    },
    { 
        keywords: ['viking', 'norse', 'horn', 'warrior'], 
        url: 'https://storage.googleapis.com/ar-lab-models/viking_helmet.glb',
        name: 'VikingHelmet.glb'
    },
    {
        keywords: ['knight', 'medieval', 'armor', 'visor'],
        url: 'https://storage.googleapis.com/ar-lab-models/knight_helmet.glb',
        name: 'KnightHelmet.glb'
    },
     {
        keywords: ['fox', 'animal', 'mask', 'kitsune'],
        url: 'https://storage.googleapis.com/ar-lab-models/fox_mask.glb',
        name: 'FoxMask.glb'
    }
];
const DEFAULT_MODEL = { 
    url: 'https://storage.googleapis.com/ar-lab-models/cool_sunglasses.glb', 
    name: 'CoolSunglasses.glb' 
};

export const generate3DModel = async (prompt: string, image?: string): Promise<{ url: string, name: string }> => {
    // This function simulates a call to a text-to-3D model.
    // It finds the best match from the library by scoring based on keyword frequency.
    if (image) {
        console.log("Image provided, but this simulated function will only use the text prompt.");
    }
    
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate network and generation delay

    const lowercasedPrompt = prompt.toLowerCase();
    
    let bestMatch = { ...DEFAULT_MODEL, score: 0 };

    MODEL_LIBRARY.forEach(model => {
        const score = model.keywords.reduce((acc, keyword) => {
            if (lowercasedPrompt.includes(keyword)) {
                return acc + 1;
            }
            return acc;
        }, 0);

        if (score > bestMatch.score) {
            bestMatch = { url: model.url, name: model.name, score: score };
        }
    });

    return { url: bestMatch.url, name: bestMatch.name };
};


// Fix: Add missing generateComponentTests function.
export const generateComponentTests = async (componentName: string, sourceCode: string): Promise<string> => {
    const systemInstruction = `You are an expert frontend developer specializing in React, TypeScript, and testing. Your task is to write comprehensive unit and integration tests for the given React component using Jest and React Testing Library.

Guidelines:
- The code should be a single, complete, and runnable Jest test file.
- Use modern testing practices, including \`@testing-library/react\` for rendering and interaction.
- Mock any imported dependencies, child components, or external services to isolate the component under test.
- Cover key functionalities, including user interactions (clicks, inputs), prop variations, and conditional rendering.
- Write clear and descriptive test names using \`describe\` and \`it\` blocks.
- Do not include any explanations, introductory text, or markdown formatting like \`\`\`tsx. Just provide the raw code.`;

    const userPrompt = `
Component Name: \`${componentName}\`

Component Source Code:
\`\`\`tsx
${sourceCode}
\`\`\`

Please generate the Jest/React Testing Library tests for this component.
`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.2,
        }
    });

    return response.text.replace(/```(?:tsx|typescript|javascript)?\s*|```\s*$/g, '').trim();
};
