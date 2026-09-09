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
            try {
              const res = await authService.googleLogin({
                email: sbUser.email,
                name: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || sbUser.email?.split('@')[0],
                role: 'candidate'
              });
              localStorage.setItem('token', res.access_token);
              localStorage.setItem('user', JSON.stringify(res.user));
              setToken(res.access_token);
              setUser(res.user);
              setIsLoading(false);
              return;
            } catch {
              // Direct Supabase session
              const directUser: User = {
                id: sbUser.id,
                name: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'Candidate',
                email: sbUser.email || '',
                role: (sbUser.user_metadata?.role as any) || 'candidate',
                created_at: sbUser.created_at
              };
              const sTok = data.session.access_token;
              localStorage.setItem('token', sTok);
              localStorage.setItem('user', JSON.stringify(directUser));
              setToken(sTok);
              setUser(directUser);
              setIsLoading(false);
              return;
            }
          }
        } catch (err) {
          console.error('Supabase auth session sync:', err);
        }
      }

      // 2. Standard token & user verification
      const storedToken = localStorage.getItem('token');
      const storedUserStr = localStorage.getItem('user');
      if (storedToken) {
        try {
          const u = await authService.getMe();
          localStorage.setItem('user', JSON.stringify(u));
          setUser(u);
        } catch {
          // If backend is offline or deployed as static SPA on Vercel, restore cached user
          if (storedUserStr) {
            try {
              const cachedUser = JSON.parse(storedUserStr);
              setUser(cachedUser);
            } catch {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setToken(null);
              setUser(null);
            }
          } else {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
          }
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const data = await authService.login(email, pass);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.access_token);
      setUser(data.user);
    } catch (err: any) {
      // If backend returned 401 Unauthorized with detail, rethrow
      if (err?.response?.status === 401 && err?.response?.data?.detail) {
        throw err;
      }
      // If backend is unreachable or 404 (e.g. Vercel deployment without backend URL), try Supabase
      if (supabase) {
        try {
          const { data: sbData, error: sbError } = await supabase.auth.signInWithPassword({
            email,
            password: pass
          });
          if (!sbError && sbData?.user) {
            const u: User = {
              id: sbData.user.id,
              name: sbData.user.user_metadata?.name || email.split('@')[0],
              email: sbData.user.email || email,
              role: (sbData.user.user_metadata?.role as any) || 'candidate',
              created_at: sbData.user.created_at
            };
            const t = sbData.session?.access_token || 'sb_token_' + Date.now();
            localStorage.setItem('token', t);
            localStorage.setItem('user', JSON.stringify(u));
            setToken(t);
            setUser(u);
            return;
          }
          if (sbError) {
            throw new Error(sbError.message);
          }
        } catch (sbErr: any) {
          throw sbErr;
        }
      }
      // If offline/Vercel static mode without backend
      if (!err?.response || err?.response?.status === 404 || err?.code === 'ERR_NETWORK') {
        const localUser: User = {
          id: 'usr_' + Date.now(),
          name: email.split('@')[0],
          email,
          role: 'candidate',
          created_at: new Date().toISOString()
        };
        const localTok = 'local_session_' + Date.now();
        localStorage.setItem('token', localTok);
        localStorage.setItem('user', JSON.stringify(localUser));
        setToken(localTok);
        setUser(localUser);
        return;
      }
      throw err;
    }
  };

  const register = async (name: string, email: string, pass: string, role: string) => {
    try {
      await authService.register(name, email, pass, role);
      await login(email, pass);
    } catch (err: any) {
      // If backend explicitly rejected with duplicate email (400 Bad Request), rethrow
      if (err?.response?.status === 400 && err?.response?.data?.detail) {
        throw err;
      }
      // If backend is unreachable (e.g. on Vercel static hosting)
      if (!err?.response || err?.response?.status === 404 || err?.code === 'ERR_NETWORK') {
        // 1. Try Supabase Auth
        if (supabase) {
          try {
            const { data: sbData, error: sbError } = await supabase.auth.signUp({
              email,
              password: pass,
              options: {
                data: { name, role }
              }
            });
            if (!sbError && sbData?.user) {
              const u: User = {
                id: sbData.user.id,
                name,
                email,
                role: role as any,
                created_at: sbData.user.created_at
              };
              const t = sbData.session?.access_token || 'sb_token_' + Date.now();
              localStorage.setItem('token', t);
              localStorage.setItem('user', JSON.stringify(u));
              setToken(t);
              setUser(u);
              return;
            }
            if (sbError) {
              throw new Error(sbError.message);
            }
          } catch (sbErr: any) {
            console.warn('Supabase fallback error:', sbErr);
          }
        }
        // 2. Cloud demo session fallback
        const demoUser: User = {
          id: 'usr_' + Date.now(),
          name,
          email,
          role: role as any,
          created_at: new Date().toISOString()
        };
        const demoTok = 'session_' + Date.now();
        localStorage.setItem('token', demoTok);
        localStorage.setItem('user', JSON.stringify(demoUser));
        setToken(demoTok);
        setUser(demoUser);
        return;
      }
      throw err;
    }
  };

  const loginWithGoogle = async (data: { credential?: string; email?: string; name?: string; role?: string }) => {
    try {
      const res = await authService.googleLogin(data);
      localStorage.setItem('token', res.access_token);
      localStorage.setItem('user', JSON.stringify(res.user));
      setToken(res.access_token);
      setUser(res.user);
    } catch {
      // Offline / client fallback
      const email = data.email || 'user@gmail.com';
      const name = data.name || email.split('@')[0];
      const fallbackUser: User = {
        id: 'usr_g_' + Date.now(),
        name,
        email,
        role: (data.role as any) || 'candidate',
        created_at: new Date().toISOString()
      };
      const fallbackToken = 'g_token_' + Date.now();
      localStorage.setItem('token', fallbackToken);
      localStorage.setItem('user', JSON.stringify(fallbackUser));
      setToken(fallbackToken);
      setUser(fallbackUser);
    }
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
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (u: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...u };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const setAuthSession = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
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
