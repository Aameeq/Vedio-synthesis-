import React, { useState, useCallback, useEffect } from 'react';
import { CameraAction, AppMode, SavedWorld } from '../types';
import { KEY_MAP, PRESET_MOVEMENTS } from '../constants';
import { generateInitialImage, generateNextVideo, editImage, generateStereoVideo, getPlaceholderAudioUrl } from '../services/geminiService';
import { getSavedWorlds, saveWorld, deleteWorld } from '../utils/worldManager';
import Loader from '../components/Loader';
import ErrorDisplay from '../components/ErrorDisplay';
import PromptInput from '../components/PromptInput';
import VideoDisplay from '../components/VideoDisplay';
import Controls from '../components/Controls';
import PresetSelector from '../components/PresetSelector';
import VRPlayer from '../components/VRPlayer';
import ModeToggle from '../components/ModeToggle';
import SceneEditor from '../components/SceneEditor';
import DownloadButton from '../components/DownloadButton';
import StereoToggle from '../components/StereoToggle';
import AssetLibrary from '../components/AssetLibrary';
import AudioControl from '../components/AudioControl';
import SaveWorldButton from '../components/SaveWorldButton';

const WorldBuilder: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('A photorealistic empty street in a futuristic city, neon signs, rainy night, cinematic lighting');
  const [currentFrame, setCurrentFrame] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [stereoVideoUrls, setStereoVideoUrls] = useState<{left: string, right: string} | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isReadyForInput, setIsReadyForInput] = useState<boolean>(true);
  const [activePreset, setActivePreset] = useState<CameraAction[] | null>(null);
  const [presetStepIndex, setPresetStepIndex] = useState<number>(0);
  const [mode, setMode] = useState<AppMode>(AppMode.CAMERA);
  const [editPrompt, setEditPrompt] = useState<string>('');
  const [isStereoMode, setIsStereoMode] = useState<boolean>(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(false);
  const [savedWorlds, setSavedWorlds] = useState<SavedWorld[]>([]);

  const appIsBusy = isLoading || videoUrl !== null || stereoVideoUrls !== null || activePreset !== null;
  const currentVideoSource = stereoVideoUrls ? stereoVideoUrls.left : videoUrl;

  useEffect(() => {
    const handleOpenLibrary = () => setIsLibraryOpen(true);
    document.addEventListener('open-library', handleOpenLibrary);
    setSavedWorlds(getSavedWorlds());
    return () => document.removeEventListener('open-library', handleOpenLibrary);
  }, []);

  const handleGenerateImage = async () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    setLoadingMessage('Generating initial world...');
    setError(null);
    setCurrentFrame(null);
    setVideoUrl(null);
    setStereoVideoUrls(null);
    setAudioUrl(null);
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

  const handleEditScene = async () => {
    if (!editPrompt.trim() || !currentFrame || appIsBusy) return;
    setIsLoading(true);
    setLoadingMessage('Editing the scene...');
    setError(null);
    try {
      const newFrame = await editImage(currentFrame, editPrompt);
      setCurrentFrame(newFrame);
      setEditPrompt('');
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
    setAudioUrl(null);

    try {
      if (isStereoMode) {
        const urls = await generateStereoVideo(currentFrame, action, setLoadingMessage);
        setStereoVideoUrls(urls);
      } else {
        const url = await generateNextVideo(currentFrame, action, setLoadingMessage);
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
  }, [currentFrame, isLoading, isStereoMode]);

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

  const handleDownload = () => {
    if (!currentVideoSource) return;
    const link = document.createElement('a');
    link.href = currentVideoSource;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = isStereoMode ? `ai-world-video-left-eye-${timestamp}.mp4` : `ai-world-video-${timestamp}.mp4`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleGenerateAudio = () => {
    setAudioUrl(getPlaceholderAudioUrl());
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
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleStep, isReadyForInput, appIsBusy, mode]);
  
  const ControlPanel = () => (
    <div className="w-full md:w-1/4 bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col gap-6 self-stretch">
        <h2 className="text-xl font-semibold text-brand-text border-b border-gray-700 pb-2">Controls</h2>
        <ModeToggle currentMode={mode} onModeChange={setMode} isDisabled={appIsBusy} />
        {mode === AppMode.CAMERA ? (
            <>
                <Controls onAction={handleStep} isDisabled={!currentFrame || appIsBusy} />
                <PresetSelector
                    presets={PRESET_MOVEMENTS}
                    onSelect={handlePresetSelect}
                    isDisabled={!currentFrame || appIsBusy}
                />
            </>
        ) : (
            <SceneEditor 
              prompt={editPrompt}
              setPrompt={setEditPrompt}
              onEdit={handleEditScene}
              isDisabled={appIsBusy}
            />
        )}
        <div className="mt-auto">
             <StereoToggle isEnabled={isStereoMode} onToggle={setIsStereoMode} />
        </div>
    </div>
  );

  return (
    <>
      <main className="w-full max-w-7xl flex-grow flex flex-col items-center">
        {error && <ErrorDisplay message={error} onDismiss={() => setError(null)} />}
        
        {!currentFrame ? (
             <div className="w-full flex-grow flex flex-col items-center justify-center">
                <PromptInput prompt={prompt} setPrompt={setPrompt} onGenerate={handleGenerateImage} />
            </div>
        ) : (
             <div className="w-full flex-grow flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-3/4 aspect-video bg-black rounded-lg shadow-2xl flex items-center justify-center overflow-hidden relative">
                    {isLoading && <Loader message={loadingMessage} />}
                    <VideoDisplay
                        videoUrl={currentVideoSource}
                        audioUrl={audioUrl}
                        frameUrl={currentFrame}
                        onVideoEnd={handleVideoEnd}
                    />
                    <VRPlayer src={currentVideoSource} stereoSrc={stereoVideoUrls} />
                    {currentVideoSource && <DownloadButton onClick={handleDownload} isDisabled={!currentVideoSource} isStereo={isStereoMode} />}
                    {currentFrame && !videoUrl && <SaveWorldButton onClick={handleSaveWorld} isDisabled={appIsBusy} />}
                    {currentVideoSource && <AudioControl onGenerateAudio={handleGenerateAudio} isDisabled={!!audioUrl} />}
                </div>
                <ControlPanel />
             </div>
        )}
      </main>
      {isLibraryOpen && (
        <AssetLibrary
          worlds={savedWorlds}
          onLoad={handleLoadWorld}
          onDelete={handleDeleteWorld}
          onClose={() => setIsLibraryOpen(false)}
        />
      )}
    </>
  );
};

export default WorldBuilder;
