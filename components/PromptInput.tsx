
import React from 'react';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onGenerate: () => void;
}

const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, onGenerate }) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onGenerate();
    }
  };

  return (
    <div className="w-full h-full p-8 flex flex-col items-center justify-center bg-gray-900">
      <h2 className="text-2xl font-semibold mb-4 text-brand-text">Describe Your Starting World</h2>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="e.g., A photorealistic empty street in a futuristic city..."
        className="w-full max-w-2xl h-32 p-3 bg-brand-dark border-2 border-gray-700 rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
      />
      <button
        onClick={onGenerate}
        className="mt-6 px-8 py-3 bg-brand-primary text-white font-bold rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-dark focus:ring-brand-primary transition-transform duration-150 ease-in-out hover:scale-105 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Generate World
      </button>
    </div>
  );
};

export default PromptInput;
