'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, useRef, useEffect } from 'react';

export default function LandingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const authRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (authRef.current && !authRef.current.contains(e.target as Node)) {
        setShowAuth(false);
      }
    }
    if (showAuth) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAuth]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const supabase = createClient();

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage('Check your email for a confirmation link.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        window.location.href = '/dashboard';
      }
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Nav */}
      <nav style={{
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-base)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 700, color: '#fff',
            fontFamily: 'var(--font-display)',
          }}>U</div>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700,
            color: 'var(--text)', letterSpacing: '-0.02em',
          }}>UpKept</span>
        </div>
        <div style={{ position: 'relative' }} ref={authRef}>
          <button
            onClick={() => setShowAuth(!showAuth)}
            style={{
              padding: '8px 20px', borderRadius: 'var(--radius)',
              background: 'var(--primary)', color: '#fff', border: 'none',
              fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Sign in
          </button>

          {showAuth && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              width: 340, padding: 24, borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-base)', border: '1px solid var(--border)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              zIndex: 100,
            }}>
              <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ fontSize: 14, padding: '10px 12px' }}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{ fontSize: 14, padding: '10px 12px' }}
                />
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '10px 20px', borderRadius: 'var(--radius)',
                    background: 'var(--primary)', color: '#fff', border: 'none',
                    fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600,
                    cursor: loading ? 'wait' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? 'Please wait...' : isSignUp ? 'Sign up' : 'Sign in'}
                </button>
              </form>

              <p style={{
                textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)',
                fontFamily: 'var(--font-body)', marginTop: 12,
              }}>
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null); }}
                  style={{
                    background: 'none', border: 'none', color: 'var(--primary)',
                    cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13,
                    fontWeight: 600, padding: 0,
                  }}
                >
                  {isSignUp ? 'Sign in' : 'Sign up'}
                </button>
              </p>

              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0',
              }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>or</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>

              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  width: '100%', padding: '10px 20px', borderRadius: 'var(--radius)',
                  background: 'var(--bg-surface)', color: 'var(--text)',
                  border: '1px solid var(--border)',
                  fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 500,
                  cursor: loading ? 'wait' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>

              {error && (
                <div style={{
                  marginTop: 12, padding: '10px 14px', borderRadius: 'var(--radius)',
                  background: 'var(--red-dim)', color: 'var(--red)',
                  fontSize: 13, fontFamily: 'var(--font-body)',
                }}>
                  {error}
                </div>
              )}

              {message && (
                <div style={{
                  marginTop: 12, padding: '10px 14px', borderRadius: 'var(--radius)',
                  background: 'var(--green-dim)', color: 'var(--green)',
                  fontSize: 13, fontFamily: 'var(--font-body)',
                }}>
                  {message}
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <main style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '80px 32px 40px',
        maxWidth: 960, margin: '0 auto', width: '100%',
      }}>
        {/* Badge */}
        <div
          className="animate-slide-in"
          style={{
            padding: '6px 16px', borderRadius: 20,
            background: 'var(--primary-dim)',
            border: '1px solid rgba(15,108,189,0.15)',
            fontSize: 12, fontFamily: 'var(--font-display)', fontWeight: 500,
            color: 'var(--primary)', letterSpacing: '0.02em',
            marginBottom: 24,
          }}
        >
          Asset & Compliance Autopilot
        </div>

        {/* Heading */}
        <h1
          className="animate-slide-in"
          style={{
            fontFamily: 'var(--font-display)', fontSize: 52, fontWeight: 800,
            color: 'var(--text)', textAlign: 'center',
            lineHeight: 1.1, letterSpacing: '-0.03em',
            maxWidth: 700, marginBottom: 20,
            animationDelay: '60ms', animationFillMode: 'both',
          }}
        >
          Maintenance on autopilot.
          <br />
          <span style={{ color: 'var(--primary)' }}>Compliance handled.</span>
        </h1>

        {/* Subheading */}
        <p
          className="animate-slide-in"
          style={{
            fontFamily: 'var(--font-body)', fontSize: 17,
            color: 'var(--text-secondary)', textAlign: 'center',
            maxWidth: 540, lineHeight: 1.6, marginBottom: 40,
            animationDelay: '120ms', animationFillMode: 'both',
          }}
        >
          UpKept autonomously tracks your assets, finds vendors, schedules maintenance,
          and keeps you compliant — so you can focus on what matters.
        </p>

        {/* Features */}
        <div
          className="animate-slide-in"
          style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20,
            marginTop: 80, width: '100%',
            animationDelay: '300ms', animationFillMode: 'both',
          }}
        >
          {[
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              ),
              title: 'Compliance Autopilot',
              desc: 'Automatically tracks deadlines, generates evidence, and keeps you audit-ready.',
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
              ),
              title: 'Smart Scheduling',
              desc: 'AI finds the best vendors, negotiates timing, and schedules maintenance autonomously.',
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.21 15.89A10 10 0 118 2.83" /><path d="M22 12A10 10 0 0012 2v10z" />
                </svg>
              ),
              title: 'Full Visibility',
              desc: 'Graph view, timeline, calendar — see every asset, task, and deadline in one place.',
            },
          ].map((f) => (
            <div
              key={f.title}
              style={{
                padding: 24, borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                background: 'var(--bg-base)',
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'var(--bg-surface)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 14,
              }}>
                {f.icon}
              </div>
              <h3 style={{
                fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600,
                color: 'var(--text)', marginBottom: 6,
              }}>{f.title}</h3>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: 13,
                color: 'var(--text-secondary)', lineHeight: 1.5,
              }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '24px 32px', textAlign: 'center',
        borderTop: '1px solid var(--border)',
        fontSize: 12, color: 'var(--text-muted)',
        fontFamily: 'var(--font-body)',
      }}>
        UpKept — Autonomous Asset & Compliance Management
      </footer>
    </div>
  );
}
