import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

type UserRole = 'patient' | 'doctor' | 'admin' | null;

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  selectRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUserProfile(session.user.id, session.user.email);
      } else {
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUserProfile(session.user.id, session.user.email);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string, email?: string) => {
    try {
      // Get the current session to access user metadata (includes Google avatar)
      const { data: { session } } = await supabase.auth.getSession();

      // Get avatar from Google OAuth metadata
      const googleAvatar = session?.user?.user_metadata?.avatar_url || session?.user?.user_metadata?.picture;

      // 1. Fetch Profile
      let { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      // 2. Update profile with Google avatar if not already set
      if (googleAvatar && (!profile?.avatar_url || profile.avatar_url === '')) {
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .update({ avatar_url: googleAvatar })
          .eq('user_id', userId)
          .select()
          .single();
        
        if (updatedProfile) {
          profile = updatedProfile;
        }
      }

      // 3. Fetch User Role
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      const role = userRole ? (userRole.role as UserRole) : null;

      // Determine name (prefer French, fallback to Arabic or email)
      const name = profile
        ? (profile.name_fr || profile.name_ar || email?.split('@')[0] || 'User')
        : (email?.split('@')[0] || 'User');

      // Use the avatar from profile (which now includes Google avatar)
      const avatarUrl = profile?.avatar_url || googleAvatar || '';

      setUser({
        id: userId,
        name,
        email: email || '',
        avatar: avatarUrl,
        role,
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    // Build the redirect URL - must match authorized redirect URIs in Google Cloud Console
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: false,
      },
    });
    
    if (error) {
      console.error('Google login error:', error);
      throw new Error(`Login failed: ${error.message || 'Unknown error'}`);
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  const selectRole = async (role: UserRole) => {
    if (!user || !role) return;

    // Optimistic update
    const previousRole = user.role;
    setUser({ ...user, role });

    try {
      // 1. Insert role into user_roles
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: user.id, role })
        .single();

      if (roleError && roleError.code !== '23505') { // Ignore duplicate key error
        throw roleError;
      }

      // 2. Create corresponding record in patients/doctors table if not exists
      if (role === 'patient') {
        const { error: patientError } = await supabase
          .from('patients')
          .insert({
            user_id: user.id,
            name_ar: user.name,
            name_fr: user.name,
            age: 0, // Default
            email: user.email // Make sure to add email column to patients table if needed or remove this
          })
          .select()
          .single();

        // Note: schema doesn't have email in patients table, removing it from insert
        /*
        .insert({
          user_id: user.id,
          name_ar: user.name,
          name_fr: user.name,
          age: 10, // Default age
          dialysis_type: 'HD',
          status: 'active'
        })
        */

        // Actually, let's just insert with minimal required fields based on schema
        // Schema: user_id, name_ar, name_fr, age (NOT NULL)
        const { error: pError } = await supabase
          .from('patients')
          .upsert({
            user_id: user.id,
            name_ar: user.name,
            name_fr: user.name,
            
          }, { onConflict: 'user_id' });

        if (pError) console.error("Error creating patient record:", pError);

      } else if (role === 'doctor') {
        // Schema: user_id, name_ar, name_fr
        const { error: dError } = await supabase
          .from('doctors')
          .upsert({
            user_id: user.id,
            name_ar: user.name,
            name_fr: user.name
          }, { onConflict: 'user_id' });

        if (dError) console.error("Error creating doctor record:", dError);
      }

    } catch (error) {
      console.error('Error selecting role:', error);
      setUser({ ...user, role: previousRole });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        selectRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
