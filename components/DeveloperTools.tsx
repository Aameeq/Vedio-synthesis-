// Fix: Change React import to namespace import to resolve JSX typing issues.
import * as React from 'react';

// This component has been neutralized to prevent a critical loading error.
// Its previous implementation relied on non-standard browser features (?raw imports)
// that were causing the application to crash on startup.

const DeveloperTools: React.FC<{ onClose: () => void }> = () => {
  return null;
};

export default DeveloperTools;