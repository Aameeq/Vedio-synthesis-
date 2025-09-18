import React, { useState, useCallback, useEffect } from 'react';
import { CameraAction, AppMode, SavedWorld } from '../types';
import { KEY_MAP, PRESET_MOVEMENTS } from '../constants';
import { generateInitialImage, generateNextVideo, editImage, generateStereoVideo, generateAmbientSoundtrack, generateTransitionVideo, generateAudioDescription } from '../services/geminiService';
import { getSavedWorlds, saveWorld, deleteWorld } from '../utils/worldManager';
import { stitchVideos } from '../utils/videoStitcher';

import Loader from '../components/Loader';
import ErrorDisplay from '../components/ErrorDisplay';
import PromptInput from '../components/PromptInput';
import VideoDisplay from '../components/VideoDisplay';
import Controls from '../components/Controls';
import PresetSelector from '../components/PresetSelector';
import ModeToggle from '../components/ModeToggle';
import SceneEditor from '../components/SceneEditor';
import DownloadButton from '../components/DownloadButton';
import StereoToggle from '../components/StereoToggle';
import AssetLibrary from '../components/AssetLibrary';
import AudioControl from '../components/AudioControl';
import SaveWorldButton from '../components/SaveWorldButton';
import ViewToggle from '../components/ViewToggle';
import StoryboardEditor from '../components/StoryboardEditor';
import TransitionCreatorModal from '../components/TransitionCreatorModal';
import PlaybackModal from '../components/PlaybackModal';
import AnimationControls from '../components/AnimationControls';


type WorldBuilderView = 'director' | 'storyboard';
type TransitionState = {
    [fromWorldId: string]: {
        prompt: string;
        videoUrl?: string;
        toWorldId: string;
        isLoading: boolean;
    };
};

const WorldBuilder: React.FC = () => {
  // Common State
  const [error, setError] = useState<string | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(false);
  const [savedWorlds, setSavedWorlds] = useState<SavedWorld[]>([]);
  
  // View State
  const [view, setView] = useState<WorldBuilderView>('director');

  // Director View State
  const [prompt, setPrompt] = useState<string>('A photorealistic empty street in a futuristic city, neon signs, rainy night, cinematic lighting');
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

  // Storyboard View State
  const [storyboard, setStoryboard] = useState<SavedWorld[]>([]);
  const [transitions, setTransitions] = useState<TransitionState>({});
  const [transitionModal, setTransitionModal] = useState<{from: SavedWorld, to: SavedWorld} | null>(null);
  const [modalPlaylist, setModalPlaylist] = useState<string[] | null>(null);
  const [isRenderingStoryboard, setIsRenderingStoryboard] = useState<boolean>(false);
  const [modalPlaybackUrl, setModalPlaybackUrl] = useState<string | null>(null);


  const appIsBusy = isLoading || videoUrl !== null || stereoVideoUrls !== null || activePreset !== null;
  const currentVideoSource = stereoVideoUrls ? stereoVideoUrls.left : videoUrl;
  const isTransitionLoading = Object.values(transitions).some(t => t.isLoading);
  const storyboardIsBusy = isTransitionLoading || isRenderingStoryboard;


  useEffect(() => {
    document.addEventListener('open-library', () => setIsLibraryOpen(true));
    setSavedWorlds(getSavedWorlds());
  }, []);

  // Director View Handlers
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
    
    // Keep audio playing between clips if it exists
    // setAudioUrl(null); 

    try {
      if (isStereoMode) {
        const urls = await generateStereoVideo(currentFrame, action, animationPrompt, setLoadingMessage);
        setStereoVideoUrls(urls);
      } else {
        const url = await generateNextVideo(currentFrame, action, animationPrompt, setLoadingMessage);
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
  }, [currentFrame, isLoading, isStereoMode, animationPrompt]);

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
  
  // Shared Handlers
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
    setView('director');
  };

  const handleDeleteWorld = (worldId: string) => {
    if (window.confirm("Are you sure you want to delete this world? This will also remove it from your storyboard.")) {
      deleteWorld(worldId);
      setSavedWorlds(getSavedWorlds());
      setStoryboard(prev => prev.filter(w => w.id !== worldId));
    }
  };

  // Storyboard Handlers
  const handleAddToStoryboard = (world: SavedWorld) => {
    if (!storyboard.find(w => w.id === world.id)) {
        setStoryboard(prev => [...prev, world]);
    }
    setIsLibraryOpen(false);
  };
  
  const handleRemoveFromStoryboard = (worldId: string) => {
    setStoryboard(prev => prev.filter(w => w.id !== worldId));
  }

  const handleGenerateTransition = async (from: SavedWorld, to: SavedWorld, transitionPrompt: string) => {
    setError(null);
    setTransitions(prev => ({
        ...prev,
        [from.id]: { prompt: transitionPrompt, toWorldId: to.id, isLoading: true }
    }));

    try {
        const url = await generateTransitionVideo(
            from.imageData,
            from.name,
            to.name,
            transitionPrompt,
            setLoadingMessage
        );
        setTransitions(prev => ({
            ...prev,
            [from.id]: { ...prev[from.id], videoUrl: url, isLoading: false }
        }));
    } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Failed to generate transition.');
        setTransitions(prev => ({
            ...prev,
            [from.id]: { ...prev[from.id], isLoading: false }
        }));
    } finally {
        setLoadingMessage('');
        setTransitionModal(null);
    }
  };

  const handlePlayTransition = (videoUrl: string) => {
    setModalPlaybackUrl(videoUrl);
    setModalPlaylist(null);
  };

  const handlePlaySequence = () => {
      const urls = storyboard.slice(0, -1).map(world => {
          const transition = transitions[world.id];
          return transition?.videoUrl;
      }).filter((url): url is string => typeof url === 'string');

      if (urls.length === storyboard.length - 1) {
          setModalPlaylist(urls);
          setModalPlaybackUrl(null);
      } else {
          setError("Cannot play sequence until all transitions are generated.");
      }
  };
  
  const handleRenderSequence = async () => {
    const urls = storyboard.slice(0, -1).map(world => {
        const transition = transitions[world.id];
        return transition?.videoUrl;
    }).filter((url): url is string => typeof url === 'string');

    if (urls.length !== storyboard.length - 1) {
        setError("Cannot render sequence until all transitions are generated.");
        return;
    }

    setIsRenderingStoryboard(true);
    setError(null);
    setLoadingMessage("Preparing to render...");

    try {
        const blobUrl = await stitchVideos(urls, (progress) => {
            setLoadingMessage(`Rendering video... ${Math.round(progress)}%`);
        });

        const link = document.createElement('a');
        link.href = blobUrl;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.download = `storyboard-render-${timestamp}.webm`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);

    } catch (err) {
        console.error("Failed to render storyboard:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred during rendering.");
    } finally {
        setIsRenderingStoryboard(false);
        setLoadingMessage("");
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (view !== 'director' || !isReadyForInput || appIsBusy || mode !== AppMode.CAMERA) return;
      const action = KEY_MAP[event.key.toUpperCase() as keyof typeof KEY_MAP];
      if (action) {
        event.preventDefault();
        handleStep(action);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleStep, isReadyForInput, appIsBusy, mode, view]);
  
  const DirectorView = () => (
     !currentFrame ? (
         <div className="w-full flex-grow flex flex-col items-center justify-center">
            <PromptInput prompt={prompt} setPrompt={setPrompt} onGenerate={handleGenerateImage} />
        </div>
    ) : (
         <div className="w-full flex-grow flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-3/4 aspect-video bg-black rounded-lg shadow-2xl flex items-center justify-center overflow-hidden relative">
                {isLoading && <Loader message={loadingMessage} />}
                <VideoDisplay
                    videoUrl={currentVideoSource}
                    stereoVideoUrls={stereoVideoUrls}
                    audioUrl={audioUrl}
                    frameUrl={currentFrame}
                    onVideoEnd={handleVideoEnd}
                    isLoading={isLoading}
                />
                {currentVideoSource && <DownloadButton onClick={handleDownload} isDisabled={!currentVideoSource} isStereo={isStereoMode} />}
                {currentFrame && !videoUrl && !stereoVideoUrls && <SaveWorldButton onClick={handleSaveWorld} isDisabled={appIsBusy} />}
                {currentFrame && !videoUrl && !stereoVideoUrls && <AudioControl onGenerateAudio={handleGenerateAudio} isAudioOn={!!audioUrl} isGenerating={isGeneratingAudio} isDisabled={appIsBusy} audioDescription={audioDescription} />}
            </div>
            <div className="w-full md:w-1/4 bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col gap-6 self-stretch">
                <h2 className="text-xl font-semibold text-brand-text border-b border-gray-700 pb-2">Controls</h2>
                <ModeToggle currentMode={mode} onModeChange={setMode} isDisabled={appIsBusy} />
                {mode === AppMode.CAMERA ? (
                    <>
                        <AnimationControls 
                            prompt={animationPrompt}
                            setPrompt={setAnimationPrompt}
                            isDisabled={appIsBusy}
                        />
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
                     <StereoToggle isEnabled={isStereoMode} onToggle={setIsStereoMode} isDisabled={appIsBusy} />
                </div>
            </div>
         </div>
    )
  );

  return (
    <>
      {isRenderingStoryboard && <Loader message={loadingMessage} />}
      <main className="w-full max-w-7xl flex-grow flex flex-col items-center animate-fadeIn">
        <ViewToggle currentView={view} onViewChange={setView} />
        {error && <ErrorDisplay message={error} onDismiss={() => setError(null)} />}
        
        <div key={view} className="w-full flex-1 flex flex-col animate-fadeIn">
            {view === 'director' ? <DirectorView /> : (
                <StoryboardEditor 
                    storyboard={storyboard}
                    transitions={transitions}
                    onAddWorldClick={() => setIsLibraryOpen(true)}
                    onRemoveWorld={handleRemoveFromStoryboard}
                    onOpenTransitionCreator={(from, to) => setTransitionModal({from, to})}
                    onPlayTransition={handlePlayTransition}
                    onPlaySequence={handlePlaySequence}
                    isBusy={storyboardIsBusy}
                    isRendering={isRenderingStoryboard}
                    onRenderSequence={handleRenderSequence}
                />
            )}
        </div>
      </main>
      
      {isLibraryOpen && (
        <AssetLibrary
          worlds={savedWorlds}
          onLoad={handleLoadWorld}
          onDelete={handleDeleteWorld}
          onClose={() => setIsLibraryOpen(false)}
          onAddToStoryboard={handleAddToStoryboard}
        />
      )}

      {transitionModal && (
          <TransitionCreatorModal
            fromWorld={transitionModal.from}
            toWorld={transitionModal.to}
            onClose={() => setTransitionModal(null)}
            onGenerate={(prompt) => handleGenerateTransition(transitionModal.from, transitionModal.to, prompt)}
            isLoading={transitions[transitionModal.from.id]?.isLoading ?? false}
            loadingMessage={loadingMessage}
          />
      )}

      {modalPlaybackUrl && (
          <PlaybackModal playlist={[modalPlaybackUrl]} onClose={() => setModalPlaybackUrl(null)} />
      )}

       {modalPlaylist && (
          <PlaybackModal playlist={modalPlaylist} onClose={() => setModalPlaylist(null)} />
      )}
    </>
  );
};

export default WorldBuilder;
