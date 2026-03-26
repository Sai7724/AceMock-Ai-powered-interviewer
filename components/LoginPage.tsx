import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../App';
import GlassSurface from './common/GlassSurface';
import GlassButton from './common/GlassButton';


function getAuthErrorMessage(error: unknown, mode: 'login' | 'signup') {
  if (!(error instanceof Error)) return 'An unexpected error occurred.';
  const message = error.message.toLowerCase();
  if (mode === 'signup' && message.includes('email rate limit exceeded')) {
    return 'Too many signup emails were requested. Check your inbox and spam for the earlier confirmation email, then wait before trying again.';
  }
  if (mode === 'signup' && message.includes('user already registered')) {
    return 'This email is already registered. Use Login instead.';
  }
  return error.message;
}

export default function LoginPage() {
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
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

  // If already logged in, redirect home
  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  function switchMode(next: 'login' | 'signup') {
    setMode(next);
    setShowPassword(false);
    setError(null);
    setSuccess(null);
  }

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
        navigate('/', { replace: true });
      } else {
        const { session } = await signUp(normalizedEmail, password, {
          username: username.trim(),
          phone: phone.trim(),
        });
        if (!session) {
          setSuccess('Account created! Check your email to confirm it, then log in.');
          switchMode('login');
          setPassword('');
        } else {
          navigate('/', { replace: true });
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
    <>

      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 font-sans">
        {/* Logo / Brand */}
        <Link to="/" className="flex items-center gap-3 mb-10 group select-none">
          <svg
            width="38" height="38" viewBox="0 0 24 24" fill="none"
            className="text-cyan-400 group-hover:text-cyan-300 transition-colors"
          >
            <path d="M16.886 7.114A5.5 5.5 0 0 0 7.114 16.886a5.5 5.5 0 0 0 9.772-9.772ZM12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span
            className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text"
            style={{
              backgroundImage: 'linear-gradient(135deg,#fff7ea 0%,#d9cfbf 48%,#e2cca0 100%)',
              fontFamily: 'Sora, Manrope, sans-serif',
            }}
          >
            AceMock
          </span>
        </Link>

        {/* Glass Wrapper */}
        <GlassSurface 
          width="100%"
          style={{ maxWidth: '448px' }}
          borderRadius={20}
          blur={14}
          backgroundOpacity={0.06}
          opacity={0.8}
          displace={0.4}
          className="p-8 md:p-10 shadow-2xl relative z-10"
        >
          {/* Tab switcher */}
          <div className="flex rounded-xl bg-white/5 p-1.5 mb-8 border border-white/10">
            {(['login', 'signup'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => switchMode(tab)}
                className={`flex-1 py-2 rounded-lg text-sm font-bold tracking-wide transition-all duration-300 ${
                  mode === tab
                    ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(100,180,255,0.15)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1
              className="text-3xl font-extrabold tracking-tight mb-2"
              style={{
                fontFamily: 'Sora, Manrope, sans-serif',
                background: 'linear-gradient(135deg, #a5f3fc 0%, #818cf8 60%, #c084fc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {mode === 'login' ? 'Welcome back' : 'Get started free'}
            </h1>
            <p className="text-slate-400 text-sm">
              {mode === 'login'
                ? 'Sign in to continue your interview practice.'
                : 'Create your account to start acing interviews.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Signup extra fields */}
            {mode === 'signup' && (
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="login-input text-sm"
                />
                <input
                  type="tel"
                  required
                  placeholder="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="login-input text-sm"
                />
              </div>
            )}

            <input
              type="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input w-full"
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input w-full pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953.138 2.863.402M9.75 9.75l4.5 4.5m0-4.5-4.5 4.5M21 12a9.75 9.75 0 1 1-19.5 0 9.75 9.75 0 0 1 19.5 0Z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.639 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.639 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Messages */}
            {success && (
              <div className="text-emerald-400 text-sm text-center font-medium bg-emerald-400/10 rounded-xl px-4 py-3 border border-emerald-400/20">
                {success}
              </div>
            )}
            {error && (
              <div className="text-rose-400 text-sm text-center font-medium bg-rose-400/10 rounded-xl px-4 py-3 border border-rose-400/20">
                {error}
              </div>
            )}

            {/* Submit */}
            <GlassButton
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              borderRadius={8}
              className="w-full py-3 px-6 font-bold text-base mt-6 liquid-button-primary"
            >
              {loading
                ? 'Processing...'
                : mode === 'login' ? 'Sign In' : 'Create Account'}
            </GlassButton>
          </form>

          {/* Back to home */}
          <div className="mt-8 text-center">
            <Link
              to="/"
              className="text-slate-500 hover:text-slate-300 text-sm transition-colors inline-flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to home
            </Link>
          </div>
        </GlassSurface>

        {/* Footer note */}
        <p className="mt-10 text-xs text-slate-600 text-center">
          &copy; {new Date().getFullYear()} AceMock. All rights reserved.
        </p>
      </div>

      <style>{`
        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(3%, 5%) scale(1.05); }
          66% { transform: translate(-3%, -3%) scale(0.97); }
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* --- Inputs --- */
        .login-input {
          display: block;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.10);
          border-radius: 8px;
          padding: 0.875rem 1rem;
          color: #e2e8f0;
          font-size: 0.9rem;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          width: 100%;
        }
        .login-input::placeholder { color: rgba(148, 163, 184, 0.6); }
        .login-input:focus {
          border-color: rgba(100, 180, 255, 0.45);
          background: rgba(255, 255, 255, 0.07);
          box-shadow: 0 0 0 3px rgba(100, 180, 255, 0.12);
        }

        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        /* --- Social buttons --- */
        .login-social-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.10);
          color: #e2e8f0;
          font-size: 0.8rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, transform 0.15s;
        }
        .login-social-btn:hover {
          background: rgba(255, 255, 255, 0.10);
          border-color: rgba(255, 255, 255, 0.18);
          transform: translateY(-1px);
        }
      `}</style>
    </>
  );
}
