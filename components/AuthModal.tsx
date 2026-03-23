import React, { useState, useRef } from 'react';
import { useAuth } from '../App';
import GlassButton from './common/GlassButton';
import GlassSurface from './common/GlassSurface';

function getAuthErrorMessage(error: unknown, mode: 'login' | 'signup') {
  if (!(error instanceof Error)) {
    return 'An unexpected error occurred.';
  }

  const message = error.message.toLowerCase();

  if (mode === 'signup' && message.includes('email rate limit exceeded')) {
    return 'Too many signup emails were requested. Check your inbox and spam for the earlier confirmation email, then wait before trying again.';
  }

  if (mode === 'signup' && message.includes('user already registered')) {
    return 'This email is already registered. Use Login instead.';
  }

  return error.message;
}

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const isSubmittingRef = useRef(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const closeModal = () => {
    setShowPassword(false);
    setError(null);
    setSuccess(null);
    onClose();
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const normalizedEmail = email.trim();

      if (mode === 'login') {
        await signIn(normalizedEmail, password);
        closeModal();
      } else {
        const { session } = await signUp(normalizedEmail, password, {
          username: username.trim(),
          phone: phone.trim(),
        });

        if (!session) {
          setSuccess('Account created. Check your email to confirm it, then log in.');
          setMode('login');
          setPassword('');
          setShowPassword(false);
        } else {
          closeModal();
        }
      }
    } catch (err) {
      setError(getAuthErrorMessage(err, mode));
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-2xl">
      <GlassSurface
        as="form"
        onSubmit={handleSubmit}
        borderRadius={32}
        blur={24}
        backgroundOpacity={0.08}
        displace={0.4}
        className="w-full max-w-md p-8 md:p-10 flex flex-col gap-6"
      >
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-cyan-400 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
            {mode === 'login' ? 'Access Terminal' : 'Join the Directive'}
          </h2>
          <p className="text-slate-400 text-sm">
            {mode === 'login' ? 'Identify yourself to proceed.' : 'Create your secure access credentials.'}
          </p>
        </div>

        <div className="space-y-4">
          {mode === 'signup' && (
            <div className="grid grid-cols-2 gap-4">
              <input 
                type="text" 
                required 
                placeholder="Username" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                className="liquid-input text-sm" 
              />
              <input 
                type="tel" 
                required 
                placeholder="Phone" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                className="liquid-input text-sm" 
              />
            </div>
          )}
          
          <input 
            type="email" 
            required 
            placeholder="Institutional Email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="liquid-input w-full" 
          />
          
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Security Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="liquid-input w-full pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953.138 2.863.402M9.75 9.75l4.5 4.5m0-4.5-4.5 4.5M21 12a9.75 9.75 0 1 1-19.5 0 9.75 9.75 0 0 1 19.5 0Z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.639 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.639 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
              )}
            </button>
          </div>
        </div>

        {success && <div className="text-emerald-400 text-sm text-center font-medium">{success}</div>}
        {error && <div className="text-rose-400 text-sm text-center font-medium">{error}</div>}

        <div className="space-y-4">
          <GlassButton 
            type="submit" 
            className="w-full rounded-2xl py-4 font-bold text-lg liquid-button-primary animate-pulse-subtle" 
            disabled={loading}
          >
            {loading ? 'Processing...' : (mode === 'login' ? 'Initialize Session' : 'Create Credentials')}
          </GlassButton>
          
          <div className="flex items-center gap-4 py-2">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Or continue with</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button type="button" className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-semibold">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
              Google
            </button>
            <button type="button" className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-semibold">
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
              GitHub
            </button>
          </div>
        </div>

        <div className="text-center">
          <button 
            type="button" 
            className="text-cyan-400/80 hover:text-cyan-400 text-sm font-semibold underline-offset-4 hover:underline transition-all" 
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setShowPassword(false); setError(null); setSuccess(null); }}
          >
            {mode === 'login' ? "New operative? Create an account" : "Already have access? Back to Login"}
          </button>
        </div>

        <button 
          type="button" 
          onClick={closeModal}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </GlassSurface>
    </div>
  );
}
