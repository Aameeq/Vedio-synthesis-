import React from 'react';

interface StereoToggleProps {
  isEnabled: boolean;
  onToggle: (isEnabled: boolean) => void;
}

const StereoToggle: React.FC<StereoToggleProps> = ({ isEnabled, onToggle }) => {
  const toggleClasses = `w-14 h-8 flex items-center bg-gray-700 rounded-full p-1 cursor-pointer transition-colors duration-300 ease-in-out ${
    isEnabled ? 'bg-brand-primary' : 'bg-gray-600'
  }`;
  const knobClasses = `bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
    isEnabled ? 'translate-x-6' : ''
  }`;

  return (
    <div className="flex items-center gap-4 mt-4">
      <label htmlFor="stereo-toggle" className="font-semibold text-brand-text-secondary">
        Generate in 3D (for VR)
      </label>
      <button
        id="stereo-toggle"
        role="switch"
        aria-checked={isEnabled}
        onClick={() => onToggle(!isEnabled)}
        className={toggleClasses}
      >
        <div className={knobClasses} />
      </button>
    </div>
  );
};

export default StereoToggle;
