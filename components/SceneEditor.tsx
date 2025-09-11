import React from 'react';

interface SceneEditorProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onEdit: () => void;
  isDisabled: boolean;
}

const SceneEditor: React.FC<SceneEditorProps> = ({ prompt, setPrompt, onEdit, isDisabled }) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onEdit();
    }
  };

  return (
    <div className="w-full max-w-xs flex flex-col items-center gap-2 text-center">
      <div className="w-full flex gap-2">
        <input
          id="scene-editor-input"
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., 'add a red car'"
          disabled={isDisabled}
          className="flex-grow bg-gray-700 border-2 border-gray-600 text-brand-text rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all disabled:opacity-50"
        />
        <button
          onClick={onEdit}
          disabled={isDisabled || !prompt.trim()}
          className="px-5 py-2 bg-brand-primary text-white font-bold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-brand-primary transition-transform duration-150 ease-in-out hover:scale-105 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default SceneEditor;
