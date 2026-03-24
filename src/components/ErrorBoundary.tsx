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
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-red-900/20 border border-red-500/30 rounded-xl p-6">
            <h1 className="text-2xl font-bold text-red-500 mb-4">오류 발생</h1>
            <p className="text-white/80 mb-4">
              죄송합니다. 예상치 못한 오류가 발생했습니다.
            </p>
            <details className="text-sm text-white/60 mb-4">
              <summary className="cursor-pointer font-semibold">오류 세부정보</summary>
              <pre className="mt-2 text-xs bg-black/40 p-3 rounded overflow-auto">
                {this.state.error?.toString()}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition-colors"
            >
              페이지 새로고침
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
