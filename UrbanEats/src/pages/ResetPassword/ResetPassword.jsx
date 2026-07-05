import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './ResetPassword.css';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const navigate = useNavigate();

  const [urlError, setUrlError] = useState('');

  useEffect(() => {
    // Check for hash errors (like expired links)
    if (window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      if (hashParams.get('error')) {
        const errorDesc = hashParams.get('error_description') || 'This reset link is invalid or has expired.';
        setUrlError(errorDesc.replace(/\+/g, ' '));
        setSessionReady(true);
        return;
      }
    }

    // Check if recovery session is already loaded/valid
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
      }
    });

    // Listen to password recovery event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) {
        setSessionReady(true);
      }
    });

    // Timeout fallback: if event doesn't fire in 2 seconds, render form to avoid locking user out
    const timer = setTimeout(() => {
      setSessionReady(true);
    }, 2000);

    return () => {
      subscription?.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error('Failed to reset password. The link may have expired.');
    } else {
      toast.success('Password reset successfully! Please sign in.');
      await supabase.auth.signOut();
      navigate('/login');
    }
  };

  return (
    <div className="reset-page page-content">
      <div className="contact-card">
        <div className="contact-brand-strip">
          <h2>Set New Password</h2>
          <p>Choose a strong password for your account</p>
        </div>
        <div className="contact-body">
          {!sessionReady ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
              <div className="spinner-border text-primary mb-3" role="status"></div>
              <p>Verifying your reset link...</p>
            </div>
          ) : urlError ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ display: "inline-flex", justifyContent: "center", alignItems: "center", width: "64px", height: "64px", borderRadius: "50%", background: "#fff0f0", color: "#e74c3c", marginBottom: "16px" }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: "32px", height: "32px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 style={{ fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Link Expired or Invalid</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                {urlError}
              </p>
              <button className="auth-submit-btn" onClick={() => navigate('/forgot-password')}>
                Request New Link
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="auth-field">
                <label style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>New Password</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="auth-field">
                <label style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Confirm Password</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 12l2 2 4-4"/><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '24px' }}>
                <input type="checkbox" onChange={e => setShowPassword(e.target.checked)} style={{ accentColor: 'var(--primary)' }} />
                Show passwords
              </label>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Updating...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
