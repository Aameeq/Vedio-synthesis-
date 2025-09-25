// Fix: Switched to a namespace import 'import * as React' and updated class/types to use the `React.` prefix. This resolves widespread JSX typing errors and issues with `this.props` and `this.state` recognition.
import * as React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{color: "white", background: "darkred", padding: 24}}>
          <h2>Something went wrong!</h2>
          <pre>{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

/*
Note: The original file had a default export. This has been changed to a named export
as requested by the user's new App.tsx implementation.
To use this, you'll need `import { ErrorBoundary } from './components/ErrorBoundary';`
*/