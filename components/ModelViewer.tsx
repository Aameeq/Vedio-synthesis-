import React from 'react';

// To resolve issues with custom elements in React, we declare the custom element for TypeScript.

// First, define an interface for the element's attributes, extending standard HTML attributes.
interface ModelViewerAttributes extends React.HTMLAttributes<HTMLElement> {
    src?: string;
    alt?: string;
    // Fix: Use camelCase for custom element properties. React passes these as properties
    // on the DOM element, and the model-viewer element expects camelCase (e.g., `cameraControls`).
    // The original kebab-case ('camera-controls') does not map to a valid property.
    cameraControls?: boolean;
    autoRotate?: boolean;
}

// Then, augment the JSX IntrinsicElements interface to make TypeScript aware of 'model-viewer'.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': ModelViewerAttributes;
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
        // Fix: Use camelCase props to set properties on the custom element directly.
        cameraControls
        autoRotate
        style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
      />
    </div>
  );
};

export default ModelViewer;