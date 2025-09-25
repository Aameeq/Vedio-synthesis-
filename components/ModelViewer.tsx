// Fix: Switched to a namespace import 'import * as React' and updated types to use the `React.` prefix to resolve widespread JSX typing errors.
import * as React from 'react';

// Fix: Add type definitions for the <model-viewer> custom element to the global JSX namespace.
// This allows TypeScript to recognize the element and its properties in JSX, resolving the error.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        alt?: string;
        cameraControls?: boolean;
        autoRotate?: boolean;
        style?: React.CSSProperties;
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