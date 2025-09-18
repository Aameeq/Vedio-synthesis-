import React from 'react';

// This global declaration is necessary to add TypeScript support for the <model-viewer> custom element.
// It defines the element in the JSX.IntrinsicElements namespace, allowing it to be used in TSX
// with type-checking for its props like `src`, `cameraControls`, etc.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Correctly define the 'model-viewer' custom element and its props for TypeScript.
      // This uses React.HTMLAttributes to ensure compatibility with React and standard HTML attributes.
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
        // The attributes are passed as camelCase props to match React conventions.
        cameraControls
        autoRotate
        style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
      />
    </div>
  );
};

export default ModelViewer;
