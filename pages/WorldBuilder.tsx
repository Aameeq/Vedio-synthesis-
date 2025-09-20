import React, { useState, useCallback, useEffect } from 'react';
import { CameraAction, AppMode, SavedWorld } from '../types';
import { KEY_MAP, PRESET_MOVEMENTS } from '../constants';
import { generateInitialImage, generateNextVideo, editImage, generateStereoVideo, generateAmbientSoundtrack, generateAudioDescription } from '../services/geminiService';
import { getSavedWorlds, saveWorld, deleteWorld } from '../utils/worldManager';

import Loader from '../components/Loader';
import ErrorDisplay from '../components/ErrorDisplay';
import VideoDisplay from '../components/VideoDisplay';
import AssetLibrary from '../components/AssetLibrary';
import BottomBar from '../components/BottomBar';
import Placeholder from '../components/Placeholder';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const WorldBuilder: React.FC = () => {
  // State
  const [prompt, setPrompt] = useState<string>('');
  const [currentFrame, setCurrentFrame] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [stereoVideoUrls, setStereoVideoUrls] = useState<{left: string, right: string} | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioDescription, setAudioDescription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [isReadyForInput, setIsReadyForInput] = useState<boolean>(true);
  const [activePreset, setActivePreset] = useState<CameraAction[] | null>(null);
  const [presetStepIndex, setPresetStepIndex] = useState<number>(0);
  const [mode, setMode] = useState<AppMode>(AppMode.CAMERA);
  const [editPrompt, setEditPrompt] = useState<string>('');
  const [isStereoMode, setIsStereoMode] = useState<boolean>(false);
  const [animationPrompt, setAnimationPrompt] = useState<string>('');
  const [styleReferenceImage, setStyleReferenceImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(false);
  const [savedWorlds, setSavedWorlds] = useState<SavedWorld[]>([]);

  const appIsBusy = isLoading || videoUrl !== null || stereoVideoUrls !== null || activePreset !== null;
  const currentVideoSource = stereoVideoUrls ? stereoVideoUrls.left : videoUrl;

  useEffect(() => {
    const openLibraryListener = () => setIsLibraryOpen(true);
    document.addEventListener('open-library', openLibraryListener);
    setSavedWorlds(getSavedWorlds());
    return () => {
        document.removeEventListener('open-library', openLibraryListener);
    }
  }, []);

  const handleStyleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        try {
            const base64 = await fileToBase64(file);
            setStyleReferenceImage(base64);
        } catch (err) {
            setError("Failed to read the style image file.");
        }
    } else if (file) {
        setError("Please select a valid image file.");
    }
  };
  
  const handleClearStyleImage = () => {
    setStyleReferenceImage(null);
  };

  const handleGenerateImage = async () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    setLoadingMessage('Generating initial world...');
    setError(null);
    setCurrentFrame(null);
    setVideoUrl(null);
    setStereoVideoUrls(null);
    setAudioUrl(null);
    setAudioDescription(null);
    try {
      const imageB64 = await generateInitialImage(prompt, styleReferenceImage);
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

  const handleEditScene = async () => {
    if (!editPrompt.trim() || !currentFrame || appIsBusy) return;
    setIsLoading(true);
    setLoadingMessage('Editing the scene...');
    setError(null);
    try {
      const newFrame = await editImage(currentFrame, editPrompt, styleReferenceImage);
      setCurrentFrame(newFrame);
      setEditPrompt('');
      setMode(AppMode.CAMERA); // Switch back to camera mode after edit
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred while editing the scene.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleStep = useCallback(async (action: CameraAction) => {
    if (!currentFrame || isLoading) return;
    setIsLoading(true);
    setIsReadyForInput(false);
    setError(null);
    setVideoUrl(null);
    setStereoVideoUrls(null);
    
    try {
      if (isStereoMode) {
        const urls = await generateStereoVideo(currentFrame, action, animationPrompt, setLoadingMessage, !!styleReferenceImage);
        setStereoVideoUrls(urls);
      } else {
        const url = await generateNextVideo(currentFrame, action, animationPrompt, setLoadingMessage, !!styleReferenceImage);
        setVideoUrl(url);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during video generation.');
      setIsReadyForInput(true);
      setActivePreset(null);
      setPresetStepIndex(0);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [currentFrame, isLoading, isStereoMode, animationPrompt, styleReferenceImage]);

  const handleVideoEnd = (lastFrameDataUrl: string) => {
    setCurrentFrame(lastFrameDataUrl);
    setVideoUrl(null);
    setStereoVideoUrls(null);

    if (activePreset) {
      const nextStepIndex = presetStepIndex + 1;
      if (nextStepIndex < activePreset.length) {
        setPresetStepIndex(nextStepIndex);
        setTimeout(() => handleStep(activePreset[nextStepIndex]), 100);
      } else {
        setActivePreset(null);
        setPresetStepIndex(0);
        setIsReadyForInput(true);
      }
    } else {
      setIsReadyForInput(true);
    }
  };

  const handlePresetSelect = (presetKey: string) => {
    if (appIsBusy) return;
    const presetActions = PRESET_MOVEMENTS[presetKey];
    if (presetActions && presetActions.length > 0) {
      setActivePreset(presetActions);
      setPresetStepIndex(0);
      handleStep(presetActions[0]);
    }
  };
  
  const handleGenerateAudio = async () => {
    if (isGeneratingAudio || !prompt) return;
    setIsGeneratingAudio(true);
    setError(null);
    setAudioDescription(null);
    setAudioUrl(null);
    try {
      const description = await generateAudioDescription(prompt);
      setAudioDescription(description);
      const url = await generateAmbientSoundtrack(description);
      setAudioUrl(url);
    } catch (err) {
      console.error("Failed to generate audio", err);
      setError("Failed to generate ambient audio.");
    } finally {
      setIsGeneratingAudio(false);
    }
  };
  
  const handleSaveWorld = () => {
    if (!currentFrame) return;
    const name = window.prompt("Enter a name for your world:", prompt.substring(0, 30));
    if (name) {
      const newWorld: SavedWorld = {
        id: Date.now().toString(),
        name,
        imageData: currentFrame,
        createdAt: new Date().toISOString(),
      };
      saveWorld(newWorld);
      setSavedWorlds(getSavedWorlds());
    }
  };

  const handleLoadWorld = (world: SavedWorld) => {
    setCurrentFrame(world.imageData);
    setPrompt(world.name);
    setVideoUrl(null);
    setStereoVideoUrls(null);
    setAudioUrl(null);
    setAudioDescription(null);
    setError(null);
    setIsLibraryOpen(false);
  };

  const handleDeleteWorld = (worldId: string) => {
    if (window.confirm("Are you sure you want to delete this world?")) {
      deleteWorld(worldId);
      setSavedWorlds(getSavedWorlds());
    }
  };
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isReadyForInput || appIsBusy || mode !== AppMode.CAMERA) return;
      const action = KEY_MAP[event.key.toUpperCase() as keyof typeof KEY_MAP];
      if (action) {
        event.preventDefault();
        handleStep(action);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleStep, isReadyForInput, appIsBusy, mode]);
  
  return (
    <div className="w-full h-full flex-grow flex flex-col relative overflow-hidden animate-fadeIn p-4 md:p-6 lg:p-8">
      {error && <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 w-full max-w-md"><ErrorDisplay message={error} onDismiss={() => setError(null)} /></div>}
      
      {/* Main Content Canvas */}
      <div className="w-full flex-grow flex items-center justify-center relative bg-brand-dark-secondary rounded-2xl overflow-hidden shadow-2xl">
        {isLoading && <Loader message={loadingMessage} />}
        
        {currentFrame ? (
             <VideoDisplay
                videoUrl={currentVideoSource}
                stereoVideoUrls={stereoVideoUrls}
                audioUrl={audioUrl}
                frameUrl={currentFrame}
                onVideoEnd={handleVideoEnd}
                isLoading={isLoading}
                isReady={isReadyForInput && !appIsBusy}
                isStereo={isStereoMode}
                onSave={handleSaveWorld}
                onAddAmbiance={handleGenerateAudio}
                isGeneratingAudio={isGeneratingAudio}
                audioDescription={audioDescription}
             />
        ) : (
            <Placeholder />
        )}
      </div>
       
      <BottomBar
        stage={currentFrame ? 'director' : 'initial'}
        prompt={prompt}
        setPrompt={setPrompt}
        onGenerate={handleGenerateImage}
        styleReferenceImage={styleReferenceImage}
        onStyleImageChange={handleStyleImageChange}
        mode={mode}
        onModeChange={setMode}
        animationPrompt={animationPrompt}
        setAnimationPrompt={setAnimationPrompt}
        onAction={handleStep}
        onPresetSelect={handlePresetSelect}
        editPrompt={editPrompt}
        setEditPrompt={setEditPrompt}
        onEdit={handleEditScene}
        isStereoMode={isStereoMode}
        onStereoToggle={setIsStereoMode}
        appIsBusy={appIsBusy}
      />

      {isLibraryOpen && (
        <AssetLibrary
          worlds={savedWorlds}
          onLoad={handleLoadWorld}
          onDelete={handleDeleteWorld}
          onClose={() => setIsLibraryOpen(false)}
        />
      )}
    </div>
  );
};

export default WorldBuilder;