// Fix: Switched to a namespace import 'import * as React' to resolve widespread JSX typing errors.
import * as React from 'react';

interface AnimationControlsProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  isDisabled: boolean;
}

const AnimationControls: React.FC<AnimationControlsProps> = ({ prompt, setPrompt, isDisabled }) => {
  return (
    <div className="relative">
      <input
        id="animation-prompt-input"
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Scene Animation..."
        disabled={isDisabled}
        className="w-52 h-12 px-5 bg-slate-700/50 border border-transparent text-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all disabled:opacity-50 text-center text-sm placeholder:text-slate-400"
        aria-label="Scene animation prompt"
        title="Describe animation in the scene (e.g., clouds drift slowly)"
      />
    </div>
  );
};

export default AnimationControls;