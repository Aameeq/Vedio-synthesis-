import React from 'react';

type WorldBuilderView = 'director' | 'storyboard';

interface ViewToggleProps {
  currentView: WorldBuilderView;
  onViewChange: (view: WorldBuilderView) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ currentView, onViewChange }) => {
  const getButtonClasses = (view: WorldBuilderView) => {
    const isActive = currentView === view;
    return `px-6 py-2 text-sm font-bold rounded-full transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-brand-primary ${
      isActive
        ? 'bg-brand-primary text-white scale-105 shadow-md'
        : 'bg-gray-700 text-brand-text-secondary hover:bg-gray-600 hover:scale-105'
    }`;
  };

  return (
    <div className="flex items-center justify-center p-1 bg-gray-800 rounded-full mb-6">
      <button
        onClick={() => onViewChange('director')}
        className={getButtonClasses('director')}
        aria-pressed={currentView === 'director'}
      >
        Director View
      </button>
      <button
        onClick={() => onViewChange('storyboard')}
        className={getButtonClasses('storyboard')}
        aria-pressed={currentView === 'storyboard'}
      >
        Storyboard View
      </button>
    </div>
  );
};

export default ViewToggle;