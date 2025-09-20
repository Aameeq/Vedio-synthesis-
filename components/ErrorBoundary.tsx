import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="w-full h-full flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-red-900/50 border border-red-700 text-white px-6 py-8 rounded-lg text-center">
                <h1 className="text-2xl font-bold mb-2">Something went wrong.</h1>
                <p className="text-red-200 mb-4">An unexpected error occurred, preventing the application from rendering correctly.</p>
                <details className="text-left bg-brand-dark-secondary p-3 rounded-md">
                    <summary className="cursor-pointer font-semibold">Error Details</summary>
                    <pre className="mt-2 text-sm text-red-300 whitespace-pre-wrap break-all">
                        {this.state.error?.toString()}
                    </pre>
                </details>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
