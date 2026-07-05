import { supabase } from '../supabaseClient';

export const register = async (email, password, name) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, display_name: name, name },
        emailRedirectTo: `${window.location.origin}/email-verified`
      }
    });
    if (error) throw error;
    // Return pending — user must confirm email before they can log in
    return { status: 200, data: { needsConfirmation: true } };
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const login = async ({ email, password }) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return { status: 200, data: { token: data.session.access_token, user: data.session.user } };
  } catch (error) {
    console.error('Error logging in user:', error);
    throw error;
  }
};

export const loginWithGoogle = async () => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) throw error;
    // OAuth redirects the page, so this won't return normally
    return { status: 200, data: { token: '' } };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { status: 200 };
  } catch (error) {
    console.error('Error logging out user:', error);
    throw error;
  }
};

export const onAuthStateChange = (callback) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });
  return () => subscription.unsubscribe();
};