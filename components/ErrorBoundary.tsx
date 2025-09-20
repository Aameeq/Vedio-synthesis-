import React from "react";

export class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean; error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
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
