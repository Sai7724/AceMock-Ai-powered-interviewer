import React, { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '../../constants';

const Logo = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-cyan-400">
    <path d="M16.886 7.114A5.5 5.5 0 0 0 7.114 16.886a5.5 5.5 0 0 0 9.772-9.772ZM12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface HeaderProps {
    onReset: () => void;
    showControls?: boolean;
}

export default function Header({ onReset, showControls }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleResetClick = () => {
    setIsMenuOpen(false);
    onReset();
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
      <nav className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={handleResetClick}>
                <Logo />
                <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-cyan-400 tracking-tight">
                AceMock
                </h1>
            </div>
            
            {showControls && (
                <>
                    <div className="hidden md:block">
                        <button onClick={handleResetClick} className="bg-slate-700 hover:bg-slate-600 text-slate-100 font-semibold py-2 px-4 rounded-lg transition-colors duration-300">
                            Restart Interview
                        </button>
                    </div>
                    <div className="md:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700">
                            {isMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
                        </button>
                    </div>
                </>
            )}
        </div>
      </nav>

      {isMenuOpen && showControls && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-slate-900 border-b border-slate-800">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <button onClick={handleResetClick} className="w-full text-left bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold block px-3 py-2 rounded-md text-base">
                    Restart Interview
                </button>
            </div>
        </div>
      )}
    </header>
  );
}