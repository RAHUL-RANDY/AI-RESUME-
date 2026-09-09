import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../services/api';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, role: string) => Promise<void>;
  loginWithGoogle: (data: { credential?: string; email?: string; name?: string; role?: string }) => Promise<void>;
  signInWithGoogleOAuth: () => Promise<void>;
  logout: () => void;
  updateUser: (u: Partial<User>) => void;
  setAuthSession: (token: string, user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      // 1. Check if Supabase returned from Google OAuth redirect
      if (supabase) {
        try {
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user) {
            const sbUser = data.session.user;
            const res = await authService.googleLogin({
              email: sbUser.email,
              name: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || sbUser.email?.split('@')[0],
              role: 'candidate'
            });
            localStorage.setItem('token', res.access_token);
            setToken(res.access_token);
            setUser(res.user);
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.error('Supabase auth session sync:', err);
        }
      }

      // 2. Standard token verification
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const u = await authService.getMe();
          setUser(u);
        } catch (e) {
          console.error('Session expired or invalid token:', e);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    const data = await authService.login(email, pass);
    localStorage.setItem('token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  };

  const register = async (name: string, email: string, pass: string, role: string) => {
    await authService.register(name, email, pass, role);
    await login(email, pass);
  };

  const loginWithGoogle = async (data: { credential?: string; email?: string; name?: string; role?: string }) => {
    const res = await authService.googleLogin(data);
    localStorage.setItem('token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  };

  const signInWithGoogleOAuth = async () => {
    if (supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard',
        },
      });
      if (error) throw error;
    } else {
      throw new Error('Supabase client is not configured.');
    }
  };

  const logout = () => {
    if (supabase) {
      supabase.auth.signOut().catch(() => {});
    }
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (u: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...u } : null));
  };

  const setAuthSession = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        loginWithGoogle,
        signInWithGoogleOAuth,
        logout,
        updateUser,
        setAuthSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
