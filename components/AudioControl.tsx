// Fix: Changed React import to a namespace import to resolve JSX intrinsic element errors.
import * as React from 'react';

interface AudioControlProps {
  onGenerateAudio: () => void;
  isGenerating: boolean;
  isDisabled: boolean;
  audioDescription: string | null;
}

const AudioControl: React.FC<AudioControlProps> = ({ onGenerateAudio, isGenerating, isDisabled, audioDescription }) => {
  const finalDisabledState = isGenerating || isDisabled;
  
  return (
    <div className="relative group">
      <button
        onClick={onGenerateAudio}
        disabled={finalDisabledState}
        className="relative flex items-center justify-center p-3 bg-black/50 text-slate-300 rounded-full transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-brand-primary/80 hover:enabled:text-white"
        aria-label={isGenerating ? "Generating Ambiance..." : "Add Ambiance"}
        title={isGenerating ? "Generating Ambiance..." : "Add Ambiance"}
      >
        {isGenerating ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.636 5.636a9 9 0 0112.728 0m-9.9-2.828a5 5 0 017.072 0"></path></svg>
        )}
      </button>
      {audioDescription && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-brand-dark-secondary text-slate-300 text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {audioDescription}
        </div>
      )}
    </div>
  );
};

export default AudioControl;
