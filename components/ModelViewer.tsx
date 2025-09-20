import React from 'react';

// To resolve issues with custom elements in React, we declare the custom element for TypeScript.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Fix: Correctly type the 'model-viewer' custom element.
      // The previous type definition was causing a TypeScript error. Using React.DetailedHTMLProps
      // provides a more robust type that includes standard HTML attributes along with custom ones.
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        src?: string;
        alt?: string;
        'camera-controls'?: boolean;
        'auto-rotate'?: boolean;
      }, HTMLElement>;
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
        camera-controls
        auto-rotate
        style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
      />
    </div>
  );
};

export default ModelViewer;