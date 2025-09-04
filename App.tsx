
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { CameraAction } from './types';
import { KEY_MAP } from './constants';
import { generateInitialImage, generateNextVideo } from './services/geminiService';
import Header from './components/Header';
import Loader from './components/Loader';
import ErrorDisplay from './components/ErrorDisplay';
import PromptInput from './components/PromptInput';
import VideoDisplay from './components/VideoDisplay';
import Controls from './components/Controls';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('A photorealistic empty street in a futuristic city, neon signs, rainy night, cinematic lighting');
  const [currentFrame, setCurrentFrame] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isReadyForInput, setIsReadyForInput] = useState<boolean>(true);

  const appIsBusy = isLoading || videoUrl !== null;

  const handleGenerateImage = async () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    setLoadingMessage('Generating initial world...');
    setError(null);
    setCurrentFrame(null);
    setVideoUrl(null);
    try {
      const imageB64 = await generateInitialImage(prompt);
      setCurrentFrame(`data:image/jpeg;base64,${imageB64}`);
      setIsReadyForInput(true);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred while generating the image.');
      setIsReadyForInput(true);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleStep = useCallback(async (action: CameraAction) => {
    if (!currentFrame || appIsBusy) return;

    setIsLoading(true);
    setIsReadyForInput(false);
    setError(null);
    setVideoUrl(null);

    try {
      const url = await generateNextVideo(currentFrame, action, setLoadingMessage);
      setVideoUrl(url);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during video generation.');
      setIsReadyForInput(true);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [currentFrame, appIsBusy]);

  const handleVideoEnd = (lastFrameDataUrl: string) => {
    setCurrentFrame(lastFrameDataUrl);
    setVideoUrl(null);
    setIsReadyForInput(true);
  };
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isReadyForInput || appIsBusy) return;

      const action = KEY_MAP[event.key.toUpperCase() as keyof typeof KEY_MAP];
      if (action) {
        event.preventDefault();
        handleStep(action);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleStep, isReadyForInput, appIsBusy]);

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
      <Header />
      <main className="w-full max-w-5xl flex-grow flex flex-col items-center justify-center">
        {error && <ErrorDisplay message={error} onDismiss={() => setError(null)} />}
        
        <div className="w-full aspect-video bg-black rounded-lg shadow-2xl mb-6 flex items-center justify-center overflow-hidden relative">
          {isLoading && <Loader message={loadingMessage} />}
          {!isLoading && !currentFrame && !videoUrl && (
            <PromptInput prompt={prompt} setPrompt={setPrompt} onGenerate={handleGenerateImage} />
          )}
          {(currentFrame || videoUrl) && (
            <VideoDisplay
              videoUrl={videoUrl}
              frameUrl={currentFrame}
              onVideoEnd={handleVideoEnd}
            />
          )}
        </div>
        
        <Controls onAction={handleStep} isDisabled={!currentFrame || appIsBusy} />
        
        <p className="mt-4 text-brand-text-secondary text-sm">Use WASDQE keys or click the buttons to move the camera.</p>
      </main>
      <footer className="text-center py-4 text-brand-text-secondary text-xs">
        <p>Powered by Google's Imagen & Veo models. This is a creative exploration of steerable AI video generation.</p>
      </footer>
    </div>
  );
};

export default App;
