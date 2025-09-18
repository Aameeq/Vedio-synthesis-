import React from 'react';

// This global declaration adds TypeScript support for the <model-viewer> custom element.
// It defines the element in the JSX.IntrinsicElements namespace, allowing it to be used in TSX
// with type-checking for its props like `src`, `cameraControls`, etc.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Fix: Use React.DetailedHTMLProps for a more correct and robust type definition for custom elements, which aligns with how standard HTML elements are typed in React.
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
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