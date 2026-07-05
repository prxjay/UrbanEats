import React, { useState, useContext, useEffect } from "react";
import "./Register.css";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { register, loginWithGoogle } from "../../service/authService";
import { StoreContext } from "../../context/StoreContext";

const Register = () => {
  const navigate = useNavigate();
  const { setToken, loadCartData } = useContext(StoreContext);
  const [data, setData] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let errorDesc = null;
    
    if (window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      errorDesc = hashParams.get("error_description");
    }
    if (!errorDesc && window.location.search) {
      const searchParams = new URLSearchParams(window.location.search);
      errorDesc = searchParams.get("error_description");
    }

    if (errorDesc) {
      window.history.replaceState(null, "", window.location.pathname);
      if (errorDesc.includes("Database error saving new user") || errorDesc.includes("already registered")) {
        setError("An account with this email already exists. Please sign in with your password.");
      } else {
        setError(errorDesc.replace(/\+/g, ' '));
      }
    }
  }, []);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setData((d) => ({ ...d, [name]: value }));
    if (error) setError("");
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await register(data.email, data.password, data.name);
      if (response.status === 200 && response.data.needsConfirmation) {
        // Don't log in — show "check your email" screen
        setEmailSent(true);
      } else {
        setError("Unable to register. Please try again.");
      }
    } catch (error) {
      console.error(error);
      const rawMsg = error?.message || "";
      const msg = typeof rawMsg === 'string' ? rawMsg.toLowerCase() : "";
      
      if (msg.includes("already registered") || msg.includes("user already")) {
        setError("An account with this email already exists. Sign in instead?");
      } else if (msg.includes("weak password") || msg.includes("password should")) {
        setError("Password must be at least 6 characters.");
      } else if (rawMsg === "{}" || !rawMsg) {
        setError("SMTP Error: Failed to send email. Check Supabase SMTP settings.");
      } else {
        setError(typeof rawMsg === 'string' ? rawMsg : "Unable to register. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      localStorage.setItem("isRegistering", "true");
      localStorage.setItem("oauthFlow", "true");
      await loginWithGoogle();
    } catch (error) {
      toast.error("Unable to sign in with Google. Please try again");
    }
  };

  // ── EMAIL SENT SCREEN ──────────────────────────────────────────────────────
  if (emailSent) {
    return (
      <div className="auth-page register-page page-content">
        <div className="auth-card">
          <div className="auth-brand-strip" style={{ background: "linear-gradient(135deg, #fc8019, #e5711a)" }}>
            <h2>Check your inbox!</h2>
            <p>A verification link has been sent</p>
          </div>
          <div className="auth-body" style={{ textAlign: "center", padding: "36px 32px" }}>
            <div style={{ display: "inline-flex", justifyContent: "center", alignItems: "center", width: "80px", height: "80px", borderRadius: "50%", background: "var(--primary-light)", color: "var(--primary)", marginBottom: "18px" }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: "38px", height: "38px" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            </div>
            <h3 style={{ fontWeight: 800, color: "#1e293b", marginBottom: "10px" }}>Verify your email</h3>
            <p style={{ color: "#64748b", fontSize: "14px", lineHeight: 1.7, marginBottom: "24px" }}>
              We sent a verification link to <strong>{data.email}</strong>.<br />
              Click the link in that email to activate your account.
            </p>
            <div style={{
              background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px",
              padding: "14px 16px", fontSize: "13px", color: "#64748b", marginBottom: "24px"
            }}>
              Didn't receive it? Check your spam folder or{" "}
              <button
                onClick={() => setEmailSent(false)}
                style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: 700, cursor: "pointer", padding: 0 }}
              >
                try again
              </button>.
            </div>
            <button className="auth-submit-btn" onClick={() => navigate("/login")}>
              Go to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page register-page page-content">
      <div className="auth-card">
        {/* Brand Strip */}
        <div className="auth-brand-strip">
          <h2>Create account</h2>
          <p>Join us and start ordering delicious food</p>
        </div>

        {/* Form */}
        <div className="auth-body">
          <form onSubmit={onSubmitHandler}>
            {/* Inline Error */}
            {error && (
              <div style={{
                background: '#fff0f0', border: '1px solid #ffcccc',
                borderRadius: '10px', padding: '10px 14px', marginBottom: '16px',
                color: '#e74c3c', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}
            {/* Name */}
            <div className="auth-field">
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
                <input
                  id="register-name"
                  type="text"
                  className="auth-input"
                  placeholder="Full name"
                  name="name"
                  onChange={onChangeHandler}
                  value={data.name}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="auth-field">
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input
                  id="register-email"
                  type="email"
                  className="auth-input"
                  placeholder="Email address"
                  name="email"
                  onChange={onChangeHandler}
                  value={data.email}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-field">
              <div style={{ position: 'relative' }}>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="Password"
                    name="password"
                    onChange={onChangeHandler}
                    value={data.password}
                    required
                    style={{ paddingRight: '44px' }}
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
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" id="register-submit-btn" disabled={loading}>{loading ? 'Creating Account...' : 'Create Account'}</button>
          </form>

          <div className="auth-or">OR</div>

          <button type="button" className="auth-google-btn" id="register-google-btn" onClick={handleGoogleSignIn}>
            <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="auth-footer-text">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
