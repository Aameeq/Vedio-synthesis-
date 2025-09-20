import React, { useState, useCallback, useEffect } from 'react';
import { CameraAction, AppMode, SavedWorld } from '../types';
import { KEY_MAP, PRESET_MOVEMENTS } from '../constants';
import { generateInitialImage, generateNextVideo, editImage, generateStereoVideo, generateAmbientSoundtrack, generateAudioDescription } from '../services/geminiService';
import { getSavedWorlds, saveWorld, deleteWorld } from '../utils/worldManager';

import Loader from '../components/Loader';
import ErrorDisplay from '../components/ErrorDisplay';
import VideoDisplay from '../components/VideoDisplay';
import AssetLibrary from '../components/AssetLibrary';
import Placeholder from '../components/Placeholder';
import PromptInput from '../components/PromptInput';
import Controls from '../components/Controls';
import PresetSelector from '../components/PresetSelector';
import ModeToggle from '../components/ModeToggle';
import SceneEditor from '../components/SceneEditor';
import StereoToggle from '../components/StereoToggle';
import AnimationControls from '../components/AnimationControls';


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
    const file = event.target.files?-[0];
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
    <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 animate-fadeIn">
      {error && <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-md"><ErrorDisplay message={error} onDismiss={() => setError(null)} /></div>}
      
      <div className="w-full max-w-4xl bg-brand-dark-secondary rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col gap-6 border border-slate-700/50">
        {/* Preview Panel */}
        <div className="w-full aspect-video bg-black rounded-xl flex items-center justify-center relative overflow-hidden">
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

        {/* Control Panel */}
        <div className="w-full">
            {!currentFrame ? (
                <div className="w-full flex flex-row items-center gap-4">
                    <label 
                        htmlFor="style-image-upload" 
                        className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-brand-dark-tertiary text-slate-400 rounded-xl hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
                        title="Add style reference image"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </label>
                    <input id="style-image-upload" type="file" accept="image/*" onChange={handleStyleImageChange} className="hidden" />
                    <div className="flex-1">
                        <PromptInput
                            prompt={prompt}
                            setPrompt={setPrompt}
                            onGenerate={handleGenerateImage}
                            isDisabled={appIsBusy}
                        />
                    </div>
                    <button
                        onClick={handleGenerateImage}
                        disabled={appIsBusy || !prompt.trim()}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl shadow-md hover:scale-105 transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Generating...' : 'Generate'}
                    </button>
                </div>
            ) : (
              <div className="w-full flex flex-col items-center gap-4">
                <div className="w-full flex items-center justify-center">
                    {mode === AppMode.EDIT ? (
                        <SceneEditor
                            prompt={editPrompt}
                            setPrompt={setEditPrompt}
                            onEdit={handleEditScene}
                            onCancel={() => setMode(AppMode.CAMERA)}
                            isDisabled={appIsBusy}
                        />
                    ) : (
                       <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
                           <div className="flex items-center gap-2">
                               <Controls onAction={handleStep} isDisabled={!isReadyForInput || appIsBusy} />
                               <PresetSelector presets={PRESET_MOVEMENTS} onSelect={handlePresetSelect} isDisabled={!isReadyForInput || appIsBusy} />
                           </div>
                           <div className="flex items-center gap-2">
                               <AnimationControls prompt={animationPrompt} setPrompt={setAnimationPrompt} isDisabled={!isReadyForInput || appIsBusy} />
                               <StereoToggle isEnabled={isStereoMode} onToggle={setIsStereoMode} isDisabled={appIsBusy} />
                           </div>
                       </div>
                    )}
                </div>
                <ModeToggle currentMode={mode} onModeChange={setMode} isDisabled={appIsBusy} />
              </div>
            )}
        </div>
      </div>

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