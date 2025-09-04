
import { GoogleGenAI, Operation } from "@google/genai";
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


export const generateNextVideo = async (
    lastFrameBase64: string, 
    action: CameraAction,
    updateLoadingMessage: (message: string) => void
): Promise<string> => {
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

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
        updateLoadingMessage(LOADING_MESSAGES[messageIndex]);
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error("Video generation completed, but no download link was found.");
    }

    const videoUrl = `${downloadLink}&key=${process.env.API_KEY}`;
    
    // Fetch the video as a blob to create a local URL, avoiding direct exposure of API key in video src
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
        throw new Error(`Failed to fetch video: ${videoResponse.statusText}`);
    }
    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);
};
