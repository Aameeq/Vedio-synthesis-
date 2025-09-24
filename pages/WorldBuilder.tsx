// Fix: Change React import to namespace import to resolve JSX and hook typing issues.
import * as React from 'react';
import {
    generateInitialImage,
    generateNextVideo,
    generateStereoVideo,
    editImage,
    generateAudioDescription,
    generateAmbientSoundtrack,
    improvisePrompt
} from '../services/geminiService';
import { getSavedWorlds, saveWorld, deleteWorld } from '../utils/worldManager';
import { CameraAction, AppMode, SavedWorld } from '../types';
import { KEY_MAP, PRESET_MOVEMENTS } from '../constants';
import VideoDisplay from '../components/VideoDisplay';
import Controls from '../components/Controls';
import PresetSelector from '../components/PresetSelector';
import ModeToggle from '../components/ModeToggle';
import SceneEditor from '../components/SceneEditor';
import Loader from '../components/Loader';
import ErrorDisplay from '../components/ErrorDisplay';
import PromptInput from '../components/PromptInput';
import AssetLibrary from '../components/AssetLibrary';
import StereoToggle from '../components/StereoToggle';
import AnimationControls from '../components/AnimationControls';


const InfoTooltip: React.FC = () => (
  <div className="group relative flex items-center">
    <span className="inline-block w-6 h-6 rounded-full bg-brand-primary text-white text-center font-bold cursor-pointer"
      tabIndex={0}
      aria-label="Show instructions"
    >i</span>
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-brand-dark-tertiary text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
      Enter a creative prompt and click Generate to see your world come alive!
       <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[-1px] w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-brand-dark-tertiary"></div>
    </div>
  </div>
);


const WorldBuilder: React.FC = () => {
    // Input & Prompts State
    // Fix: Prefix hooks with React.
    const [prompt, setPrompt] = React.useState<string>('');
    const [initialPrompt, setInitialPrompt] = React.useState<string>('');
    const [animationPrompt, setAnimationPrompt] = React.useState<string>('');
    const [editPrompt, setEditPrompt] = React.useState<string>('');

    // Loading & Error State
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [isImprovising, setIsImprovising] = React.useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = React.useState<string>('');
    const [error, setError] = React.useState<string | null>(null);

    // Media & Scene State
    const [currentFrame, setCurrentFrame] = React.useState<string | null>(null);
    const [videoUrl, setVideoUrl] = React.useState<string | null>(null);
    const [stereoVideoUrls, setStereoVideoUrls] = React.useState<{ left: string; right: string } | null>(null);
    const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
    const [audioDescription, setAudioDescription] = React.useState<string | null>(null);
    const [isGeneratingAudio, setIsGeneratingAudio] = React.useState<boolean>(false);

    // App Mode & Controls State
    const [appMode, setAppMode] = React.useState<AppMode>(AppMode.CAMERA);
    const [isStereo, setIsStereo] = React.useState<boolean>(false);
    const [isStyleLocked, setIsStyleLocked] = React.useState<boolean>(false); // For future use

    // Library & Tools State
    const [savedWorlds, setSavedWorlds] = React.useState<SavedWorld[]>([]);
    const [isLibraryOpen, setIsLibraryOpen] = React.useState<boolean>(false);

    const isReady = !!currentFrame && !isLoading;
    const actionQueue = React.useRef<CameraAction[]>([]).current;
    
    // Cleanup old video URLs to prevent memory leaks
    // Fix: Prefix hooks with React.
    React.useEffect(() => {
        return () => {
            if (videoUrl) URL.revokeObjectURL(videoUrl);
            if (stereoVideoUrls) {
                URL.revokeObjectURL(stereoVideoUrls.left);
                URL.revokeObjectURL(stereoVideoUrls.right);
            }
        };
    }, [videoUrl, stereoVideoUrls]);
    
    const dismissError = () => setError(null);

    // Load saved worlds on mount and set up global event listeners
    // Fix: Prefix hooks with React.
    React.useEffect(() => {
        setSavedWorlds(getSavedWorlds());
        const handleOpenLibrary = () => setIsLibraryOpen(true);
        document.addEventListener('open-library', handleOpenLibrary);

        return () => {
            document.removeEventListener('open-library', handleOpenLibrary);
        };
    }, []);

    // Keyboard controls for camera movement
    // Fix: Prefix hooks with React.
    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!isReady || appMode !== AppMode.CAMERA || document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement) return;
            const action = KEY_MAP[event.key.toUpperCase()];
            if (action) {
                event.preventDefault();
                handleAction(action);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isReady, appMode]);

    const handleGenerateInitialImage = async () => {
        if (!prompt.trim()) {
            setError("Please enter a description for your world.");
            return;
        }
        setIsLoading(true);
        setLoadingMessage("Generating initial world...");
        setError(null);
        setCurrentFrame(null);
        setVideoUrl(null);
        setStereoVideoUrls(null);
        setAudioUrl(null);
        setAudioDescription(null);
        try {
            const base64Image = await generateInitialImage(prompt);
            setCurrentFrame(`data:image/jpeg;base64,${base64Image}`);
            setInitialPrompt(prompt);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to generate image: ${message}`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Fix: Prefix hooks with React.
    const handleAction = React.useCallback(async (action: CameraAction) => {
        if (!currentFrame || isLoading) return;

        setIsLoading(true);
        setError(null);
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        if (stereoVideoUrls) {
            URL.revokeObjectURL(stereoVideoUrls.left);
            URL.revokeObjectURL(stereoVideoUrls.right);
        }
        setVideoUrl(null);
        setStereoVideoUrls(null);

        try {
            if (isStereo) {
                const urls = await generateStereoVideo(currentFrame, action, animationPrompt || undefined, setLoadingMessage, isStyleLocked);
                setStereoVideoUrls(urls);
            } else {
                const url = await generateNextVideo(currentFrame, action, animationPrompt || undefined, setLoadingMessage, isStyleLocked);
                setVideoUrl(url);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'An unknown error occurred during video generation.';
            setError(message);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [currentFrame, isLoading, isStereo, animationPrompt, isStyleLocked, videoUrl, stereoVideoUrls]);

    // Fix: Prefix hooks with React.
    const processActionQueue = React.useCallback(() => {
        if (actionQueue.length > 0) {
            const nextAction = actionQueue.shift();
            if (nextAction) {
                handleAction(nextAction);
            }
        }
    }, [actionQueue, handleAction]);
    
    const handlePresetSelect = (key: string) => {
        if (isLoading) return;
        const actions = PRESET_MOVEMENTS[key];
        if (actions) {
            actionQueue.push(...actions);
            processActionQueue();
        }
    };

    // Fix: Prefix hooks with React.
    const handleVideoEnd = React.useCallback((lastFrameDataUrl: string) => {
        setCurrentFrame(lastFrameDataUrl);
        
        setIsLoading(false);

        if (actionQueue.length > 0) {
             processActionQueue();
        }
    }, [actionQueue, processActionQueue]);

    const handleModeChange = (mode: AppMode) => {
        if (isReady) {
            setAppMode(mode);
            setEditPrompt('');
        }
    };
    
    const handleEdit = async () => {
        if (!currentFrame || !editPrompt.trim() || isLoading) return;
        
        setIsLoading(true);
        setLoadingMessage("Applying your edit...");
        setError(null);
        
        try {
            const newImage = await editImage(currentFrame, editPrompt);
            setCurrentFrame(newImage);
            setAppMode(AppMode.CAMERA);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to edit image: ${message}`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveWorld = () => {
        if (!currentFrame || !initialPrompt) return;
        const name = window.prompt("Enter a name for this world:", initialPrompt.substring(0, 30));
        if (name) {
            const newWorld: SavedWorld = {
                id: crypto.randomUUID(),
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
        setInitialPrompt(world.name);
        setPrompt(world.name);
        setIsLibraryOpen(false);
        setVideoUrl(null);
        setStereoVideoUrls(null);
        setAudioUrl(null);
        setError(null);
        setAppMode(AppMode.CAMERA);
    };

    const handleDeleteWorld = (worldId: string) => {
        if (window.confirm("Are you sure you want to delete this world?")) {
            deleteWorld(worldId);
            setSavedWorlds(getSavedWorlds());
        }
    };
    
     const handleAddAmbiance = async () => {
        if (!initialPrompt || isGeneratingAudio || isLoading) return;
        setIsGeneratingAudio(true);
        setError(null);
        try {
            const description = await generateAudioDescription(initialPrompt);
            setAudioDescription(description);
            const url = await generateAmbientSoundtrack(description);
            setAudioUrl(url);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to generate audio: ${message}`);
            console.error(err);
        } finally {
            setIsGeneratingAudio(false);
        }
    };
    
    const handleImprovisePrompt = async () => {
        if (!prompt.trim() || isLoading || isImprovising) return;
        setIsImprovising(true);
        setError(null);
        try {
            const improvised = await improvisePrompt(prompt);
            setPrompt(improvised);
        } catch (err) {
             const message = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to improvise prompt: ${message}`);
            console.error(err);
        } finally {
            setIsImprovising(false);
        }
    };

    const renderInitialView = () => (
        <div className="w-full h-full flex items-center justify-center p-4">
            {isLibraryOpen && (
                <AssetLibrary 
                    worlds={savedWorlds} 
                    onLoad={handleLoadWorld} 
                    onDelete={handleDeleteWorld} 
                    onClose={() => setIsLibraryOpen(false)}
                />
            )}
            <div className="w-full max-w-lg bg-brand-dark-secondary rounded-2xl shadow-lg p-8 flex flex-col items-center animate-fadeInScaleUp">
                <h1 className="text-3xl font-bold text-white text-center mb-2">AI World Builder</h1>
                <p className="text-md text-slate-300 text-center mb-6">
                    Describe your world and let AI create it for you.
                </p>
                <div className="w-full flex flex-row items-center justify-center gap-3">
                    <input
                        type="text"
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        placeholder="Describe your world..."
                        className="flex-1 px-4 py-3 rounded-lg border border-slate-700 bg-brand-dark text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                    <InfoTooltip />
                    <button
                        onClick={handleGenerateInitialImage}
                        className="px-6 py-3 bg-gradient-to-r from-brand-primary to-indigo-600 text-white font-bold rounded-lg shadow hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
                        disabled={isLoading || isImprovising || !prompt.trim()}
                    >
                        {isLoading ? "Generating..." : "Generate"}
                    </button>
                </div>
                {savedWorlds.length > 0 && (
                    <button onClick={() => setIsLibraryOpen(true)} className="mt-6 text-slate-400 hover:text-white underline text-sm">
                        Or load a saved world
                    </button>
                )}
            </div>
        </div>
    );

    const renderWorldView = () => (
        <div className="w-full h-full relative flex flex-col bg-brand-dark-secondary">
            {error && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl">
                     <ErrorDisplay message={error} onDismiss={dismissError} />
                </div>
            )}
            
            {isLibraryOpen && (
                <AssetLibrary 
                    worlds={savedWorlds} 
                    onLoad={handleLoadWorld} 
                    onDelete={handleDeleteWorld} 
                    onClose={() => setIsLibraryOpen(false)}
                />
            )}
            
            {/* The main content area that will be "under" the fixed controls */}
            <div className="flex-grow w-full h-full">
                <VideoDisplay
                    videoUrl={videoUrl}
                    stereoVideoUrls={stereoVideoUrls}
                    audioUrl={audioUrl}
                    frameUrl={currentFrame}
                    onVideoEnd={handleVideoEnd}
                    isLoading={isLoading}
                    isReady={isReady}
                    isStereo={isStereo}
                    onSave={handleSaveWorld}
                    onAddAmbiance={handleAddAmbiance}
                    isGeneratingAudio={isGeneratingAudio}
                    audioDescription={audioDescription}
                />
            </div>

            {isLoading && <Loader message={loadingMessage} />}
            
            {/* The fixed control bar that is always visible at the bottom of the viewport */}
            <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center py-3 bg-gradient-to-t from-black/50 to-transparent animate-fadeIn">
                <div className="p-2 bg-brand-dark/40 backdrop-blur-sm rounded-full flex items-center gap-4 shadow-lg border border-slate-700/50">
                    <ModeToggle currentMode={appMode} onModeChange={handleModeChange} isDisabled={!isReady} />
                    <div className="w-px h-8 bg-slate-600" />
                    {appMode === AppMode.CAMERA ? (
                        <div className="flex items-center gap-3">
                            <Controls onAction={handleAction} isDisabled={!isReady} />
                            <PresetSelector presets={PRESET_MOVEMENTS} onSelect={handlePresetSelect} isDisabled={!isReady} />
                            <AnimationControls prompt={animationPrompt} setPrompt={setAnimationPrompt} isDisabled={!isReady} />
                            <StereoToggle isEnabled={isStereo} onToggle={setIsStereo} isDisabled={!isReady} />
                        </div>
                    ) : (
                        <SceneEditor
                            prompt={editPrompt}
                            setPrompt={setEditPrompt}
                            onEdit={handleEdit}
                            onCancel={() => setAppMode(AppMode.CAMERA)}
                            isDisabled={!isReady}
                        />
                    )}
                </div>
            </div>
        </div>
    );

    return (
      <div className="w-full h-full flex flex-col bg-brand-dark-secondary">
        {currentFrame ? renderWorldView() : renderInitialView()}
      </div>
    );
};

export default WorldBuilder;
