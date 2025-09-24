
// Fix: Change React import to namespace import to resolve JSX typing issues.
import * as React from 'react';
import { CameraAction } from '../types';

interface ControlsProps {
  onAction: (action: CameraAction) => void;
  isDisabled: boolean;
}

const SvgIcon: React.FC<{ path: string }> = ({ path }) => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d={path} />
    </svg>
);

const ControlButton: React.FC<{
    label: string;
    action: CameraAction;
    onAction: (action: CameraAction) => void;
    isDisabled: boolean;
    iconPath: string;
}> = ({ label, action, onAction, isDisabled, iconPath }) => (
    <button
        onClick={() => onAction(action)}
        disabled={isDisabled}
        className="relative group flex items-center justify-center p-2.5 bg-slate-700/50 text-slate-300 rounded-full transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-brand-primary/80 hover:enabled:text-white"
        aria-label={label}
        title={label}
    >
        <SvgIcon path={iconPath} />
    </button>
);

const Controls: React.FC<ControlsProps> = ({ onAction, isDisabled }) => {
  return (
    <div className="flex items-center gap-2">
        <ControlButton label="Pan Left (A)" action={CameraAction.PAN_LEFT} onAction={onAction} isDisabled={isDisabled} iconPath="M15 18l-6-6 6-6" />
        <div className="flex flex-col gap-1.5">
            <ControlButton label="Tilt Up (W)" action={CameraAction.TILT_UP} onAction={onAction} isDisabled={isDisabled} iconPath="M12 19V5 M5 12l7-7 7 7" />
            <ControlButton label="Tilt Down (S)" action={CameraAction.TILT_DOWN} onAction={onAction} isDisabled={isDisabled} iconPath="M12 5v14M19 12l-7 7-7-7" />
        </div>
        <ControlButton label="Pan Right (D)" action={CameraAction.PAN_RIGHT} onAction={onAction} isDisabled={isDisabled} iconPath="M9 18l6-6-6-6" />
         <div className="flex flex-col gap-1.5">
            <ControlButton label="Zoom In (E)" action={CameraAction.ZOOM_IN} onAction={onAction} isDisabled={isDisabled} iconPath="M11 19V5 M5 12h14 M12 5l-4 4 M12 5l4 4" />
            <ControlButton label="Zoom Out (Q)" action={CameraAction.ZOOM_OUT} onAction={onAction} isDisabled={isDisabled} iconPath="M11 5v14 M5 12h14 M12 19l-4-4 M12 19l4-4" />
        </div>
    </div>
  );
};

export default Controls;
