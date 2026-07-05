import React, { useContext, useState, useEffect } from "react";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { login, loginWithGoogle } from "../../service/authService";
import { StoreContext } from "../../context/StoreContext";
import { toast } from "react-toastify";

// Convert Supabase error messages to user-friendly text
const getFriendlyError = (error) => {
  const msg = (error?.message || "").toLowerCase();
  if (msg.includes("invalid login credentials") || msg.includes("invalid credentials")) {
    return "Incorrect email or password. Please try again.";
  }
  if (msg.includes("email not confirmed")) {
    return "Please confirm your email before signing in. Check your inbox.";
  }
  if (msg.includes("too many requests") || msg.includes("rate limit")) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (msg.includes("user not found") || msg.includes("no user")) {
    return "No account found with this email. Sign up instead?";
  }
  if (msg.includes("network") || msg.includes("fetch")) {
    return "Network error. Please check your internet connection.";
  }
  return "Unable to sign in. Please try again.";
};

const Login = () => {
  const { setToken, loadCartData } = useContext(StoreContext);
  const navigate = useNavigate();
  const [data, setData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let errorDesc = null;

    // Check hash first (e.g. #error_description=...)
    if (window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      errorDesc = hashParams.get("error_description");
    }
    // If not in hash, check query string (e.g. ?error_description=...)
    if (!errorDesc && window.location.search) {
      const searchParams = new URLSearchParams(window.location.search);
      errorDesc = searchParams.get("error_description");
    }

    if (errorDesc) {
      // Clean up the URL so the error doesn't persist on refresh
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
    if (error) setError(""); // Clear error when user starts typing
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await login(data);
      if (response.status === 200) {
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);
        await loadCartData(response.data.token);

        const user = response.data.user;
        const rawName = user?.user_metadata?.name || user?.user_metadata?.full_name || user?.user_metadata?.display_name || user?.email?.split("@")[0] || "there";
        let firstName = rawName.split(" ")[0].split(".")[0].split("_")[0];
        firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

        toast.success(`Welcome back, ${firstName}!`);
        navigate("/");
      } else {
        setError("Unable to sign in. Please try again.");
      }
    } catch (err) {
      const msg = (err?.message || "").toLowerCase();
      if (msg.includes("email not confirmed")) {
        setError("Your email is not verified yet. Please check your inbox and click the verification link.");
      } else if (msg.includes("invalid login credentials") || msg.includes("invalid credentials")) {
        // Supabase returns same error for both wrong password AND non-existent email
        // We show a friendly message that covers both cases
        setError("No account found with this email, or the password is incorrect.");
      } else if (msg.includes("too many requests") || msg.includes("rate limit")) {
        setError("Too many attempts. Please wait a moment and try again.");
      } else if (msg.includes("network") || msg.includes("fetch")) {
        setError("Network error. Please check your internet connection.");
      } else {
        setError(getFriendlyError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      localStorage.removeItem("isRegistering");
      localStorage.setItem("oauthFlow", "true");
      await loginWithGoogle();
    } catch (error) {
      setError("Unable to sign in with Google. Please try again.");
    }
  };

  return (
    <div className="auth-page page-content">
      <div className="auth-card">
        {/* Brand Strip */}
        <div className="auth-brand-strip">
          <h2>Welcome back!</h2>
          <p>Sign in to continue your food journey</p>
        </div>

        {/* Form */}
        <div className="auth-body">
          <form onSubmit={onSubmitHandler}>

            {/* Inline Error */}
            {error && (
              <div style={{
                background: '#fff0f0',
                border: '1px solid #ffcccc',
                borderRadius: '10px',
                padding: '10px 14px',
                marginBottom: '16px',
                color: '#e74c3c',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            {/* Email */}
            <div className="auth-field">
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <input
                  id="login-email"
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

            {/* Password with eye toggle */}
            <div style={{ position: 'relative' }}>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="login-password"
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
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'right', marginBottom: '16px', marginTop: '8px' }}>
              <Link to="/forgot-password" style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="auth-submit-btn" id="login-submit-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-or">OR</div>

          <button type="button" className="auth-google-btn" id="login-google-btn" onClick={handleGoogleSignIn}>
            <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <p className="auth-footer-text">
            Don't have an account? <Link to="/register">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
