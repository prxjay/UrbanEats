import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import "./EmailVerified.css";

const EmailVerified = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"

  useEffect(() => {
    // Supabase sets the session automatically when user clicks the verification link.
    // onAuthStateChange will fire with the event "EMAIL_CONFIRMED" or "SIGNED_IN".
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "EMAIL_CONFIRMED" || event === "SIGNED_IN") {
        // Sign out immediately so user has to log in manually
        supabase.auth.signOut();
        setStatus("success");
      }
    });

    // Also check current session in case redirect already set it
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email_confirmed_at) {
        supabase.auth.signOut();
        setStatus("success");
      } else if (status === "loading") {
        // Short timeout fallback — if no session detected after 3s, show error
        setTimeout(() => {
          setStatus((prev) => prev === "loading" ? "error" : prev);
        }, 3000);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="email-verified-page page-content">
      <div className="email-verified-card">
        {status === "loading" && (
          <>
            <div className="ev-spinner" />
            <h2>Verifying your email…</h2>
            <p>Please wait a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="ev-icon ev-icon-success">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2>Email Verified!</h2>
            <p>Your account has been successfully verified.<br />You can now sign in and start ordering.</p>
            <button className="ev-btn" onClick={() => navigate("/login")}>
              Sign In Now
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="ev-icon ev-icon-error">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2>Link expired or invalid</h2>
            <p>This verification link may have expired. Please sign up again or request a new link.</p>
            <button className="ev-btn" onClick={() => navigate("/register")}>
              Back to Sign Up
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailVerified;
