import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-slate-800/70 border border-slate-700 rounded-3xl p-12 shadow-2xl font-sans ${className}`}>
      {children}
    </div>
  );
}
