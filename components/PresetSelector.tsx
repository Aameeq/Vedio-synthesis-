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
    <div className="w-full max-w-xs">
      <select
        id="preset-selector"
        onChange={handleChange}
        disabled={isDisabled}
        className="w-full bg-gray-700 border-2 border-gray-600 text-brand-text-secondary rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed text-center"
        defaultValue=""
        aria-label="Select a cinematic camera movement"
      >
        <option value="" disabled>-- Select a Preset Movement --</option>
        {Object.keys(presets).map((key) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PresetSelector;
