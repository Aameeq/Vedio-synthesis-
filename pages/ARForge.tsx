import React, { useState, useRef, useEffect } from 'react';
import ModelViewer from '../components/ModelViewer';
import ARPreview from '../components/ARPreview';
import ARControls from '../components/ARControls';
import { AnchorPoint, Transform } from '../types';
import { DEFAULT_TRANSFORM } from '../constants';
import ModelGenerator from '../components/ModelGenerator';
import { generate3DModel } from '../services/geminiService';

const ARForge: React.FC = () => {
    const [modelFile, setModelFile] = useState<File | null>(null);
    const [modelSrc, setModelSrc] = useState<string | null>(null);
    const [isCameraOn, setIsCameraOn] = useState<boolean>(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const [arMode, setArMode] = useState<'setup' | 'live'>('setup');
    const [transform, setTransform] = useState<Transform>(DEFAULT_TRANSFORM);
    const [anchorPoint, setAnchorPoint] = useState<AnchorPoint>('head');
    
    const [assetSourceTab, setAssetSourceTab] = useState<'upload' | 'generate'>('upload');
    const [generationPrompt, setGenerationPrompt] = useState<string>('a sci-fi astronaut helmet');
    const [isGeneratingModel, setIsGeneratingModel] = useState<boolean>(false);
    const [generationImage, setGenerationImage] = useState<File | null>(null);
    const [generationImagePreview, setGenerationImagePreview] = useState<string | null>(null);
    const generationImagePreviewRef = useRef<string | null>(null);


    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);
    
    useEffect(() => {
        return () => {
            if (generationImagePreviewRef.current) {
                URL.revokeObjectURL(generationImagePreviewRef.current);
            }
            stream?.getTracks().forEach(track => track.stop());
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

    const handleMerge = () => {
        if (modelFile && stream) {
            setArMode('live');
        }
    };

    const handleExitLiveMode = () => {
        setArMode('setup');
    };
    
     const handleGenerationImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (generationImagePreviewRef.current) {
                URL.revokeObjectURL(generationImagePreviewRef.current);
            }
            const newPreviewUrl = URL.createObjectURL(file);
            setGenerationImage(file);
            setGenerationImagePreview(newPreviewUrl);
            generationImagePreviewRef.current = newPreviewUrl;
        }
    };

    const handleClearGenerationImage = () => {
        setGenerationImage(null);
        if (generationImagePreviewRef.current) {
            URL.revokeObjectURL(generationImagePreviewRef.current);
            generationImagePreviewRef.current = null;
        }
        setGenerationImagePreview(null);
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };
    
    const handleGenerateModel = async () => {
        if (!generationPrompt.trim() || isGeneratingModel) return;

        setIsGeneratingModel(true);
        setError(null);
        setModelFile(null);
        setModelSrc(null);

        try {
            const imageB64 = generationImage ? await fileToBase64(generationImage) : undefined;
            const { url, name } = await generate3DModel(generationPrompt, imageB64);
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch generated model: ${response.statusText}`);
            }
            const blob = await response.blob();
            const file = new File([blob], name, { type: blob.type });

            setModelFile(file);
            const objectUrl = URL.createObjectURL(file);
            setModelSrc(objectUrl);
            handleClearGenerationImage();

        } catch (err) {
            console.error("Model generation failed:", err);
            const message = err instanceof Error ? err.message : "An unknown error occurred during model generation.";
            setError(message);
        } finally {
            setIsGeneratingModel(false);
        }
    };
    
    const TabButton: React.FC<{label: string, isActive: boolean, onClick: () => void}> = ({ label, isActive, onClick }) => (
         <button
            onClick={onClick}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors border-b-2 ${
                isActive 
                ? 'border-brand-primary text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
            role="tab"
            aria-selected={isActive}
        >
            {label}
        </button>
    );

    const isMergeReady = modelSrc !== null && isCameraOn;

    if (arMode === 'live' && modelFile && stream) {
        return (
            <main className="w-full max-w-7xl flex-grow flex flex-col md:flex-row items-center gap-4 animate-fadeIn">
                <ARPreview modelFile={modelFile} stream={stream} transform={transform} anchorPoint={anchorPoint} setTransform={setTransform} />
                <ARControls transform={transform} setTransform={setTransform} anchorPoint={anchorPoint} setAnchorPoint={setAnchorPoint} onExit={handleExitLiveMode} />
            </main>
        );
    }

    return (
        <main className="w-full max-w-7xl flex-grow flex flex-col items-center gap-4 animate-fadeIn">
            <h2 className="text-3xl font-bold text-brand-text tracking-tight">AI AR Filter Forge</h2>
            <p className="text-md text-brand-text-secondary">Design and test your AR filters in real-time.</p>

            {error && (
                 <div className="w-full bg-red-800 border border-red-600 text-white px-4 py-2 rounded-md text-sm" role="alert">
                    <p>{error}</p>
                 </div>
            )}
            <div className="w-full flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col min-h-[480px]">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-brand-text">1. Asset Workshop</h3>
                         {isGeneratingModel && (
                           <div className="flex items-center gap-2 text-sm text-brand-text-secondary">
                                <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                                <span>Generating...</span>
                           </div>
                        )}
                    </div>
                    <div className="flex border-b border-gray-700 mt-2">
                        <TabButton label="Upload Model" isActive={assetSourceTab === 'upload'} onClick={() => setAssetSourceTab('upload')} />
                        <TabButton label="Generate Model (AI)" isActive={assetSourceTab === 'generate'} onClick={() => setAssetSourceTab('generate')} />
                    </div>
                    
                    <div className="flex-shrink-0 pt-4">
                        {assetSourceTab === 'upload' && (
                            <div className="flex flex-col gap-4">
                                <p className="text-sm text-brand-text-secondary">Upload a 3D model (.glb or .gltf) to begin.</p>
                                <div className="flex items-center gap-4">
                                    <label htmlFor="file-upload" className="cursor-pointer px-5 py-2 bg-brand-primary text-white font-bold rounded-lg hover:bg-blue-600">
                                        Choose File
                                    </label>
                                    <input id="file-upload" type="file" accept=".glb,.gltf" onChange={handleFileChange} className="hidden" />
                                    {modelFile && <span className="text-sm text-brand-text-secondary">{modelFile.name}</span>}
                                </div>
                            </div>
                        )}
                        {assetSourceTab === 'generate' && (
                           <ModelGenerator 
                                prompt={generationPrompt}
                                setPrompt={setGenerationPrompt}
                                onGenerate={handleGenerateModel}
                                isLoading={isGeneratingModel}
                                imagePreview={generationImagePreview}
                                onImageChange={handleGenerationImageChange}
                                onClearImage={handleClearGenerationImage}
                           />
                        )}
                    </div>
                    
                    <div className="mt-4 flex-grow w-full h-full bg-brand-dark rounded-md min-h-[200px]">
                        {modelSrc ? (
                            <ModelViewer src={modelSrc} fileName={modelFile?.name || 'model'} />
                        ) : (
                            <div className="w-full h-full border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center">
                                <p className="text-brand-text-secondary">{isGeneratingModel ? 'AI is creating your model...' : '3D model preview'}</p>
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