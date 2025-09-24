// Fix: Changed React import to a namespace import to resolve JSX intrinsic element errors.
import * as React from 'react';
import ModelViewer from '../components/ModelViewer';
import ARPreview from '../components/ARPreview';
import ARControls from '../components/ARControls';
import { AnchorPoint, Transform } from '../types';
import { DEFAULT_TRANSFORM } from '../constants';
import ModelGenerator from '../components/ModelGenerator';
import { generate3DModel, generateArTutorial } from '../services/geminiService';
import TutorialModal from '../components/TutorialModal';

const ARForge: React.FC = () => {
    const [modelFile, setModelFile] = React.useState<File | null>(null);
    const [modelSrc, setModelSrc] = React.useState<string | null>(null);
    const [stream, setStream] = React.useState<MediaStream | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    
    const [arMode, setArMode] = React.useState<'setup' | 'live'>('setup');
    const [transform, setTransform] = React.useState<Transform>(DEFAULT_TRANSFORM);
    const [anchorPoint, setAnchorPoint] = React.useState<AnchorPoint>('head');
    
    const [assetSourceTab, setAssetSourceTab] = React.useState<'generate' | 'upload'>('generate');
    const [generationPrompt, setGenerationPrompt] = React.useState<string>('a sci-fi astronaut helmet');
    const [isGeneratingModel, setIsGeneratingModel] = React.useState<boolean>(false);
    const [generationImage, setGenerationImage] = React.useState<File | null>(null);
    const [generationImagePreview, setGenerationImagePreview] = React.useState<string | null>(null);
    const generationImagePreviewRef = React.useRef<string | null>(null);
    
    const [tutorialContent, setTutorialContent] = React.useState<string | null>(null);
    const [tutorialTitle, setTutorialTitle] = React.useState<string>('');
    const [isGeneratingTutorial, setIsGeneratingTutorial] = React.useState<boolean>(false);

    React.useEffect(() => {
        // Stop camera stream on component unmount or when exiting live mode
        return () => {
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
    
    const handleStartLivePreview = async () => {
        if (!modelFile) {
            setError("Please upload or generate a 3D model first.");
            return;
        }
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            setStream(mediaStream);
            setArMode('live');
            setError(null);
        } catch (err) {
            console.error("Camera access denied:", err);
            setError("Camera access was denied. Please allow camera permissions in your browser settings.");
        }
    };

    const handleExitLiveMode = () => {
        stream?.getTracks().forEach(track => track.stop());
        setStream(null);
        setArMode('setup');
    };
    
     const handleGenerationImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (generationImagePreviewRef.current) URL.revokeObjectURL(generationImagePreviewRef.current);
            const newPreviewUrl = URL.createObjectURL(file);
            setGenerationImage(file);
            setGenerationImagePreview(newPreviewUrl);
            generationImagePreviewRef.current = newPreviewUrl;
        }
    };

    const handleClearGenerationImage = () => {
        setGenerationImage(null);
        if (generationImagePreviewRef.current) URL.revokeObjectURL(generationImagePreviewRef.current);
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
            if (!response.ok) throw new Error(`Failed to fetch generated model: ${response.statusText}`);
            const blob = await response.blob();
            const file = new File([blob], name, { type: blob.type });
            setModelFile(file);
            const objectUrl = URL.createObjectURL(file);
            setModelSrc(objectUrl);
            handleClearGenerationImage();
        } catch (err) {
            console.error("Model generation failed:", err);
            setError(err instanceof Error ? err.message : "An unknown error occurred during model generation.");
        } finally {
            setIsGeneratingModel(false);
        }
    };
    
    const handleGenerateTutorial = async (platform: 'instagram' | 'snapchat') => {
        if (!modelFile) {
            setError("Please generate or upload a model before creating a tutorial.");
            return;
        }
        setIsGeneratingTutorial(true);
        setError(null);
        setTutorialContent(null);
        try {
            const content = await generateArTutorial(platform, modelFile.name);
            setTutorialContent(content);
            setTutorialTitle(platform === 'instagram' ? 'Instagram Filter Guide' : 'Snapchat Lens Guide');
        } catch (err) {
            console.error("Tutorial generation failed:", err);
            setError(err instanceof Error ? err.message : `Failed to generate tutorial: ${err}`);
        } finally {
            setIsGeneratingTutorial(false);
        }
    };
    
    if (arMode === 'live' && modelFile && stream) {
        return (
            <div className="w-full h-full flex-grow flex items-center justify-center relative bg-black animate-fadeIn">
                <ARPreview modelFile={modelFile} stream={stream} transform={transform} anchorPoint={anchorPoint} setTransform={setTransform} />
                <ARControls 
                    transform={transform} 
                    setTransform={setTransform} 
                    anchorPoint={anchorPoint} 
                    setAnchorPoint={setAnchorPoint} 
                    onExit={handleExitLiveMode}
                    onGenerateTutorial={handleGenerateTutorial}
                    isGeneratingTutorial={isGeneratingTutorial}
                />
                <button 
                    onClick={handleExitLiveMode}
                    className="absolute top-4 right-4 z-30 px-4 py-2 bg-black/60 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
                    aria-label="Exit Live Preview"
                >
                    Exit
                </button>
                 {tutorialContent && <TutorialModal title={tutorialTitle} content={tutorialContent} onClose={() => setTutorialContent(null)} />}
            </div>
        );
    }

    const TabButton: React.FC<{label: string, isActive: boolean, onClick: () => void}> = ({ label, isActive, onClick }) => (
         <button
            onClick={onClick}
            className={`px-4 py-2 font-semibold transition-colors border-b-2 ${
                isActive 
                ? 'border-brand-primary text-white'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
            role="tab"
            aria-selected={isActive}
        >
            {label}
        </button>
    );

    return (
        <div className="w-full h-full flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fadeIn">
            <div className="w-full h-full max-w-7xl flex flex-col md:flex-row gap-8">
                {/* Left Side: Controls */}
                <div className="w-full md:w-[350px] flex-shrink-0 flex flex-col bg-brand-dark-secondary rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white tracking-tight">AR Filter Forge</h2>
                    
                    <div className="mt-4 border-b border-slate-700">
                        <TabButton label="Generate Model (AI)" isActive={assetSourceTab === 'generate'} onClick={() => setAssetSourceTab('generate')} />
                        <TabButton label="Upload Model" isActive={assetSourceTab === 'upload'} onClick={() => setAssetSourceTab('upload')} />
                    </div>
                    
                    <div className="py-4 flex-grow">
                        {assetSourceTab === 'upload' ? (
                            <div className="flex flex-col gap-4 h-full justify-center">
                                <p className="text-sm text-slate-400">Upload a 3D model (.glb or .gltf).</p>
                                <label htmlFor="file-upload" className="cursor-pointer w-full text-center px-5 py-3 bg-slate-700 text-white font-bold rounded-lg hover:bg-slate-600 transition-colors">
                                    {modelFile ? `Selected: ${modelFile.name}` : 'Choose File'}
                                </label>
                                <input id="file-upload" type="file" accept=".glb,.gltf" onChange={handleFileChange} className="hidden" />
                            </div>
                        ) : (
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
                     <div className="mt-auto pt-4 border-t border-slate-700">
                         {error && (
                            <div className="w-full bg-red-900/50 border border-red-700 text-white px-3 py-2 rounded-md text-xs mb-4" role="alert">
                                <p>{error}</p>
                            </div>
                        )}
                         <button
                            onClick={handleStartLivePreview}
                            disabled={!modelSrc}
                            className="w-full px-8 py-3 bg-brand-primary text-white font-bold rounded-lg text-md hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                            title={!modelSrc ? "Upload or generate a model to enable" : "Start Live Preview"}
                        >
                            Start Live Preview
                        </button>
                    </div>
                </div>

                {/* Right Side: Preview Area */}
                <div className="w-full flex-grow bg-black/50 rounded-2xl flex items-center justify-center relative border-2 border-dashed border-slate-800">
                    {modelSrc ? (
                        <ModelViewer src={modelSrc} fileName={modelFile?.name || 'model'} />
                    ) : (
                        <div className="text-center text-slate-500 p-8">
                            <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 004.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5v-5.714c0-.597-.237-1.17-.659-1.591L14.25 3.104 9.75 3.104 5 7.199 5 14.5M19 14.5l-1.414-1.414a2.25 2.25 0 00-3.182 0L12 15.5l-1.414-1.414a2.25 2.25 0 00-3.182 0L5 14.5m14 0l-6 6m-6-6l6 6" /></svg>
                            <p className="mt-4 font-semibold">Preview</p>
                            <p className="text-sm">{isGeneratingModel ? 'AI is creating your 3D model...' : 'Your 3D model preview will appear here'}</p>
                        </div>
                    )}
                </div>
            </div>
            {tutorialContent && <TutorialModal title={tutorialTitle} content={tutorialContent} onClose={() => setTutorialContent(null)} />}
        </div>
    );
};

export default ARForge;
