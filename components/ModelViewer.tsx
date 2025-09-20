import React from 'react';

// Fix: Refactor the custom element type definition to be more robust.
// To resolve issues with custom elements in React, we declare the custom element for TypeScript
// by augmenting the JSX.IntrinsicElements interface. This makes TypeScript aware of 'model-viewer'
// and allows it to be used like a native JSX element with type checking.
declare global {
  namespace JSX {
    // By extending React's HTMLAttributes, we get all the standard HTML props like `style`, `className`, etc.
    // We then add the specific properties for the 'model-viewer' element.
    interface ModelViewerAttributes extends React.HTMLAttributes<HTMLElement> {
      src?: string;
      alt?: string;
      cameraControls?: boolean;
      autoRotate?: boolean;
    }

    interface IntrinsicElements {
      // Use the custom attributes interface for the 'model-viewer' tag.
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