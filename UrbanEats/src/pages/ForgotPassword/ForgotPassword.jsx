import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Link } from 'react-router-dom';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    });
    setLoading(false);
    
    if (resetError) {
      if (resetError.message.toLowerCase().includes("user not found")) {
        setError('No account is registered with this email address.');
      } else if (resetError.message.toLowerCase().includes("rate limit")) {
        setError('Please wait a moment before requesting another reset link.');
      } else {
        setError('Failed to send reset email. Please check your email and try again.');
      }
    } else {
      setSubmitted(true);
    }
  };

  return (
    <div className="forgot-page page-content">
      <div className="contact-card">
        <div className="contact-brand-strip">
          <h2>Forgot Password</h2>
          <p>Enter your email and we'll send you a reset link</p>
        </div>
        <div className="contact-body">
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ display: "inline-flex", justifyContent: "center", alignItems: "center", width: "80px", height: "80px", borderRadius: "50%", background: "var(--primary-light)", color: "var(--primary)", marginBottom: "18px" }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: "38px", height: "38px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
              </div>
              <h3 style={{ fontWeight: 800, marginBottom: '8px' }}>Check your inbox!</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                We've sent a password reset link to <strong>{email}</strong>. Click the link in the email to set a new password.
              </p>
              <Link to="/login" className="auth-submit-btn" style={{ display: 'inline-block', textDecoration: 'none', padding: '12px 28px' }}>
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{
                  background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: '8px',
                  padding: '10px 14px', marginBottom: '16px', color: '#e74c3c', fontSize: '13px',
                }}>
                  {error}
                </div>
              )}
              <div className="auth-field">
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </span>
                  <input
                    type="email"
                    className="auth-input"
                    placeholder="Your registered email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                Note: You must wait 15 minutes before requesting another link.
              </p>
              <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: 'var(--text-muted)' }}>
                Remember your password? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
