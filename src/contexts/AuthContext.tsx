import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

type UserRole = 'patient' | 'doctor' | 'admin' | null;

const ADMIN_EMAILS = new Set([
  'meddahnaima2005@gmail.com',
  'sarahboualili17@gmail.com',
  'ouldkhaoua.pro@gmail.com',
]);

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
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        fetchUserProfile(session.user.id, session.user.email);
        
        // Log the login event when explicitly signed in
        if (event === 'SIGNED_IN') {
          supabase.from('login_logs').insert({ user_id: session.user.id }).then(({ error }) => {
            if (error) console.error('Failed to log login:', error);
          });
        }
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

      // 3. Fetch User Roles
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .order('role');

      const emailAddress = (email || '').toLowerCase();
      const isAdminEmail = ADMIN_EMAILS.has(emailAddress);
      const hasAdminRole = (userRoles || []).some(({ role }) => role === 'admin');
      const firstRole = userRoles?.[0]?.role as UserRole | undefined;
      const role = isAdminEmail || hasAdminRole ? 'admin' : (firstRole || null);

      if (isAdminEmail && !hasAdminRole) {
        const { error: adminRoleError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' });

        if (adminRoleError && adminRoleError.code !== '23505') {
          console.error('Error assigning admin role:', adminRoleError);
        }
      }

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

    if (role === 'admin' && !ADMIN_EMAILS.has(user.email.toLowerCase())) {
      throw new Error('Admin access is restricted to approved email addresses.');
    }

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
        const { data: existingPatient, error: checkError } = await supabase
          .from('patients')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!existingPatient) {
          const { error: patientError } = await supabase
            .from('patients')
            .insert({
              user_id: user.id,
              name_ar: user.name,
              name_fr: user.name,
              age: 18, 
              dialysis_type: 'HD', 
              status: 'active' // Default status
            });

          if (patientError) {
            console.error("Error creating patient record:", patientError);
            throw patientError;
          }
        }


      } else if (role === 'doctor') {
        // Schema: user_id, name_ar, name_fr, specialization
        const { data: existingDoctor, error: checkError } = await supabase
          .from('doctors')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!existingDoctor) {
          const { error: dError } = await supabase
            .from('doctors')
            .insert({
              user_id: user.id,
              name_ar: user.name,
              name_fr: user.name,
              specialization: 'General Practitioner'
            });

          if (dError) {
            console.error("Error creating doctor record:", dError);
            throw dError;
          }
        }
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
