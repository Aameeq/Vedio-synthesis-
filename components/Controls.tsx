import React from 'react';
import { CameraAction } from '../types';

interface ControlsProps {
  onAction: (action: CameraAction) => void;
  isDisabled: boolean;
}

const SvgIcon: React.FC<{ path: string }> = ({ path }) => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={path} />
    </svg>
);

const ControlButton: React.FC<{
    label: string;
    action: CameraAction;
    onAction: (action: CameraAction) => void;
    isDisabled: boolean;
    iconPath: string;
    gridClass: string;
}> = ({ label, action, onAction, isDisabled, iconPath, gridClass }) => (
    <button
        onClick={() => onAction(action)}
        disabled={isDisabled}
        className={`flex flex-col items-center justify-center p-2 bg-gray-700 text-brand-text-secondary rounded-lg border-2 border-gray-600 transition-all duration-150 ease-in-out ${
            isDisabled
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-gray-600 hover:border-brand-primary hover:scale-105 active:scale-100'
        } ${gridClass}`}
        aria-label={label}
    >
        <SvgIcon path={iconPath} />
        <span className="text-xs font-bold mt-1">{label}</span>
    </button>
);

const Controls: React.FC<ControlsProps> = ({ onAction, isDisabled }) => {
  return (
    <div className="grid grid-cols-3 gap-2 w-full max-w-xs">
        <ControlButton label="Pan L" action={CameraAction.PAN_LEFT} onAction={onAction} isDisabled={isDisabled} iconPath="M15 18l-6-6 6-6" gridClass="col-start-1" />
        <ControlButton label="Tilt Up" action={CameraAction.TILT_UP} onAction={onAction} isDisabled={isDisabled} iconPath="M12 19V5 M5 12l7-7 7 7" gridClass="col-start-2" />
        <ControlButton label="Pan R" action={CameraAction.PAN_RIGHT} onAction={onAction} isDisabled={isDisabled} iconPath="M9 18l6-6-6-6" gridClass="col-start-3" />
        
        <ControlButton label="Zoom Out" action={CameraAction.ZOOM_OUT} onAction={onAction} isDisabled={isDisabled} iconPath="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16zM8 11h6" gridClass="col-start-1" />
        <ControlButton label="Tilt Dn" action={CameraAction.TILT_DOWN} onAction={onAction} isDisabled={isDisabled} iconPath="M12 5v14M19 12l-7 7-7-7" gridClass="col-start-2" />
        <ControlButton label="Zoom In" action={CameraAction.ZOOM_IN} onAction={onAction} isDisabled={isDisabled} iconPath="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16zM11 8v6M8 11h6" gridClass="col-start-3" />
    </div>
  );
};

export default Controls;
