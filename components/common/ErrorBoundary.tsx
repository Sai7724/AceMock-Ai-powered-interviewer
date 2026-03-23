import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * ErrorBoundary wraps children and catches runtime errors (e.g. from DarkVeil).
 * On error, renders a fallback div with the app background color so the app
 * continues to function normally.
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // Log silently — DarkVeil errors should not surface to the user
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[ErrorBoundary] Caught error:', error, info.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback !== undefined) {
        return this.props.fallback;
      }
      return (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--app-bg)',
          }}
          aria-hidden
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
