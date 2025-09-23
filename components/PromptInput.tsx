import React from 'react';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onGenerate: () => void;
  isDisabled: boolean;
  onImprovise: () => void;
  isImprovising: boolean;
  centerPlaceholder?: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, onGenerate, isDisabled, onImprovise, isImprovising, centerPlaceholder }) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !isDisabled && prompt.trim()) {
      event.preventDefault();
      onGenerate();
    }
  };
  
  const finalDisabledState = isDisabled || isImprovising;

  const inputClassName = [
    "w-full h-12 pl-5 pr-12 bg-brand-dark-tertiary border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary placeholder:text-slate-500 disabled:opacity-50",
    centerPlaceholder && "placeholder:text-center"
  ].filter(Boolean).join(" ");

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Describe your world..."
        disabled={finalDisabledState}
        className={inputClassName}
        aria-label="World description prompt"
      />
      <div className="absolute top-1/2 right-3 -translate-y-1/2">
        <button
          onClick={onImprovise}
          disabled={finalDisabledState || !prompt.trim()}
          className="p-1.5 text-slate-400 rounded-full hover:bg-slate-700 hover:text-white disabled:hover:bg-transparent disabled:cursor-not-allowed disabled:text-slate-600 transition-colors"
          title="Improvise Prompt"
          aria-label="Improvise Prompt"
        >
          {isImprovising ? (
            <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2.5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0V4.382l-1.63 1.25a.75.75 0 01-.91-1.18l3-2.25a.75.75 0 01.79-.002zM3.404 4.87a.75.75 0 011.06 0l1.25 1.25a.75.75 0 01-1.06 1.06L3.404 5.93a.75.75 0 010-1.06zM15.13 3.404a.75.75 0 010 1.06l-1.25 1.25a.75.75 0 11-1.06-1.06l1.25-1.25a.75.75 0 011.06 0zM10 17.5a.75.75 0 01-.75-.75v-3.5a.75.75 0 011.5 0v2.618l1.63-1.25a.75.75 0 11.91 1.18l-3 2.25a.75.75 0 01-.79.002zM4.87 16.596a.75.75 0 01-1.06 0l-1.25-1.25a.75.75 0 011.06-1.06l1.25 1.25a.75.75 0 010 1.06zM16.596 15.13a.75.75 0 010-1.06l1.25-1.25a.75.75 0 111.06 1.06l-1.25 1.25a.75.75 0 01-1.06 0zM3.25 10a.75.75 0 01.75-.75h3.5a.75.75 0 010 1.5H4.882l1.25 1.63a.75.75 0 11-1.18.91l-2.25-3a.75.75 0 01.002-.79zM16.75 10a.75.75 0 01-.75.75h-3.5a.75.75 0 010-1.5h2.618l-1.25-1.63a.75.75 0 111.18-.91l2.25 3a.75.75 0 01-.002.79z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default PromptInput;