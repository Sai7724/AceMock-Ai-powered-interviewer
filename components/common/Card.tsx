import React from 'react';
import GlassSurface from './GlassSurface';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export default function Card({
  children,
  className = '',
  title,
  onClick,
  style
}: CardProps) {
  return (
    <GlassSurface
      onClick={onClick}
      width="100%"
      height="100%"
      borderRadius={32}
      blur={18}
      opacity={0.8}
      borderWidth={0}
      backgroundOpacity={0.06}
      displace={0.4}
      className={`font-sans border border-white/5 h-full ${onClick ? 'cursor-pointer liquid-card-hover' : ''} p-6 sm:p-8 lg:p-10 ${className}`}
      style={style}
    >
      <div className="w-full h-full flex flex-col items-start justify-start">
        {title && <h3 className="text-lg font-bold mb-4">{title}</h3>}
        {children}
      </div>
    </GlassSurface>
  );
}
