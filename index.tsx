// Fix: Switched to a namespace import `import * as React from 'react'` to resolve widespread JSX typing errors, likely caused by a TypeScript configuration issue (e.g., missing esModuleInterop).
import * as React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);