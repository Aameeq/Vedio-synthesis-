
// Fix: Use standard React default import to resolve component, props, state, and JSX typing issues.
import React from "react";

// Fix: Add explicit interfaces for props and state to ensure type safety.
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

  componentDidCatch(error: any, errorInfo: any) {
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
