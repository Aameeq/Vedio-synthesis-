import { GoogleGenAI, Modality } from "@google/genai";
import { CameraAction } from '../types';
import { VEO_PROMPT_TEMPLATE, LOADING_MESSAGES } from "../constants";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const CACHE_PREFIX = 'video-cache-';

const generateCacheKey = (frame: string, action: CameraAction): string => {
  // Simple hash function
  const hash = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
    }
    return h.toString();
  };
  return `${CACHE_PREFIX}${hash(frame)}-${hash(JSON.stringify(action))}`;
};

const getCachedVideo = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.error("Failed to read from localStorage", e);
    return null;
  }
};

const setCachedVideo = (key: string, videoUrl: string): void => {
  try {
    localStorage.setItem(key, videoUrl);
  } catch (e) {
    console.error("Failed to write to localStorage", e);
    // Attempt to clear some old cache and retry
    try {
      // Clear 5 oldest entries
      const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX)).sort();
      for(let i = 0; i < 5 && i < keys.length; i++) {
        localStorage.removeItem(keys[i]);
      }
      localStorage.setItem(key, videoUrl);
    } catch (e2) {
      console.error("Failed to write to localStorage even after clearing some cache", e2);
    }
  }
};


const base64ToParts = (base64: string) => {
    const match = base64.match(/^data:(image\/.+);base64,(.+)$/);
    if (!match) {
        throw new Error("Invalid base64 string format");
    }
    const mimeType = match[1];
    const data = match[2];
    return { mimeType, data };
};


export const generateInitialImage = async (prompt: string): Promise<string> => {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
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


export const editImage = async (base64Image: string, prompt: string): Promise<string> => {
    const { mimeType, data } = base64ToParts(base64Image);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: data,
                        mimeType: mimeType,
                    },
                },
                {
                    text: prompt,
                },
            ],
        },
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


export const generateNextVideo = async (
    lastFrameBase64: string, 
    action: CameraAction,
    updateLoadingMessage: (message: string) => void
): Promise<string> => {
    const cacheKey = generateCacheKey(lastFrameBase64, action);
    const cachedVideo = getCachedVideo(cacheKey);
    if (cachedVideo) {
        updateLoadingMessage("Loading from cache...");
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
        return cachedVideo;
    }

    const { mimeType, data } = base64ToParts(lastFrameBase64);
    
    let messageIndex = 0;
    updateLoadingMessage(LOADING_MESSAGES[messageIndex]);

    let operation = await ai.models.generateVideos({
        model: 'veo-2.0-generate-001',
        prompt: VEO_PROMPT_TEMPLATE(action),
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

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64data = reader.result as string;
            setCachedVideo(cacheKey, base64data);
            resolve(base64data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(videoBlob);
    });
};

export const generateStereoVideo = async (
    leftEyeFrameBase64: string,
    action: CameraAction,
    updateLoadingMessage: (message: string) => void
): Promise<{ left: string; right: string; }> => {
    updateLoadingMessage("Generating right eye perspective...");
    const rightEyeFrameBase64 = await editImage(
        leftEyeFrameBase64,
        "Generate a stereoscopic right-eye view for this image, creating a slight horizontal offset for 3D depth. Do not change the content, style, or composition of the image."
    );

    updateLoadingMessage("Generating stereo video streams...");

    const [leftVideoUrl, rightVideoUrl] = await Promise.all([
        generateNextVideo(leftEyeFrameBase64, action, () => {}),
        generateNextVideo(rightEyeFrameBase64, action, () => {})
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

// In a real application, this would come from an audio generation model.
// For now, we use a placeholder to demonstrate the feature.
export const getPlaceholderAudioUrl = (): string => {
    return 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'; // Using a video file with audio as a placeholder
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
