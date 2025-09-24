// Fix: Change React import to namespace import to resolve JSX typing issues.
import * as React from 'react';

interface SceneEditorProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onEdit: () => void;
  onCancel: () => void;
  isDisabled: boolean;
}

const SceneEditor: React.FC<SceneEditorProps> = ({ prompt, setPrompt, onEdit, onCancel, isDisabled }) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onEdit();
    }
  };

  return (
    <div className="w-full max-w-2xl flex items-center gap-3">
        <button
            onClick={onCancel}
            disabled={isDisabled}
            className="px-4 py-3 bg-slate-700 text-white font-bold rounded-full hover:bg-slate-600 focus:outline-none disabled:opacity-50"
            aria-label="Cancel edit"
        >
          &times;
        </button>
        <input
            id="scene-editor-input"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your edit... e.g., 'add a red car'"
            disabled={isDisabled}
            className="flex-grow h-12 px-5 bg-slate-700/50 border border-transparent text-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all disabled:opacity-50"
            autoFocus
        />
        <button
            onClick={onEdit}
            disabled={isDisabled || !prompt.trim()}
            className="px-6 py-3 bg-brand-primary text-white font-bold rounded-full hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-dark-secondary focus:ring-brand-primary transition-transform duration-150 ease-in-out hover:scale-105 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            Apply
        </button>
    </div>
  );
};

export default SceneEditor;
