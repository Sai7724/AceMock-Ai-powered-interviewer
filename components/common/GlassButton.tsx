import React from 'react';
import GlassSurface from './GlassSurface';

export type GlassButtonProps<T extends React.ElementType = 'button'> = {
  as?: T;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning';
  borderRadius?: number;
  children: React.ReactNode;
} & React.ComponentPropsWithoutRef<T>;

export default function GlassButton<T extends React.ElementType = 'button'>({
  as,
  variant = 'primary',
  borderRadius = 999,
  children,
  className = '',
  ...props
}: GlassButtonProps<T>) {
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const isWarning = variant === 'warning';
  const Component = as || 'button';
  
  // Custom glass parameters for buttons
  let brightness = 40;
  let opacity = 0.7;
  let backgroundOpacity = 0.05;

  if (isPrimary) {
    brightness = 100; // Let the gradient shine
    opacity = 1;
    backgroundOpacity = 0; // CSS handles the gradient
  } else if (isDanger) {
    brightness = 50;
    opacity = 0.9;
    backgroundOpacity = 0.15;
  } else if (isWarning) {
    brightness = 55;
    opacity = 0.85;
    backgroundOpacity = 0.12;
  }
  
  return (
    <GlassSurface
      as={Component}
      width="auto"
      height="auto"
      borderRadius={borderRadius}
      blur={12}
      brightness={brightness}
      opacity={opacity}
      borderWidth={0} // let css handle borders
      backgroundOpacity={backgroundOpacity}
      className={`liquid-button-${variant} block ${className}`}
      {...props as any}
    >
      <div className="flex items-center justify-center w-full h-full relative z-10 px-0 py-0">
        {children}
      </div>
    </GlassSurface>
  );
}
