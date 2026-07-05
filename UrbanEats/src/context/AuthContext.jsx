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
    // Helper to handle and validate user sign in / registration
    const handleUserSession = async (user) => {
      if (user) {
        // A new user has created_at very close to last_sign_in_at
        const createdAt = new Date(user.created_at).getTime();
        const lastSignInAt = new Date(user.last_sign_in_at || user.created_at).getTime();
        const isNewUser = Math.abs(lastSignInAt - createdAt) < 15000; // 15 seconds window
        const isRegistering = localStorage.getItem("isRegistering") === "true";

        if (isNewUser && !isRegistering) {
          // Block sign up if they didn't explicitly request to register
          await supabase.auth.signOut();
          localStorage.removeItem("token");
          localStorage.removeItem("isRegistering");
          setCurrentUser(null);
          toast.error("Account not registered. Please sign up first!");
          setLoading(false);
          return;
        }
      }
      localStorage.removeItem("isRegistering");
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