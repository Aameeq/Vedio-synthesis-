import React from 'react';

interface AudioControlProps {
  onGenerateAudio: () => void;
  isDisabled: boolean;
}

const AudioControl: React.FC<AudioControlProps> = ({ onGenerateAudio, isDisabled }) => (
  <button
    onClick={onGenerateAudio}
    disabled={isDisabled}
    className="absolute top-4 right-4 z-10 px-4 py-2 bg-black bg-opacity-60 text-white font-bold rounded-lg hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    aria-label="Generate and play ambient audio"
  >
    {isDisabled ? 'Ambiance On' : 'Add Ambiance'}
  </button>
);

export default AudioControl;
