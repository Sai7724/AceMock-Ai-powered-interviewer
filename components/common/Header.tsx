import React, { useState, useEffect, useRef } from 'react';
import { Bars3Icon, XMarkIcon } from '../../constants';
import { useAuth } from '../../App';
import GlassSurface from './GlassSurface';
import GlassButton from './GlassButton';
import { Link } from 'react-router-dom';
import MainAvatar from './Avatars';
import { getLenis } from '../../lib/useLenis';
import LeaveInterviewModal from './LeaveInterviewModal';


const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'How It Works', href: '#howitworks' },
  { label: 'Features', href: '#features' },
  { label: 'About', href: '#projectinfo' },
];

interface NavbarProps {
  onReset: () => void;
  onStartAssessment?: () => void;
  onLeaveInterview?: () => void;
  showLandingNav?: boolean;
  authDisabled?: boolean;
  isInterviewActive?: boolean;
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
  onLeaveInterview,
  showLandingNav = false,
  authDisabled,
  isInterviewActive = false,
}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  const [active, setActive] = useState('Home');
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);

      // Auto-update active link based on scroll position
      if (showLandingNav) {
        const sections = navLinks.map(link => document.querySelector(link.href));
        let currentActive = 'Home';

        sections.forEach((section, idx) => {
          if (section) {
            const rect = section.getBoundingClientRect();
            // If section top is near the middle/top of viewport
            if (rect.top <= 150) {
              currentActive = navLinks[idx].label;
            }
          }
        });
        setActive(currentActive);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [showLandingNav]);

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

    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(href, { offset: -96, duration: 1.5 });
    } else {
      const section = document.querySelector(href);
      if (section) {
        const yOffset = -96;
        const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (showLandingNav) {
      handleNavClick(e, '#home', 'Home');
      return;
    }

    if (isInterviewActive) return;

    e.preventDefault();
    setIsMenuOpen(false);
    onReset();
  };

  const handleLeaveConfirm = () => {
    setIsLeaveModalOpen(false);
    
    // Attempt to exit fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    
    onLeaveInterview?.();
  };

  const handleStartAssessment = () => {
    setIsMenuOpen(false);
    onStartAssessment?.();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 font-sans">
      <nav className={`w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 transition-all duration-300 ${scrolled ? 'pt-2' : 'pt-4'}`}>
        <GlassSurface
          width="100%"
          height="auto"
          borderRadius={32}
          blur={scrolled ? 32 : 16}
          opacity={scrolled ? 0.85 : 0.7}
          backgroundOpacity={scrolled ? 0.08 : 0.04}
          className="px-4 py-3 sm:px-5 transition-all duration-300"
        >
          <div className="flex w-full items-center justify-between gap-4">
            <a 
              href="#home" 
              onClick={handleLogoClick} 
              className={`flex items-center space-x-3 select-none ${isInterviewActive ? 'cursor-default pointer-events-none' : 'cursor-pointer'}`}
              aria-label="Go to home"
            >
              <Logo />
              <span className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-[linear-gradient(135deg,#fff7ea_0%,#d9cfbf_48%,#e2cca0_100%)] tracking-tight whitespace-nowrap" style={{ fontFamily: 'Sora, Manrope, sans-serif' }}>
                AceMock
              </span>
            </a>

            {isInterviewActive ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-xs font-bold text-[color:var(--accent-gold-strong)] uppercase tracking-widest bg-white/5 py-2 px-4 rounded-full border border-white/5">
                  Interview Locked-in
                </div>
                <GlassButton
                  onClick={() => setIsLeaveModalOpen(true)}
                  variant="secondary"
                  className="rounded-full px-5 py-2.5 text-sm font-bold border-white/10 hover:bg-red-500/10 hover:text-red-400 !bg-opacity-10"
                >
                  Leave Interview
                </GlassButton>
              </div>
            ) : showLandingNav ? (
              <>
                <div className="hidden md:flex items-center gap-3 whitespace-nowrap">
                  <div className="liquid-pill flex items-center gap-1.5 px-2 py-1.5">
                    {navLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        onClick={(e) => handleNavClick(e, link.href, link.label)}
                        className={`liquid-nav-link px-3 py-2 text-sm font-semibold lg:text-[0.95rem] transition-all duration-300 ${active === link.label ? 'bg-white/10 text-[color:var(--accent-gold-strong)] shadow-[0_0_15px_rgba(232,195,97,0.3)]' : 'liquid-copy hover:text-[color:var(--accent-gold-strong)]'
                          }`}
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>

                  {!user && (
                    <GlassButton
                      onClick={handleStartAssessment}
                      className="rounded-full px-5 py-3 text-sm font-extrabold uppercase tracking-[0.16em]"
                    >
                      Start Assessment
                    </GlassButton>
                  )}

                  {!authDisabled && (
                    user ? (
                      <GlassButton as={Link} to="/profile" variant="secondary" className="rounded-full pl-1 pr-3 py-1 text-sm font-semibold flex items-center gap-1.5">
                        <div className="w-7 h-7 rounded-full border border-white/10 overflow-hidden shadow-sm">
                          <MainAvatar
                            seed={user.id}
                            name={user?.user_metadata?.username || user?.email || 'User'}
                            size="100%"
                          />
                        </div>
                        <span className="hidden lg:inline">My Profile</span>
                      </GlassButton>
                    ) : (
                      <GlassButton as={Link} to="/login" variant="secondary" className="rounded-full px-4 py-3 text-sm font-semibold">
                        Sign In
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
                className={`rounded-full px-4 py-2 text-xl font-bold transition-colors ${active === link.label ? 'bg-white/10 text-[color:var(--accent-gold-strong)] shadow-[0_0_15px_rgba(232,195,97,0.3)]' : 'liquid-copy hover:text-[color:var(--accent-gold-strong)]'
                  }`}
              >
                {link.label}
              </a>
            ))}

            {!user && (
              <GlassButton
                onClick={handleStartAssessment}
                className="w-[calc(100%-3rem)] rounded-full px-8 py-3 text-lg font-extrabold uppercase tracking-[0.16em]"
              >
                Start Assessment
              </GlassButton>
            )}

            {!authDisabled && (
              user ? (
                <GlassButton as={Link} to="/profile" variant="secondary" onClick={() => setIsMenuOpen(false)} className="w-[calc(100%-3rem)] rounded-full pl-1.5 pr-4 py-1.5 text-base font-bold flex items-center justify-center gap-2">
                  <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden shadow-md">
                    <MainAvatar
                      seed={user.id}
                      name={user?.user_metadata?.username || user?.email || 'User'}
                      size="100%"
                    />
                  </div>
                  My Profile
                </GlassButton>
              ) : (
                <GlassButton as={Link} to="/login" variant="secondary" onClick={() => setIsMenuOpen(false)} className="rounded-full px-4 py-3 text-sm font-semibold">
                  Login
                </GlassButton>
              )
            )}
          </GlassSurface>
        </div>
      )}

      <LeaveInterviewModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onConfirm={handleLeaveConfirm}
      />
    </header>
  );
}
