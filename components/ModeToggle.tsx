// Fix: Change React import to namespace import to resolve JSX typing issues.
import * as React from 'react';
import { AppMode } from '../types';

interface ModeToggleProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  isDisabled: boolean;
}

const ModeToggle: React.FC<ModeToggleProps> = ({ currentMode, onModeChange, isDisabled }) => {
  const getButtonClasses = (mode: AppMode) => {
    const isActive = currentMode === mode;
    return `w-32 py-3 text-sm font-bold rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-dark-secondary focus:ring-brand-primary ${
      isActive
        ? 'bg-brand-primary text-white shadow-md'
        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/70'
    } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`;
  };

  return (
    <div className="flex items-center justify-center p-1 bg-black/30 rounded-full gap-1">
      <button
        onClick={() => onModeChange(AppMode.CAMERA)}
        disabled={isDisabled}
        className={getButtonClasses(AppMode.CAMERA)}
        aria-pressed={currentMode === AppMode.CAMERA}
      >
        Camera Mode
      </button>
      <button
        onClick={() => onModeChange(AppMode.EDIT)}
        disabled={isDisabled}
        className={getButtonClasses(AppMode.EDIT)}
        aria-pressed={currentMode === AppMode.EDIT}
      >
        Edit Mode
      </button>
    </div>
  );
};

export default ModeToggle;
