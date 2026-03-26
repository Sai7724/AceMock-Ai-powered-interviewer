import React from 'react';

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
    <div
      onClick={onClick}
      className={`liquid-panel font-sans border border-white/5 h-full rounded-[32px] ${onClick ? 'cursor-pointer liquid-card-hover' : ''} p-6 sm:p-8 lg:p-10 ${className}`}
      style={style}
    >
      <div className="w-full h-full flex flex-col items-start justify-start">
        {title && <h3 className="text-lg font-bold mb-4">{title}</h3>}
        {children}
      </div>
    </div>
  );
}
