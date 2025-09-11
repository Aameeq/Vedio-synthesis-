import React, { useState, useRef, useEffect } from 'react';
import ModelViewer from '../components/ModelViewer';
import ARPreview from '../components/ARPreview';
import ARControls from '../components/ARControls';
import { AnchorPoint, Transform } from '../types';

const ARForge: React.FC = () => {
    const [modelFile, setModelFile] = useState<File | null>(null);
    const [modelSrc, setModelSrc] = useState<string | null>(null);
    const [isCameraOn, setIsCameraOn] = useState<boolean>(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const [arMode, setArMode] = useState<'setup' | 'live'>('setup');
    const [transform, setTransform] = useState<Transform>({
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: 1,
    });
    const [anchorPoint, setAnchorPoint] = useState<AnchorPoint>('head');

    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.name.endsWith('.glb') || file.name.endsWith('.gltf')) {
                setModelFile(file);
                const objectUrl = URL.createObjectURL(file);
                setModelSrc(objectUrl);
                setError(null);
            } else {
                setError('Invalid file type. Please upload a .glb or .gltf file.');
                setModelFile(null);
                setModelSrc(null);
            }
        }
    };

    const handleCameraToggle = async () => {
        if (isCameraOn) {
            stream?.getTracks().forEach(track => track.stop());
            setStream(null);
            setIsCameraOn(false);
        } else {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
                setStream(mediaStream);
                setIsCameraOn(true);
                setError(null);
            } catch (err) {
                console.error("Camera access denied:", err);
                setError("Camera access was denied. Please allow camera permissions in your browser settings.");
                setIsCameraOn(false);
            }
        }
    };
    
    useEffect(() => {
        return () => {
            stream?.getTracks().forEach(track => track.stop());
        }
    }, [stream]);

    const handleMerge = () => {
        if (modelFile && stream) {
            setArMode('live');
        }
    };

    const handleExitLiveMode = () => {
        setArMode('setup');
    };

    const isMergeReady = modelSrc !== null && isCameraOn;

    if (arMode === 'live' && modelFile && stream) {
        return (
            <main className="w-full max-w-7xl flex-grow flex flex-col md:flex-row items-center gap-4">
                <ARPreview modelFile={modelFile} stream={stream} transform={transform} anchorPoint={anchorPoint} setTransform={setTransform} />
                <ARControls transform={transform} setTransform={setTransform} anchorPoint={anchorPoint} setAnchorPoint={setAnchorPoint} onExit={handleExitLiveMode} />
            </main>
        );
    }

    return (
        <main className="w-full max-w-7xl flex-grow flex flex-col items-center gap-4">
            <h2 className="text-3xl font-bold text-brand-text tracking-tight">AI AR Filter Forge</h2>
            <p className="text-md text-brand-text-secondary">Design and test your AR filters in real-time.</p>

            {error && (
                 <div className="w-full bg-red-800 border border-red-600 text-white px-4 py-2 rounded-md text-sm" role="alert">
                    <p>{error}</p>
                 </div>
            )}
            <div className="w-full flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col min-h-[480px]">
                    <h3 className="text-xl font-semibold mb-2 text-brand-text">1. Asset Workshop</h3>
                    <p className="text-sm text-brand-text-secondary mb-4">Upload a 3D model (.glb or .gltf) to begin.</p>
                    <div className="flex items-center gap-4 mb-4">
                        <label htmlFor="file-upload" className="cursor-pointer px-5 py-2 bg-brand-primary text-white font-bold rounded-lg hover:bg-blue-600">
                            Choose File
                        </label>
                        <input id="file-upload" type="file" accept=".glb,.gltf" onChange={handleFileChange} className="hidden" />
                        {modelFile && <span className="text-sm text-brand-text-secondary">{modelFile.name}</span>}
                    </div>
                    <div className="flex-grow w-full h-full bg-brand-dark rounded-md">
                        {modelSrc ? (
                            <ModelViewer src={modelSrc} fileName={modelFile?.name || 'model'} />
                        ) : (
                            <div className="w-full h-full border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center">
                                <p className="text-brand-text-secondary">3D model preview</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col min-h-[480px]">
                    <h3 className="text-xl font-semibold mb-2 text-brand-text">2. Live Preview</h3>
                    <p className="text-sm text-brand-text-secondary mb-4">Start your camera to see your live feed.</p>
                     <div className="flex-grow w-full h-full bg-black rounded-md flex items-center justify-center relative">
                        <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover rounded-md ${isCameraOn ? 'block' : 'hidden'}`} />
                        {!isCameraOn && (
                            <div className="text-center">
                                 <p className="text-brand-text-secondary mb-4">Camera is off</p>
                                 <button onClick={handleCameraToggle} className="px-5 py-2 bg-brand-primary text-white font-bold rounded-lg hover:bg-blue-600">
                                     Start Camera
                                 </button>
                            </div>
                        )}
                        {isCameraOn && (
                             <button onClick={handleCameraToggle} className="absolute bottom-4 left-4 z-10 px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700">
                                Stop Camera
                             </button>
                        )}
                    </div>
                </div>
            </div>
             <div className="w-full flex justify-center py-4">
                <button
                    onClick={handleMerge}
                    disabled={!isMergeReady}
                    className="px-8 py-4 bg-green-600 text-white font-bold rounded-lg text-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                    title={!isMergeReady ? "Upload a model and start your camera to enable" : "Combine asset and camera feed"}
                >
                    Merge to Live Preview
                </button>
            </div>
        </main>
    );
};

export default ARForge;