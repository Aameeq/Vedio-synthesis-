import React from 'react';

interface AnimationControlsProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  isDisabled: boolean;
}

const AnimationControls: React.FC<AnimationControlsProps> = ({ prompt, setPrompt, isDisabled }) => {
  return (
    <div className="w-full flex flex-col items-center gap-2 text-center">
      <label htmlFor="animation-prompt-input" className="text-sm font-semibold text-brand-text-secondary self-start">
        Scene Animation
      </label>
      <input
        id="animation-prompt-input"
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g., 'make the clouds drift'"
        disabled={isDisabled}
        className="w-full bg-gray-700 border-2 border-gray-600 text-brand-text rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all disabled:opacity-50"
        aria-label="Scene animation prompt"
      />
    </div>
  );
};

export default AnimationControls;
