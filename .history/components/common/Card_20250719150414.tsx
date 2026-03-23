import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-slate-800/70 border border-slate-700 rounded-lg p-6 ${className}`}>
      {children}
    </div>
  );
}
