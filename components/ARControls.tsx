// Fix: Changed React import to a namespace import to resolve JSX intrinsic element errors.
import * as React from 'react';
import { AnchorPoint, Transform } from '../types';
import { DEFAULT_TRANSFORM } from '../constants';

interface ARControlsProps {
    transform: Transform;
    setTransform: (transform: Transform) => void;
    anchorPoint: AnchorPoint;
    setAnchorPoint: (anchorPoint: AnchorPoint) => void;
    onExit: () => void;
    onGenerateTutorial: (platform: 'instagram' | 'snapchat') => void;
    isGeneratingTutorial: boolean;
}

const ControlSlider: React.FC<{
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step: number;
}> = ({ label, value, onChange, min, max, step }) => (
    <div className="flex items-center gap-3">
        <label className="w-12 text-xs font-medium text-slate-300 text-right">{label}</label>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer range-thumb"
        />
        <span className="w-10 text-xs text-slate-400 text-left">{value.toFixed(2)}</span>
    </div>
);

const ARControls: React.FC<ARControlsProps> = ({ transform, setTransform, anchorPoint, setAnchorPoint, onExit, onGenerateTutorial, isGeneratingTutorial }) => {
    
    const handleReset = () => {
        setTransform(DEFAULT_TRANSFORM);
    };

    return (
        <div className="absolute bottom-4 left-4 right-4 z-20 animate-fadeIn">
            <div className="w-full max-w-4xl mx-auto bg-brand-dark-secondary/80 backdrop-blur-lg rounded-2xl shadow-2xl p-4 border border-slate-700/50 flex items-center gap-6">
                
                {/* Left side: Anchor & Reset */}
                <div className="flex flex-col gap-2">
                     <label htmlFor="anchor-select" className="text-sm font-semibold text-slate-300">Anchor:</label>
                     <div className="flex items-center gap-2">
                         <select
                            id="anchor-select"
                            value={anchorPoint}
                            onChange={(e) => setAnchorPoint(e.target.value as AnchorPoint)}
                            className="bg-slate-700/80 border border-slate-600 text-slate-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        >
                            <option value="head">Head Top</option>
                            <option value="nose">Nose</option>
                            <option value="forehead">Forehead</option>
                            <option value="chin">Chin</option>
                        </select>
                         <button
                            onClick={handleReset}
                            className="p-2 bg-slate-700/80 text-white rounded-md hover:bg-slate-600/80"
                            aria-label="Reset model transform"
                            title="Reset Transform"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5"/><path d="M4 9a9 9 0 0114.53-3.03l-2.5 2.5A5 5 0 008.5 12.5M20 15a9 9 0 01-14.53 3.03l2.5-2.5A5 5 0 0015.5 11.5"/></svg>
                        </button>
                    </div>
                </div>

                <div className="h-16 w-px bg-slate-700"></div>
                
                {/* Center: Transform Controls */}
                <div className="flex-grow grid grid-cols-2 gap-x-6 gap-y-1">
                    <ControlSlider label="Position" value={transform.position.y} onChange={v => setTransform({ ...transform, position: { ...transform.position, y: v } })} min={-1} max={1} step={0.01} />
                    <ControlSlider label="Rotation" value={transform.rotation.x} onChange={v => setTransform({ ...transform, rotation: { ...transform.rotation, x: v } })} min={-Math.PI} max={Math.PI} step={0.01} />
                    <ControlSlider label="Scale" value={transform.scale} onChange={v => setTransform({ ...transform, scale: v })} min={0.1} max={3} step={0.01} />
                </div>

                <div className="h-16 w-px bg-slate-700"></div>

                {/* Right side: Publishing */}
                 <div className="flex flex-col items-center gap-2">
                     <h3 className="text-sm font-semibold text-slate-300">Publishing Guides</h3>
                     <div className="flex gap-2">
                        <button
                            onClick={() => onGenerateTutorial('instagram')}
                            disabled={isGeneratingTutorial}
                            className="px-4 py-2 text-xs bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500 disabled:opacity-50"
                        >
                            {isGeneratingTutorial ? '...' : 'Instagram'}
                        </button>
                        <button
                            onClick={() => onGenerateTutorial('snapchat')}
                            disabled={isGeneratingTutorial}
                            className="px-4 py-2 text-xs bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-500 disabled:opacity-50"
                        >
                            {isGeneratingTutorial ? '...' : 'Snapchat'}
                        </button>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default ARControls;
