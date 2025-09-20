import React from 'react';

// Fix: Correctly define types for the <model-viewer> custom element.
// This adds the custom element to TypeScript's JSX namespace, allowing it to be used
// with type checking and standard React props like `style` or `key`.
declare global {
  namespace JSX {
    interface IntrinsicElements {
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
        // React converts camelCase props like `cameraControls` to kebab-case attributes (`camera-controls`)
        // for custom elements, which is what <model-viewer> expects.
        cameraControls
        autoRotate
        style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
      />
    </div>
  );
};

export default ModelViewer;
