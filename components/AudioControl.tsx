import React from 'react';

interface AudioControlProps {
  onGenerateAudio: () => void;
  isAudioOn: boolean;
  isGenerating: boolean;
  isDisabled: boolean;
  audioDescription: string | null;
}

const AudioControl: React.FC<AudioControlProps> = ({ onGenerateAudio, isAudioOn, isGenerating, isDisabled, audioDescription }) => {
  const finalDisabledState = isAudioOn || isGenerating || isDisabled;
  
  const getButtonText = () => {
    if (isGenerating) return 'Generating...';
    if (isAudioOn) return 'Ambiance On';
    return 'Add Ambiance';
  };

  return (
    <div className="absolute top-4 right-4 z-20 group">
      <button
        onClick={onGenerateAudio}
        disabled={finalDisabledState}
        className="px-4 py-2 bg-black bg-opacity-60 text-white font-bold rounded-lg hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Generate and play ambient audio"
      >
        {getButtonText()}
      </button>
      {audioDescription && (
        <div className="absolute top-full right-0 mt-2 w-72 p-3 bg-gray-900 border border-gray-700 text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <p className="font-bold text-brand-text-secondary mb-1">Sound Design Prompt:</p>
          <p className="text-xs whitespace-pre-wrap">{audioDescription}</p>
        </div>
      )}
    </div>
  );
};

export default AudioControl;