import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import {
  getProfile,
  upsertProfile,
  uploadAvatar,
  removeAvatar,
} from '@/lib/supabase-profile';
import type { Profile, ProfileUpdate } from '@/lib/supabase-profile';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  profileLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: ProfileUpdate) => Promise<{ error: string | null }>;
  uploadAvatarFile: (file: File) => Promise<{ url: string | null; error: string | null }>;
  clearAvatar: () => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const loadProfile = useCallback(async (userId: string) => {
    setProfileLoading(true);
    const p = await getProfile(userId);
    setProfile(p);
    setProfileLoading(false);
  }, []);

  useEffect(() => {
    // Check initial session then load profile
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoggedIn(!!session);
      if (session?.user) {
        loadProfile(session.user.id).finally(() => setInitialized(true));
      } else {
        setInitialized(true);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoggedIn(!!session);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    setSession(data.session);
    setUser(data.user);
    setIsLoggedIn(true);
    if (data.user) await loadProfile(data.user.id);
    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setIsLoggedIn(false);
  };

  const updateProfile = async (updates: ProfileUpdate): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Not authenticated.' };
    const result = await upsertProfile(user.id, updates);
    if (!result.error) {
      // Reflect changes locally immediately so UI updates without a full refetch
      setProfile((prev) =>
        prev
          ? { ...prev, ...updates, updated_at: new Date().toISOString() }
          : null
      );
    }
    return result;
  };

  const uploadAvatarFile = async (
    file: File
  ): Promise<{ url: string | null; error: string | null }> => {
    if (!user) return { url: null, error: 'Not authenticated.' };
    const { url, error } = await uploadAvatar(user.id, file);
    if (url && !error) {
      const saveResult = await upsertProfile(user.id, { avatar_url: url });
      if (saveResult.error) return { url: null, error: saveResult.error };
      setProfile((prev) =>
        prev ? { ...prev, avatar_url: url, updated_at: new Date().toISOString() } : null
      );
    }
    return { url, error };
  };

  const clearAvatar = async (): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Not authenticated.' };
    await removeAvatar(user.id); // best-effort storage cleanup
    const result = await upsertProfile(user.id, { avatar_url: null });
    if (!result.error) {
      setProfile((prev) =>
        prev ? { ...prev, avatar_url: null, updated_at: new Date().toISOString() } : null
      );
    }
    return result;
  };

  // Don't render children until session + profile have been checked
  if (!initialized) return null;

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        session,
        profile,
        profileLoading,
        login,
        logout,
        updateProfile,
        uploadAvatarFile,
        clearAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
