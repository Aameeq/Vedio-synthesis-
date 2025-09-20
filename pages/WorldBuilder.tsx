import React, { useState } from 'react';
import { generateInitialImage } from '../services/geminiService';
import ErrorDisplay from '../components/ErrorDisplay';

const WorldBuilder: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);


  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    setPreviewSrc(null);
    try {
        const imageB64 = await generateInitialImage(prompt);
        setPreviewSrc(`data:image/jpeg;base64,${imageB64}`);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to generate world: ${message}`);
        console.error(err);
    } finally {
        setIsGenerating(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !isGenerating && prompt.trim()) {
      event.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 animate-fadeIn">
       {error && <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-md"><ErrorDisplay message={error} onDismiss={() => setError(null)} /></div>}
      <div className="w-full max-w-4xl bg-brand-dark-secondary rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col items-center gap-6 border border-slate-700/50">
        <div className="w-full aspect-video bg-black rounded-xl flex items-center justify-center relative overflow-hidden">
          {previewSrc ? (
            <img src={previewSrc} alt="Generated world preview" className="w-full h-full object-contain rounded-xl animate-fadeIn" />
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full opacity-60 text-center text-slate-500 p-4">
               <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              <span className="text-lg">Your generated world will appear here</span>
            </div>
          )}
          {isGenerating && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-xl">
               <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-brand-primary mt-4 text-lg font-bold animate-pulse">Generating...</span>
               </div>
            </div>
          )}
        </div>
        <div className="w-full flex flex-row items-center gap-4">
          <input
            type="text"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your world..."
            disabled={isGenerating}
            className="w-full h-12 px-5 bg-brand-dark-tertiary border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary placeholder:text-slate-500 disabled:opacity-50"
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl shadow-md hover:scale-105 transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? '...' : 'Generate'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorldBuilder;
