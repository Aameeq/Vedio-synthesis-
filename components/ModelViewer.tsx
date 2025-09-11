import React from 'react';

// Fix: Correctly type the custom <model-viewer> element for JSX.
// This simplified declaration avoids potential deep type conflicts from React.DetailedHTMLProps
// while still providing type safety for the props used in this component.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Typing for the <model-viewer> web component.
      // React's JSX requires camelCase properties for attributes that are kebab-case in HTML (e.g., camera-controls becomes cameraControls).
      'model-viewer': React.HTMLAttributes<HTMLElement> & {
        src?: string;
        alt?: string;
        cameraControls?: boolean;
        autoRotate?: boolean;
      };
    }
  }
}

interface ModelViewerProps {
  src: string | null;
  fileName: string;
}

const ModelViewer: React.FC<ModelViewerProps> = ({ src, fileName }) => {
  if (!src) return null;

  return (
    <div className="w-full h-full border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center">
      <model-viewer
        src={src}
        alt={`A 3D model of ${fileName}`}
        cameraControls
        autoRotate
        style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
      />
    </div>
  );
};

export default ModelViewer;