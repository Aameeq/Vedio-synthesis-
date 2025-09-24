// Fix: Changed React import to a namespace import to resolve JSX intrinsic element errors.
import * as React from 'react';
import {
    generateInitialImage,
    improvisePrompt
} from '../services/geminiService';
import { getSavedWorlds, saveWorld, deleteWorld } from '../utils/worldManager';
import { SavedWorld } from '../types';
import VideoDisplay from '../components/VideoDisplay';
import Loader from '../components/Loader';
import ErrorDisplay from '../components/ErrorDisplay';
import AssetLibrary from '../components/AssetLibrary';
import Placeholder from '../components/Placeholder';


const WorldBuilder: React.FC = () => {
    // Input & Prompts State
    const [prompt, setPrompt] = React.useState<string>('');
    const [initialPrompt, setInitialPrompt] = React.useState<string>('');

    // Loading & Error State
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [isImprovising, setIsImprovising] = React.useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = React.useState<string>('');
    const [error, setError] = React.useState<string | null>(null);

    // Media & Scene State
    const [currentFrame, setCurrentFrame] = React.useState<string | null>(null);
    const [videoUrl, setVideoUrl] = React.useState<string | null>(null);
    const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
    const [audioDescription, setAudioDescription] = React.useState<string | null>(null);
    const [isGeneratingAudio, setIsGeneratingAudio] = React.useState<boolean>(false);

    // Library & Tools State
    const [savedWorlds, setSavedWorlds] = React.useState<SavedWorld[]>([]);
    const [isLibraryOpen, setIsLibraryOpen] = React.useState<boolean>(false);
    
    // Mock data for checkpoint history based on the screenshot
    const [checkpoints, setCheckpoints] = React.useState(Array(12).fill(true));

    const isReady = !!currentFrame && !isLoading;
    
    // Cleanup old video URLs to prevent memory leaks
    React.useEffect(() => {
        return () => {
            if (videoUrl) URL.revokeObjectURL(videoUrl);
        };
    }, [videoUrl]);
    
    const dismissError = () => setError(null);

    // Load saved worlds on mount and set up global event listeners
    React.useEffect(() => {
        setSavedWorlds(getSavedWorlds());
        const handleOpenLibrary = () => setIsLibraryOpen(true);
        document.addEventListener('open-library', handleOpenLibrary);

        return () => {
            document.removeEventListener('open-library', handleOpenLibrary);
        };
    }, []);

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

    const handleVideoEnd = React.useCallback((lastFrameDataUrl: string) => {
        setCurrentFrame(lastFrameDataUrl);
        setIsLoading(false);
    }, []);


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
        setAudioUrl(null);
        setError(null);
    };

    const handleDeleteWorld = (worldId: string) => {
        if (window.confirm("Are you sure you want to delete this world?")) {
            deleteWorld(worldId);
            setSavedWorlds(getSavedWorlds());
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
    
    const handleAddNewPrompt = () => {
      // For now, this just clears the prompt. In a real app, it would create a new history item.
      setPrompt('');
      // In a real implementation, you might want to focus the textarea.
      // document.getElementById('prompt-textarea')?.focus();
    };

    const CheckpointList = () => (
      <div className="flex-shrink-0 pr-2">
        <ul className="space-y-2">
          {checkpoints.map((_, index) => (
            <li key={index} className="flex items-center gap-2">
              <span className="w-5 h-5 flex items-center justify-center bg-green-500/20 rounded-full">
                <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
              </span>
            </li>
          ))}
        </ul>
        <div className="text-xs text-slate-400 my-2 pl-1">Checkpoint</div>
      </div>
    );

    return (
      <div className="w-full h-full flex flex-row bg-brand-dark-secondary">
        {isLibraryOpen && (
            <AssetLibrary 
                worlds={savedWorlds} 
                onLoad={handleLoadWorld} 
                onDelete={handleDeleteWorld} 
                onClose={() => setIsLibraryOpen(false)}
            />
        )}

        {/* Left Sidebar */}
        <div className="w-80 h-full flex-shrink-0 bg-brand-dark p-3 flex flex-col gap-4 border-r border-slate-800">
            <div className="flex-grow flex flex-row overflow-y-auto">
                <CheckpointList />
                <div className="flex-grow flex flex-col">
                    <div className="text-sm text-slate-300 font-semibold mb-2 ml-1">Prompt</div>
                    <textarea
                        id="prompt-textarea"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="A serene, mystical forest at twilight..."
                        disabled={isLoading}
                        className="w-full flex-grow bg-transparent text-slate-300 text-sm p-1 focus:outline-none resize-none"
                    />
                     {isLoading && <div className="text-xs text-yellow-400 animate-pulse mt-2">Initial Loading...</div>}
                </div>
                <button
                    onClick={handleImprovisePrompt}
                    disabled={isLoading || isImprovising || !prompt.trim()}
                    className="p-1.5 text-slate-400 rounded-full hover:bg-slate-700 hover:text-white disabled:hover:bg-transparent disabled:cursor-not-allowed disabled:text-slate-600 transition-colors self-start ml-2"
                    title="Improvise Prompt"
                >
                    {isImprovising ? (
                        <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                         <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2.5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0V4.382l-1.63 1.25a.75.75 0 01-.91-1.18l3-2.25a.75.75 0 01.79-.002zM3.404 4.87a.75.75 0 011.06 0l1.25 1.25a.75.75 0 01-1.06 1.06L3.404 5.93a.75.75 0 010-1.06zM15.13 3.404a.75.75 0 010 1.06l-1.25 1.25a.75.75 0 11-1.06-1.06l1.25-1.25a.75.75 0 011.06 0zM10 17.5a.75.75 0 01-.75-.75v-3.5a.75.75 0 011.5 0v2.618l1.63-1.25a.75.75 0 11.91 1.18l-3 2.25a.75.75 0 01-.79.002zM4.87 16.596a.75.75 0 01-1.06 0l-1.25-1.25a.75.75 0 011.06-1.06l1.25 1.25a.75.75 0 010 1.06zM16.596 15.13a.75.75 0 010-1.06l1.25-1.25a.75.75 0 111.06 1.06l-1.25 1.25a.75.75 0 01-1.06 0zM3.25 10a.75.75 0 01.75-.75h3.5a.75.75 0 010 1.5H4.882l1.25 1.63a.75.75 0 11-1.18.91l-2.25-3a.75.75 0 01.002-.79zM16.75 10a.75.75 0 01-.75.75h-3.5a.75.75 0 010-1.5h2.618l-1.25-1.63a.75.75 0 111.18-.91l2.25 3a.75.75 0 01-.002.79z" clipRule="evenodd" /></svg>
                    )}
                </button>
            </div>
            <div className="flex-shrink-0 flex items-center justify-between">
                <button 
                  onClick={handleAddNewPrompt}
                  disabled={isLoading}
                  className="p-2 text-slate-400 hover:text-white disabled:opacity-50"
                  title="New Prompt"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                </button>
                 <button 
                  onClick={handleGenerateInitialImage}
                  disabled={isLoading || !prompt.trim()}
                  className="p-2 text-slate-400 hover:text-white disabled:opacity-50"
                  title="Generate"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                </button>
            </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow w-full h-full relative">
            {error && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl">
                     <ErrorDisplay message={error} onDismiss={dismissError} />
                </div>
            )}
            
            {currentFrame ? (
                <VideoDisplay
                    videoUrl={videoUrl}
                    audioUrl={audioUrl}
                    frameUrl={currentFrame}
                    onVideoEnd={handleVideoEnd}
                    isLoading={isLoading}
                    isReady={isReady}
                    isStereo={false} // Feature removed from this UI
                    onSave={handleSaveWorld}
                    onAddAmbiance={() => {}} // Feature removed from this UI
                    isGeneratingAudio={isGeneratingAudio}
                    audioDescription={audioDescription}
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    {isLoading ? null : <Placeholder />}
                </div>
            )}


            {isLoading && !currentFrame && <Loader message={loadingMessage} />}
        </div>
      </div>
    );
};

export default WorldBuilder;
