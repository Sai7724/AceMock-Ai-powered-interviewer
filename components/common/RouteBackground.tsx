import React from 'react';
import { useReducedMotion } from 'framer-motion';
import ErrorBoundary from './ErrorBoundary';

const DarkVeil = React.lazy(() => import('./DarkVeil'));

interface RouteBackgroundProps {
  children: React.ReactNode;
}

export default function RouteBackground({ children }: RouteBackgroundProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* DarkVeil animated background - bottom layer */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{ zIndex: -10, willChange: 'transform' }}
      >
        <ErrorBoundary>
          <React.Suspense fallback={<div className="absolute inset-0 bg-[var(--app-bg)]" />}>
            {!prefersReducedMotion && <DarkVeil />}
          </React.Suspense>
        </ErrorBoundary>
      </div>

      {/* Subtle overlay gradient for depth */}
      <div 
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{ zIndex: 0 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(167,139,250,0.08)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,rgba(127,181,255,0.06)_0%,transparent_50%)]" />
      </div>

      {/* Content layer */}
      <div className="relative z-10 min-h-screen">{children}</div>
    </div>
  );
}
