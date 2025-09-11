import React from 'react';
import { AnchorPoint, Transform } from '../types';

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

    return (
        <div className="w-full md:w-1/3 bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col gap-4 self-stretch">
            <h2 className="text-xl font-semibold text-brand-text border-b border-gray-700 pb-2">Creator Toolkit</h2>
            
            <div>
                <label htmlFor="anchor-select" className="block text-sm font-medium text-brand-text-secondary mb-1">Anchor Point</label>
                <select
                    id="anchor-select"
                    value={anchorPoint}
                    onChange={(e) => setAnchorPoint(e.target.value as AnchorPoint)}
                    className="w-full bg-gray-700 border border-gray-600 text-brand-text rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                    <option value="head">Head Top</option>
                    <option value="nose">Nose Bridge</option>
                    <option value="forehead">Forehead</option>
                    <option value="chin">Chin</option>
                </select>
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
                className="mt-auto w-full px-5 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500"
            >
                Exit Live Preview
            </button>
        </div>
    );
};

export default ARControls;
