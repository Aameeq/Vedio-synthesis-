
// Fix: Use standard React default import to resolve JSX typing issues.
import React from 'react';
import { CameraAction } from '../types';

interface PresetSelectorProps {
  presets: { [key: string]: CameraAction[] };
  onSelect: (key: string) => void;
  isDisabled: boolean;
}

const PresetSelector: React.FC<PresetSelectorProps> = ({ presets, onSelect, isDisabled }) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (value) {
      onSelect(value);
      event.target.value = ""; // Reset selector to allow re-selection
    }
  };

  return (
    <div className="relative">
      <select
        id="preset-selector"
        onChange={handleChange}
        disabled={isDisabled}
        className="w-full h-12 pl-4 pr-10 bg-slate-700/50 border border-transparent text-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all disabled:opacity-50 appearance-none text-center"
        defaultValue=""
        aria-label="Select a cinematic camera movement"
      >
        <option value="" disabled>Cinematic Presets</option>
        {Object.keys(presets).map((key) => (
          <option key={key} value={key} className="bg-slate-800">
            {key}
          </option>
        ))}
      </select>
      <div className="absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none">
        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
    </div>
  );
};

export default PresetSelector;
