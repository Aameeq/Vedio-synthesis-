import React from 'react';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onGenerate: () => void;
  isDisabled: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, onGenerate, isDisabled }) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !isDisabled && prompt.trim()) {
      event.preventDefault();
      onGenerate();
    }
  };

  return (
    <input
      type="text"
      value={prompt}
      onChange={(e) => setPrompt(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="Describe your world..."
      disabled={isDisabled}
      className="w-full h-12 px-5 bg-brand-dark-tertiary border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary placeholder:text-slate-500 disabled:opacity-50"
      aria-label="World description prompt"
    />
  );
};

export default PromptInput;
