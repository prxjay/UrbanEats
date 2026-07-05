import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import loginBg from '../../assets/login-bg.png';

const ADMIN_EMAIL = 'prawinkrk@gmail.com';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (email !== ADMIN_EMAIL) {
      setError('Access denied. This portal is for administrators only.');
      return;
    }
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) {
      setError('Invalid credentials. Please check your email and password.');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (email !== ADMIN_EMAIL) {
      setError('This email is not associated with an admin account.');
      return;
    }
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    });
    setLoading(false);
    if (resetError) {
      setError('Failed to send reset email. Please try again.');
    } else {
      setResetSent(true);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: `url(${loginBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
      padding: '20px',
    }}>
      {/* Dark overlay */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.45)',
        pointerEvents: 'none',
      }} />

      <div style={{
        background: '#fff',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1,
        animation: 'fadeInUp 0.4s ease',
      }}>
        {/* Orange Header Strip */}
        <div style={{
          background: 'linear-gradient(135deg, #fc8019, #e5711a)',
          padding: '32px 32px 28px',
          textAlign: 'center',
        }}>
          <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: 900, margin: '0 0 6px', letterSpacing: '-0.3px' }}>
            {forgotMode ? 'Reset Password' : 'Admin Portal'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', margin: 0 }}>
            {forgotMode ? 'Enter your admin email to reset' : 'UrbanEats Management System'}
          </p>
        </div>

        {/* Form Body */}
        <div style={{ padding: '28px 32px 36px' }}>
          {resetSent ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: '44px', marginBottom: '12px' }}>📧</div>
              <h3 style={{ fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Check your inbox!</h3>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
                Reset link sent to <strong>{email}</strong>
              </p>
              <button onClick={() => { setForgotMode(false); setResetSent(false); }}
                style={{ background: '#fc8019', border: 'none', color: '#fff', borderRadius: '10px', padding: '12px 28px', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={forgotMode ? handleForgotPassword : handleLogin}>
              {error && (
                <div style={{
                  background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: '10px',
                  padding: '10px 14px', marginBottom: '18px', color: '#e74c3c', fontSize: '13px',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <i className="bi bi-exclamation-circle-fill"></i>{error}
                </div>
              )}

              {/* Email field */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                    color: '#94a3b8', display: 'flex',
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Email address"
                    required
                    style={{
                      width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '10px',
                      padding: '12px 14px 12px 42px', fontSize: '14px', color: '#1e293b',
                      outline: 'none', boxSizing: 'border-box', background: '#f8fafc',
                      transition: 'all 0.2s ease',
                    }}
                    onFocus={e => { e.target.style.borderColor = '#fc8019'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(252,128,25,0.12)'; }}
                    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              {/* Password field (login only) */}
              {!forgotMode && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                      color: '#94a3b8', display: 'flex',
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                      style={{
                        width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '10px',
                        padding: '12px 44px 12px 42px', fontSize: '14px', color: '#1e293b',
                        outline: 'none', boxSizing: 'border-box', background: '#f8fafc',
                        transition: 'all 0.2s ease',
                      }}
                      onFocus={e => { e.target.style.borderColor = '#fc8019'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(252,128,25,0.12)'; }}
                      onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                        color: '#94a3b8', display: 'flex', alignItems: 'center',
                      }}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  <div style={{ textAlign: 'right', marginTop: '8px' }}>
                    <button type="button" onClick={() => { setForgotMode(true); setError(''); }}
                      style={{ background: 'none', border: 'none', color: '#fc8019', fontSize: '13px', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                      Forgot password?
                    </button>
                  </div>
                </div>
              )}

              <div style={{ marginTop: forgotMode ? '24px' : '20px' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%', background: loading ? '#f4a261' : '#fc8019',
                    border: 'none', borderRadius: '12px', padding: '14px',
                    color: '#fff', fontWeight: 800, fontSize: '15px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 16px rgba(252,128,25,0.35)',
                    transition: 'all 0.2s ease', letterSpacing: '0.2px',
                  }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#e5711a'; }}
                  onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#fc8019'; }}
                >
                  {loading ? 'Please wait...' : forgotMode ? 'Send Reset Email' : 'Sign In'}
                </button>

                {forgotMode && (
                  <button type="button" onClick={() => { setForgotMode(false); setError(''); }}
                    style={{
                      width: '100%', marginTop: '10px', background: '#f8fafc',
                      border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '12px',
                      color: '#64748b', fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                    }}>
                    Back to Login
                  </button>
                )}
              </div>
            </form>
          )}

          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px', marginTop: '24px', marginBottom: 0 }}>
            Restricted Access — Authorized Personnel Only
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Login;
