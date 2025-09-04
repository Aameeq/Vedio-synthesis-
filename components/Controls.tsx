
import React from 'react';
import { CameraAction } from '../types';

interface ControlsProps {
  onAction: (action: CameraAction) => void;
  isDisabled: boolean;
}

interface ControlButtonProps {
  label: string;
  keyLabel: string;
  action: CameraAction;
  onAction: (action: CameraAction) => void;
  isDisabled: boolean;
  className?: string;
}

const ControlButton: React.FC<ControlButtonProps> = ({ label, keyLabel, action, onAction, isDisabled, className = '' }) => (
  <button
    onClick={() => onAction(action)}
    disabled={isDisabled}
    className={`relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center bg-gray-800 text-brand-text rounded-lg border-2 border-gray-700 transition-all duration-150 ease-in-out ${
      isDisabled
        ? 'opacity-50 cursor-not-allowed'
        : 'hover:bg-gray-700 hover:border-brand-primary hover:scale-105 active:scale-100'
    } ${className}`}
    aria-label={label}
  >
    <span className="absolute top-1 left-2 text-xs font-bold text-brand-text-secondary">{keyLabel}</span>
    <span className="text-lg font-semibold">{label}</span>
  </button>
);

const Controls: React.FC<ControlsProps> = ({ onAction, isDisabled }) => {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4">
      <ControlButton label="Zoom Out" keyLabel="Q" action={CameraAction.ZOOM_OUT} onAction={onAction} isDisabled={isDisabled} className="col-start-1" />
      <ControlButton label="Up" keyLabel="W" action={CameraAction.TILT_UP} onAction={onAction} isDisabled={isDisabled} className="col-start-2" />
      <ControlButton label="Zoom In" keyLabel="E" action={CameraAction.ZOOM_IN} onAction={onAction} isDisabled={isDisabled} className="col-start-3" />
      <ControlButton label="Left" keyLabel="A" action={CameraAction.PAN_LEFT} onAction={onAction} isDisabled={isDisabled} className="col-start-1" />
      <ControlButton label="Down" keyLabel="S" action={CameraAction.TILT_DOWN} onAction={onAction} isDisabled={isDisabled} className="col-start-2" />
      <ControlButton label="Right" keyLabel="D" action={CameraAction.PAN_RIGHT} onAction={onAction} isDisabled={isDisabled} className="col-start-3" />
    </div>
  );
};

export default Controls;
