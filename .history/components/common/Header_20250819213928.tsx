import React, { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '../../constants';
import { useAuth } from '../../App';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'How It Works', href: '#howitworks' },
  { label: 'Features', href: '#features' },
  { label: 'About', href: '#projectinfo' },
];

interface NavbarProps {
  onReset: () => void;
  showControls?: boolean;
  onShowProfile?: () => void;
  onShowLogin?: () => void;
  authDisabled?: boolean;
}

const Logo = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-cyan-400">
    <path d="M16.886 7.114A5.5 5.5 0 0 0 7.114 16.886a5.5 5.5 0 0 0 9.772-9.772ZM12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function Navbar({ onReset, showControls, onShowProfile, onShowLogin, authDisabled }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [active, setActive] = useState('Home');
  const { user, signOut } = useAuth();

  // Smooth scroll to section with offset for fixed navbar
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, label: string) => {
    e.preventDefault();
    setActive(label);
    setIsMenuOpen(false);
    const section = document.querySelector(href);
    if (section) {
      const yOffset = -80; // Adjust for navbar height
      const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Start Assessment triggers interview flow
  const handleStartAssessment = () => {
    setIsMenuOpen(false);
    onReset();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 font-sans">
      <nav className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          <a href="#home" className="flex items-center space-x-2 cursor-pointer select-none" aria-label="Go to home">
            <Logo />
            <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-cyan-400 tracking-tight font-sans whitespace-nowrap">AceMock</span>
          </a>
          <div className="hidden md:flex items-center space-x-3 lg:space-x-6 xl:space-x-12 whitespace-nowrap flex-nowrap">
            {navLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                onClick={e => handleNavClick(e, link.href, link.label)}
                className={`relative font-semibold px-1 md:px-2 py-1 transition-colors duration-200 text-base md:text-sm lg:text-lg ${active === link.label ? 'text-cyan-400' : 'text-slate-200 hover:text-cyan-300'}`}
              >
                {link.label}
                {active === link.label && (
                  <span className="absolute left-0 -bottom-1 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-fade-in-up" />
                )}
              </a>
            ))}
            {showControls && (
              <button
                onClick={handleStartAssessment}
                className="ml-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-2 px-6 rounded-full shadow-lg shadow-cyan-500/30 transform hover:scale-105 transition-all duration-300 ease-in-out text-lg border-2 border-transparent hover:border-cyan-300"
              >
                Start Assessment
              </button>
            )}
            {/* Auth buttons */}
            {!authDisabled && (
              user ? (
                <>
                  <button onClick={onShowProfile} className="bg-slate-800 text-cyan-400 px-4 py-2 rounded-lg border border-cyan-400">My Profile</button>
                  <button onClick={signOut} className="bg-slate-800 text-cyan-400 px-4 py-2 rounded-lg border border-cyan-400">Logout</button>
                </>
              ) : (
                <button onClick={onShowLogin} className="bg-cyan-500 text-white px-4 py-2 rounded-lg font-bold">Login</button>
              )
            )}
          </div>
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <XMarkIcon className="w-7 h-7" /> : <Bars3Icon className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </nav>
      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed top-0 left-0 right-0 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800 shadow-2xl transition-all duration-500 ease-in-out ${isMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'} glassmorphism`}
        style={{ zIndex: 49 }}
      >
        <div className="flex flex-col items-center py-8 space-y-6 animate-fade-in-up relative">
          {/* Close button for mobile menu */}
          <button
            className="absolute top-4 right-4 p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors md:hidden"
            aria-label="Close menu"
            onClick={() => setIsMenuOpen(false)}
          >
            <XMarkIcon className="w-7 h-7" />
          </button>
          {/* Navigation links */}
          {navLinks.map(link => (
            <a
              key={link.label}
              href={link.href}
              onClick={e => handleNavClick(e, link.href, link.label)}
              className={`font-bold text-xl ${active === link.label ? 'text-cyan-400' : 'text-slate-200 hover:text-cyan-300'} transition-colors`}
            >
              {link.label}
            </a>
          ))}
          {showControls && (
            <button
              onClick={handleStartAssessment}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-cyan-500/30 transform hover:scale-105 transition-all duration-300 ease-in-out text-lg border-2 border-transparent hover:border-cyan-300"
            >
              Start Assessment
            </button>
          )}
          {/* Auth buttons mobile */}
          {!authDisabled && (
            user ? (
              <>
                <button onClick={onShowProfile} className="bg-slate-800 text-cyan-400 px-4 py-2 rounded-lg border border-cyan-400">My Profile</button>
                <button onClick={signOut} className="bg-slate-800 text-cyan-400 px-4 py-2 rounded-lg border border-cyan-400">Logout</button>
              </>
            ) : (
              <button onClick={onShowLogin} className="bg-cyan-500 text-white px-4 py-2 rounded-lg font-bold">Login</button>
            )
          )}
        </div>
      </div>
      {/* Glassmorphism effect */}
      <style>{`
        .glassmorphism {
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          background: rgba(30, 41, 59, 0.7);
          border-radius: 0 0 1.5rem 1.5rem;
          border: 1px solid rgba(255,255,255,0.08);
        }
      `}</style>
    </header>
  );
}