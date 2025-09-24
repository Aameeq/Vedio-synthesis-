// Fix: Changed React import to a namespace import to resolve JSX intrinsic element errors.
import * as React from 'react';

interface StereoToggleProps {
  isEnabled: boolean;
  onToggle: (isEnabled: boolean) => void;
  isDisabled: boolean;
}

const StereoToggle: React.FC<StereoToggleProps> = ({ isEnabled, onToggle, isDisabled }) => {
  const toggleClasses = `w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ease-in-out ${
    isEnabled ? 'bg-brand-primary' : 'bg-slate-700/50'
  } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`;
  const knobClasses = `bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
    isEnabled ? 'translate-x-5' : ''
  }`;

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        id="stereo-toggle"
        role="switch"
        aria-checked={isEnabled}
        onClick={() => !isDisabled && onToggle(!isEnabled)}
        disabled={isDisabled}
        className={toggleClasses}
        title="Generate Stereoscopic 3D for VR"
      >
        <div className={knobClasses} />
      </button>
    </div>
  );
};

export default StereoToggle;
