import React from 'react';

interface ModelGeneratorProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  imagePreview: string | null;
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearImage: () => void;
}

const ModelGenerator: React.FC<ModelGeneratorProps> = ({ prompt, setPrompt, onGenerate, isLoading, imagePreview, onImageChange, onClearImage }) => {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-brand-text-secondary">Describe the 3D model, and optionally provide a reference image.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'a cool pair of aviator sunglasses'"
            className="w-full h-full min-h-[100px] p-3 bg-brand-dark border-2 border-gray-700 rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all disabled:opacity-50"
            aria-label="3D model description prompt"
            disabled={isLoading}
          />
          <div className="w-full h-full min-h-[100px] bg-brand-dark border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center relative">
            {imagePreview ? (
                <>
                    <img src={imagePreview} alt="Reference for 3D model" className="w-full h-full object-contain rounded-md p-1" />
                    <button 
                        onClick={onClearImage}
                        disabled={isLoading}
                        className="absolute -top-2 -right-2 z-10 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold disabled:opacity-50"
                        aria-label="Clear reference image"
                    >
                        &times;
                    </button>
                </>
            ) : (
                 <label htmlFor="image-upload" className="cursor-pointer text-center text-brand-text-secondary hover:text-white p-4">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <span>Add Image (Optional)</span>
                </label>
            )}
            <input id="image-upload" type="file" accept="image/*" onChange={onImageChange} className="hidden" disabled={isLoading} />
          </div>
      </div>

      <button
        onClick={onGenerate}
        disabled={!prompt.trim() || isLoading}
        className="w-full px-5 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 transition-transform duration-150 ease-in-out hover:scale-105 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Generating...' : 'Generate Model'}
      </button>
    </div>
  );
};

export default ModelGenerator;