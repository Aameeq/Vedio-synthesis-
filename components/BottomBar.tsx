import React from 'react';
import { AppMode, CameraAction } from '../types';
import { PRESET_MOVEMENTS } from '../constants';

// For now, these are commented out as they are not used in Step 1
// import ModeToggle from './ModeToggle';
// import Controls from './Controls';
// import PresetSelector from './PresetSelector';
// import SceneEditor from './SceneEditor';
// import StereoToggle from './StereoToggle';
// import AnimationControls from './AnimationControls';

interface BottomBarProps {
  stage: 'initial' | 'director';
  // Initial Props
  prompt: string;
  setPrompt: (prompt: string) => void;
  onGenerate: () => void;
  styleReferenceImage: string | null;
  onStyleImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  // Director Props
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  animationPrompt: string;
  setAnimationPrompt: (prompt: string) => void;
  onAction: (action: CameraAction) => void;
  onPresetSelect: (key: string) => void;
  editPrompt: string;
  setEditPrompt: (prompt: string) => void;
  onEdit: () => void;
  isStereoMode: boolean;
  onStereoToggle: (isEnabled: boolean) => void;
  appIsBusy: boolean;
}

const InitialStage: React.FC<Partial<BottomBarProps>> = ({ prompt, setPrompt, onGenerate, onStyleImageChange, appIsBusy }) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onGenerate?.();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex items-center gap-3">
        <label 
            htmlFor="style-image-upload" 
            className="w-11 h-11 flex-shrink-0 flex items-center justify-center bg-brand-dark-tertiary text-slate-400 rounded-lg hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
            title="Add style reference"
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        </label>
        <input id="style-image-upload" type="file" accept="image/*" onChange={onStyleImageChange} className="hidden" />
        
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt?.(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe your world..."
          className="w-full h-11 px-5 bg-brand-dark-tertiary border border-transparent rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary placeholder:text-slate-500"
          aria-label="World description prompt"
        />
        <button
            onClick={onGenerate}
            disabled={!prompt?.trim() || appIsBusy}
            className="px-5 h-11 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-dark-secondary focus:ring-brand-primary transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 flex-shrink-0"
        >
            Generate
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
        </button>
    </div>
  );
};

const DirectorStage: React.FC<Partial<BottomBarProps>> = (props) => {
    // This will be implemented in Step 2.
    // For now, it returns a placeholder to avoid breaking the app.
    return <div className="text-center text-slate-400">Director Mode UI will be implemented next.</div>;
};

const BottomBar: React.FC<BottomBarProps> = (props) => {
  return (
    <div className="absolute bottom-4 left-4 right-4 z-20 animate-fadeIn">
        <div className="w-full bg-black/30 backdrop-blur-md rounded-2xl shadow-2xl p-3 border border-slate-700/50">
          {props.stage === 'initial' ? <InitialStage {...props} /> : <DirectorStage {...props} />}
        </div>
    </div>
  );
};

export default BottomBar;