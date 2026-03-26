import React from 'react';

interface RouteBackgroundProps {
  children: React.ReactNode;
}

export default function RouteBackground({ children }: RouteBackgroundProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Subtle radial glow overlays for depth — sits above the Dither canvas */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{ zIndex: 0 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(82,38,255,0.08)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,rgba(0,0,0,0.35)_0%,transparent_60%)]" />
      </div>

      {/* Content layer */}
      <div className="relative z-10 min-h-screen">{children}</div>
    </div>
  );
}
