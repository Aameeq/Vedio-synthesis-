import React, { useState } from 'react';
import { SavedWorld } from '../types';
import Loader from './Loader';

interface TransitionCreatorModalProps {
    fromWorld: SavedWorld;
    toWorld: SavedWorld;
    onClose: () => void;
    onGenerate: (prompt: string) => void;
    isLoading: boolean;
    loadingMessage: string;
}

const TransitionCreatorModal: React.FC<TransitionCreatorModalProps> = ({ fromWorld, toWorld, onClose, onGenerate, isLoading, loadingMessage }) => {
    const [prompt, setPrompt] = useState<string>('A quick dolly zoom');

    const handleGenerateClick = () => {
        if (prompt.trim()) {
            onGenerate(prompt);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
            <div className="bg-brand-dark w-full max-w-2xl rounded-lg shadow-2xl flex flex-col relative animate-fadeInScaleUp" onClick={(e) => e.stopPropagation()}>
                {isLoading && <Loader message={loadingMessage} />}
                <header className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Create Transition</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </header>
                <main className="p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-center gap-4">
                        <div className="w-1/2 text-center">
                            <h3 className="text-sm font-semibold text-brand-text-secondary mb-2">From</h3>
                            <img src={fromWorld.imageData} alt={fromWorld.name} className="w-full aspect-video object-cover rounded-md" />
                            <p className="text-xs text-brand-text-secondary mt-1 truncate">{fromWorld.name}</p>
                        </div>
                        <div className="text-2xl text-brand-text-secondary">&rarr;</div>
                        <div className="w-1/2 text-center">
                             <h3 className="text-sm font-semibold text-brand-text-secondary mb-2">To</h3>
                             <img src={toWorld.imageData} alt={toWorld.name} className="w-full aspect-video object-cover rounded-md" />
                             <p className="text-xs text-brand-text-secondary mt-1 truncate">{toWorld.name}</p>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="transition-prompt" className="block text-sm font-medium text-brand-text-secondary mb-1">
                           Describe the transition style:
                        </label>
                        <textarea
                            id="transition-prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., A fast whip pan, a slow dreamlike fade..."
                            className="w-full h-24 p-2 bg-gray-800 border-2 border-gray-700 rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-50"
                            disabled={isLoading}
                        />
                    </div>
                </main>
                <footer className="p-4 border-t border-gray-700 text-right">
                     <button
                        onClick={handleGenerateClick}
                        disabled={!prompt.trim() || isLoading}
                        className="px-6 py-2 bg-brand-primary text-white font-bold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-50"
                    >
                        Generate Transition
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default TransitionCreatorModal;