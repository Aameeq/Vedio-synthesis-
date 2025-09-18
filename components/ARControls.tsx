import React, { useState, useEffect } from 'react';
import { AnchorPoint, Transform } from '../types';
import { DEFAULT_TRANSFORM } from '../constants';

interface ARControlsProps {
    transform: Transform;
    setTransform: (transform: Transform) => void;
    anchorPoint: AnchorPoint;
    setAnchorPoint: (anchorPoint: AnchorPoint) => void;
    onExit: () => void;
}

const ControlSlider: React.FC<{
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step: number;
}> = ({ label, value, onChange, min, max, step }) => (
    <div>
        <label className="block text-xs font-medium text-brand-text-secondary">{label}</label>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
        />
    </div>
);

const AnchorPointVisualizer: React.FC<{ anchor: AnchorPoint }> = ({ anchor }) => {
    const [isPulsing, setIsPulsing] = useState(false);

    // Add a pulse effect when the anchor point changes
    useEffect(() => {
        setIsPulsing(true);
        const timer = setTimeout(() => setIsPulsing(false), 150);
        return () => clearTimeout(timer);
    }, [anchor]);

    const points: Record<AnchorPoint, { x: number; y: number; }> = {
        head: { x: 50, y: 12 },
        forehead: { x: 50, y: 30 },
        nose: { x: 50, y: 50 },
        chin: { x: 50, y: 88 },
    };

    const currentPoint = points[anchor];
    const transitionStyle = { transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' };

    return (
        <div className="flex items-center justify-center bg-gray-900 rounded-md p-2 mt-2">
            <svg viewBox="0 0 100 100" className="w-24 h-24">
                <defs>
                    <radialGradient id="glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" style={{stopColor: '#22d3ee', stopOpacity: 0.7}} />
                        <stop offset="100%" style={{stopColor: '#22d3ee', stopOpacity: 0}} />
                    </radialGradient>
                </defs>
                {/* Face Outline */}
                <path d="M25,50 A25,40 0 1,1 75,50 A25,40 0 1,1 25,50" fill="none" stroke="#9ca3af" strokeWidth="2" />
                {/* Features */}
                <path d="M40 45 Q 42 42 45 45" stroke="#9ca3af" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <path d="M55 45 Q 58 42 60 45" stroke="#9ca3af" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <path d="M48 55 L 52 55" stroke="#9ca3af" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <path d="M40 70 Q 50 75 60 70" stroke="#9ca3af" strokeWidth="1.5" fill="none" strokeLinecap="round" />

                {/* Animated Highlight Point */}
                <circle cx={currentPoint.x} cy={currentPoint.y} r={isPulsing ? 11 : 8} fill="url(#glow)" style={transitionStyle} />
                <circle cx={currentPoint.x} cy={currentPoint.y} r={isPulsing ? 4 : 3} fill="#67e8f9" stroke="white" strokeWidth="1" style={transitionStyle} />
            </svg>
        </div>
    );
};

const ARControls: React.FC<ARControlsProps> = ({ transform, setTransform, anchorPoint, setAnchorPoint, onExit }) => {
    const handlePositionChange = (axis: 'x' | 'y' | 'z', value: number) => {
        setTransform({ ...transform, position: { ...transform.position, [axis]: value } });
    };
    
    const handleRotationChange = (axis: 'x' | 'y' | 'z', value: number) => {
        setTransform({ ...transform, rotation: { ...transform.rotation, [axis]: value } });
    };

    const handleScaleChange = (value: number) => {
        setTransform({ ...transform, scale: value });
    };

    const handleReset = () => {
        setTransform(DEFAULT_TRANSFORM);
    };

    return (
        <div className="w-full md:w-1/3 bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col gap-4 self-stretch">
            <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                <h2 className="text-xl font-semibold text-brand-text">Creator Toolkit</h2>
                <button
                    onClick={handleReset}
                    className="px-3 py-1 bg-gray-600 text-white text-xs font-semibold rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-transform transform hover:scale-110"
                    aria-label="Reset model transform"
                >
                    Reset
                </button>
            </div>
            
            <div>
                <label htmlFor="anchor-select" className="block text-sm font-medium text-brand-text-secondary mb-1">Anchor Point</label>
                <select
                    id="anchor-select"
                    value={anchorPoint}
                    onChange={(e) => setAnchorPoint(e.target.value as AnchorPoint)}
                    className="w-full bg-gray-700 border border-gray-600 text-brand-text rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                    <option value="head" title="Attaches to the top of the head. Good for hats or crowns.">Head Top</option>
                    <option value="nose" title="Attaches to the bridge of the nose. Ideal for glasses.">Nose Bridge</option>
                    <option value="forehead" title="Attaches to the center of the forehead.">Forehead</option>
                    <option value="chin" title="Attaches to the tip of the chin. Good for beards or masks.">Chin</option>
                </select>
                <AnchorPointVisualizer anchor={anchorPoint} />
            </div>

            <div className="flex flex-col gap-2">
                <h3 className="text-md font-semibold text-brand-text">Position (Offset)</h3>
                <ControlSlider label="X-Axis" value={transform.position.x} onChange={v => handlePositionChange('x', v)} min={-2} max={2} step={0.01} />
                <ControlSlider label="Y-Axis" value={transform.position.y} onChange={v => handlePositionChange('y', v)} min={-2} max={2} step={0.01} />
                <ControlSlider label="Z-Axis" value={transform.position.z} onChange={v => handlePositionChange('z', v)} min={-2} max={2} step={0.01} />
            </div>

            <div className="flex flex-col gap-2">
                <h3 className="text-md font-semibold text-brand-text">Rotation</h3>
                <ControlSlider label="X-Axis" value={transform.rotation.x} onChange={v => handleRotationChange('x', v)} min={-Math.PI} max={Math.PI} step={0.01} />
                <ControlSlider label="Y-Axis" value={transform.rotation.y} onChange={v => handleRotationChange('y', v)} min={-Math.PI} max={Math.PI} step={0.01} />
                <ControlSlider label="Z-Axis" value={transform.rotation.z} onChange={v => handleRotationChange('z', v)} min={-Math.PI} max={Math.PI} step={0.01} />
            </div>

            <div className="flex flex-col gap-2">
                <h3 className="text-md font-semibold text-brand-text">Scale</h3>
                <ControlSlider label="Uniform Scale" value={transform.scale} onChange={handleScaleChange} min={0.1} max={3} step={0.01} />
            </div>
            
            <button
                onClick={onExit}
                className="mt-auto w-full px-5 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 transition-transform transform hover:scale-105"
            >
                Exit Live Preview
            </button>
        </div>
    );
};

export default ARControls;