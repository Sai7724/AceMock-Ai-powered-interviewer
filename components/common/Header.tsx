import React, { useState, useEffect, useRef } from 'react';
import { Bars3Icon, XMarkIcon } from '../../constants';
import { useAuth } from '../../App';
import GlassSurface from './GlassSurface';
import GlassButton from './GlassButton';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'How It Works', href: '#howitworks' },
  { label: 'Features', href: '#features' },
  { label: 'About', href: '#projectinfo' },
];

interface NavbarProps {
  onReset: () => void;
  onStartAssessment?: () => void;
  showLandingNav?: boolean;
  onShowProfile?: () => void;
  onShowLogin?: () => void;
  authDisabled?: boolean;
}

const Logo = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[color:var(--accent-gold-strong)]">
    <path d="M16.886 7.114A5.5 5.5 0 0 0 7.114 16.886a5.5 5.5 0 0 0 9.772-9.772ZM12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Navbar({
  onReset,
  onStartAssessment,
  showLandingNav = false,
  onShowProfile,
  onShowLogin,
  authDisabled,
}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [active, setActive] = useState('Home');
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, label: string) => {
    e.preventDefault();
    setActive(label);
    setIsMenuOpen(false);

    const section = document.querySelector(href);
    if (section) {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const yOffset = -96;
      const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (showLandingNav) {
      handleNavClick(e, '#home', 'Home');
      return;
    }

    e.preventDefault();
    setIsMenuOpen(false);
    onReset();
  };

  const handleStartAssessment = () => {
    setIsMenuOpen(false);
    onStartAssessment?.();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 font-sans">
      <nav className="w-full max-w-7xl mx-auto px-3 pt-3 sm:px-4 lg:px-6">
        <GlassSurface
          width="100%"
          height="auto"
          borderRadius={32}
          blur={scrolled ? 24 : 16}
          opacity={0.8}
          backgroundOpacity={0.06}
          className="px-4 py-3 sm:px-5"
        >
          <div className="flex w-full items-center justify-between gap-4">
            <a href="#home" onClick={handleLogoClick} className="flex items-center space-x-3 cursor-pointer select-none" aria-label="Go to home">
              <Logo />
              <span className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-[linear-gradient(135deg,#fff7ea_0%,#d9cfbf_48%,#e2cca0_100%)] tracking-tight whitespace-nowrap" style={{ fontFamily: 'Sora, Manrope, sans-serif' }}>
                AceMock
              </span>
            </a>

            {showLandingNav ? (
              <>
                <div className="hidden md:flex items-center gap-3 whitespace-nowrap">
                  <div className="liquid-pill flex items-center gap-1.5 px-2 py-1.5">
                    {navLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        onClick={(e) => handleNavClick(e, link.href, link.label)}
                        className={`liquid-nav-link px-3 py-2 text-sm font-semibold lg:text-[0.95rem] ${active === link.label ? 'liquid-nav-link-active' : 'liquid-copy'
                          }`}
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>

                  <GlassButton
                    onClick={handleStartAssessment}
                    className="rounded-full px-5 py-3 text-sm font-extrabold uppercase tracking-[0.16em]"
                  >
                    Start Assessment
                  </GlassButton>

                  {!authDisabled && (
                    user ? (
                      <GlassButton variant="secondary" onClick={onShowProfile} className="rounded-full px-4 py-3 text-sm font-semibold">
                        My Profile
                      </GlassButton>
                    ) : (
                      <GlassButton variant="secondary" onClick={onShowLogin} className="rounded-full px-4 py-3 text-sm font-semibold">
                        Login
                      </GlassButton>
                    )
                  )}
                </div>

                <div className="md:hidden flex items-center">
                  <GlassButton
                    variant="secondary"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="rounded-full p-2.5"
                    aria-label="Toggle menu"
                  >
                    {isMenuOpen ? <XMarkIcon className="w-7 h-7" /> : <Bars3Icon className="w-7 h-7" />}
                  </GlassButton>
                </div>
              </>
            ) : (
              <div className="h-10" />
            )}
          </div>
        </GlassSurface>
      </nav>

      {showLandingNav && (
        <div
          ref={menuRef}
          className={`md:hidden fixed left-3 right-3 top-[5.25rem] transition-all duration-500 ease-in-out ${isMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'
            }`}
          style={{ zIndex: 49 }}
        >
          <GlassSurface
            width="100%"
            height="auto"
            borderRadius={32}
            blur={20}
            opacity={0.9}
            backgroundOpacity={0.1}
            className="flex flex-col items-center py-8 space-y-6 relative"
          >
            <GlassButton
              variant="secondary"
              className="absolute top-4 right-4 rounded-full p-2 md:hidden"
              aria-label="Close menu"
              onClick={() => setIsMenuOpen(false)}
            >
              <XMarkIcon className="w-7 h-7" />
            </GlassButton>

            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href, link.label)}
                className={`rounded-full px-4 py-2 text-xl font-bold transition-colors ${active === link.label ? 'bg-white/10 text-[color:var(--accent-gold-strong)]' : 'liquid-copy hover:text-[color:var(--accent-blue-strong)]'
                  }`}
              >
                {link.label}
              </a>
            ))}

            <GlassButton
              onClick={handleStartAssessment}
              className="w-[calc(100%-3rem)] rounded-full px-8 py-3 text-lg font-extrabold uppercase tracking-[0.16em]"
            >
              Start Assessment
            </GlassButton>

            {!authDisabled && (
              user ? (
                <GlassButton variant="secondary" onClick={onShowProfile} className="rounded-full px-4 py-3 text-sm font-semibold">
                  My Profile
                </GlassButton>
              ) : (
                <GlassButton variant="secondary" onClick={onShowLogin} className="rounded-full px-4 py-3 text-sm font-semibold">
                  Login
                </GlassButton>
              )
            )}
          </GlassSurface>
        </div>
      )}
    </header>
  );
}
