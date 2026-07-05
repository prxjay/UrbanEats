import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleUserSession = async (user) => {
      if (user) {
        // A new user has created_at very close to last_sign_in_at
        const createdAt = new Date(user.created_at).getTime();
        const lastSignInAt = new Date(user.last_sign_in_at || user.created_at).getTime();
        const isNewUser = Math.abs(lastSignInAt - createdAt) < 15000; // 15 seconds window
        const isRegistering = localStorage.getItem("isRegistering") === "true";

        if (isNewUser) {
          if (!isRegistering) {
            // Block sign up if they didn't explicitly request to register
            localStorage.removeItem("token");
            localStorage.removeItem("isRegistering");
            setCurrentUser(null);
            toast.error("Account not registered. Please sign up first!", { toastId: "not-registered-error" });
            await supabase.auth.signOut();
            setLoading(false);
            return;
          }
          // If they ARE registering, we purposefully leave "isRegistering" in localStorage 
          // for the full 15 seconds. This prevents duplicate React StrictMode events 
          // or Supabase auth events from accidentally blocking them milliseconds later!
        } else {
          // If they are not a new user (older than 15s), it's safe to clean up
          localStorage.removeItem("isRegistering");
        }
      } else {
        localStorage.removeItem("isRegistering");
      }
      
      setCurrentUser(user);
      setLoading(false);
    };

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleUserSession(session?.user || null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        handleUserSession(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    currentUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}