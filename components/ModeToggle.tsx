import React from 'react';
import { AppMode } from '../types';

interface ModeToggleProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  isDisabled: boolean;
}

const ModeToggle: React.FC<ModeToggleProps> = ({ currentMode, onModeChange, isDisabled }) => {
  const getButtonClasses = (mode: AppMode) => {
    const isActive = currentMode === mode;
    return `px-6 py-2 text-sm font-bold rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-brand-primary ${
      isActive
        ? 'bg-brand-primary text-white'
        : 'bg-gray-700 text-brand-text-secondary hover:bg-gray-600'
    } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`;
  };

  return (
    <div className="flex items-center justify-center p-1 bg-gray-800 rounded-full">
      <button
        onClick={() => onModeChange(AppMode.CAMERA)}
        disabled={isDisabled}
        className={getButtonClasses(AppMode.CAMERA)}
        aria-pressed={currentMode === AppMode.CAMERA}
      >
        Camera
      </button>
      <button
        onClick={() => onModeChange(AppMode.EDIT)}
        disabled={isDisabled}
        className={getButtonClasses(AppMode.EDIT)}
        aria-pressed={currentMode === AppMode.EDIT}
      >
        Edit
      </button>
    </div>
  );
};

export default ModeToggle;
