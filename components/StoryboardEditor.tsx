import React from 'react';
import { SavedWorld } from '../types';

type TransitionState = {
    [fromWorldId: string]: {
        prompt: string;
        videoUrl?: string;
        toWorldId: string;
        isLoading: boolean;
    };
};

interface StoryboardEditorProps {
    storyboard: SavedWorld[];
    transitions: TransitionState;
    onAddWorldClick: () => void;
    onRemoveWorld: (worldId: string) => void;
    onOpenTransitionCreator: (from: SavedWorld, to: SavedWorld) => void;
    onPlayTransition: (videoUrl: string) => void;
    onPlaySequence: () => void;
    isBusy: boolean;
    isRendering: boolean;
    onRenderSequence: () => void;
}

const KeyframeNode: React.FC<{ world: SavedWorld; onRemove: () => void; }> = ({ world, onRemove }) => (
    <div className="flex-shrink-0 w-48 bg-gray-800 rounded-lg shadow-md flex flex-col text-center relative group">
        <button 
            onClick={onRemove}
            className="absolute -top-2 -right-2 z-10 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Remove from storyboard"
        >
            &times;
        </button>
        <img src={world.imageData} alt={world.name} className="w-full h-24 object-cover rounded-t-lg" />
        <div className="p-2">
            <p className="text-xs font-semibold text-brand-text truncate">{world.name}</p>
        </div>
    </div>
);

const TransitionNode: React.FC<{
    transition?: TransitionState[string];
    onOpenCreator: () => void;
    onPlay: () => void;
}> = ({ transition, onOpenCreator, onPlay }) => {
    if (transition?.isLoading) {
        return (
             <div className="flex-shrink-0 w-32 h-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    if (transition?.videoUrl) {
         return (
             <div 
                className="flex-shrink-0 w-32 flex flex-col items-center justify-center group relative cursor-pointer"
                onClick={onPlay}
            >
                <div className="w-full h-16 relative rounded-md overflow-hidden shadow-lg">
                    <video src={transition.videoUrl} className="w-full h-full object-cover bg-black" loop muted autoPlay playsInline />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 flex items-center justify-center transition-all duration-300">
                        <svg className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-all transform scale-50 group-hover:scale-100 duration-300 ease-in-out" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
                <p className="text-white text-xs text-center p-1 mt-1 truncate w-full" title={transition.prompt}>{transition.prompt}</p>
            </div>
        )
    }

    return (
        <div className="flex-shrink-0 w-32 flex items-center justify-center">
            <button
                onClick={onOpenCreator}
                className="w-10 h-10 bg-gray-700 text-brand-text-secondary rounded-full flex items-center justify-center text-2xl font-light hover:bg-brand-primary hover:text-white transition-colors"
                aria-label="Add transition"
            >
                +
            </button>
        </div>
    );
}

const StoryboardEditor: React.FC<StoryboardEditorProps> = ({
    storyboard,
    transitions,
    onAddWorldClick,
    onRemoveWorld,
    onOpenTransitionCreator,
    onPlayTransition,
    onPlaySequence,
    isBusy,
    isRendering,
    onRenderSequence,
}) => {
    const isRenderable = storyboard.length >= 2 && 
        storyboard.slice(0, -1).every(world => transitions[world.id]?.videoUrl);
    
    const isAnythingBusy = isBusy || isRendering;
        
    return (
        <div className="w-full h-full flex flex-col bg-gray-900 border-2 border-gray-700 rounded-lg p-4">
            <div className="flex-shrink-0 mb-4 flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-brand-text">AI Storyboard</h2>
                    <p className="text-sm text-brand-text-secondary">Sequence your worlds and generate AI transitions between them.</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    <button
                        onClick={onPlaySequence}
                        disabled={!isRenderable || isAnythingBusy}
                        className="px-6 py-2 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Preview Storyboard
                    </button>
                     <button
                        onClick={onRenderSequence}
                        disabled={!isRenderable || isAnythingBusy}
                        className="px-6 py-2 bg-brand-primary text-white font-bold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isRendering ? 'Rendering...' : 'Render Video'}
                    </button>
                </div>
            </div>
            
            <div className="flex-grow w-full flex items-center border border-gray-700 bg-brand-dark rounded-lg p-4 overflow-x-auto min-h-[200px]">
                <div className="flex items-center h-full gap-2">
                    {storyboard.map((world, index) => (
                        <React.Fragment key={world.id}>
                            <KeyframeNode world={world} onRemove={() => onRemoveWorld(world.id)} />
                            {index < storyboard.length - 1 && (
                                <TransitionNode
                                    transition={transitions[world.id]}
                                    onOpenCreator={() => onOpenTransitionCreator(world, storyboard[index + 1])}
                                    onPlay={() => transitions[world.id]?.videoUrl && onPlayTransition(transitions[world.id]!.videoUrl!)}
                                />
                            )}
                        </React.Fragment>
                    ))}
                     <button
                        onClick={onAddWorldClick}
                        disabled={isAnythingBusy}
                        className="flex-shrink-0 w-48 h-full border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-brand-text-secondary hover:bg-gray-800 hover:border-brand-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="text-4xl font-thin">+</span>
                        <span className="text-sm mt-1">Add World from Library</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StoryboardEditor;