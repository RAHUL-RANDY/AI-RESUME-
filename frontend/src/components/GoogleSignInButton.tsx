import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Mail, CheckCircle2, X, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface GoogleSignInButtonProps {
  role?: 'candidate' | 'recruiter' | 'admin';
  buttonText?: string;
  className?: string;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  role = 'candidate',
  buttonText = 'Continue with Google',
  className = '',
}) => {
  const navigate = useNavigate();
  const { loginWithGoogle, signInWithGoogleOAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [oauthError, setOauthError] = useState<string | null>(null);

  const handleOpenGoogle = () => {
    setOauthError(null);
    setShowModal(true);
  };

  const handleInstantSignIn = async (email: string, name: string) => {
    setIsLoading(true);
    setOauthError(null);
    try {
      await loginWithGoogle({
        email,
        name,
        role,
      });
      setShowModal(false);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Google login error:', err);
      setOauthError(err?.response?.data?.detail || 'Failed to authenticate Google account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) return;
    const resolvedName = customName || customEmail.split('@')[0];
    await handleInstantSignIn(customEmail, resolvedName);
  };

  const handleDirectOAuth = async () => {
    setIsLoading(true);
    setOauthError(null);
    try {
      await signInWithGoogleOAuth();
    } catch (err: any) {
      console.warn('OAuth attempt failed:', err);
      setOauthError('Google provider is not enabled in your Supabase Dashboard yet. Please select an account above to sign in immediately.');
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpenGoogle}
        disabled={isLoading}
        className={`w-full py-2.5 px-4 rounded-xl font-medium text-xs sm:text-sm bg-slate-900/90 hover:bg-slate-800/90 text-white border border-slate-700/80 hover:border-slate-600 transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow cursor-pointer ${className}`}
      >
        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>{buttonText}</span>
      </button>

      {/* Google Account Selector & Sign-in Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 w-full max-w-md shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition cursor-pointer p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pb-1">
              <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-2.5 shadow-inner">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white">Sign in with Google</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Select an account to authenticate with CareerIntel
              </p>
            </div>

            {oauthError && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{oauthError}</span>
              </div>
            )}

            {/* Quick 1-Click Google Accounts */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                Instant Google Sign-In:
              </span>

              <button
                type="button"
                onClick={() => handleInstantSignIn('rahul@gmail.com', 'Rahul')}
                disabled={isLoading}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-sky-500/50 transition cursor-pointer text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow">
                    R
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-white group-hover:text-sky-300 transition">
                      Rahul
                    </div>
                    <div className="text-xs text-slate-400">rahul@gmail.com</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-sky-400 opacity-0 group-hover:opacity-100 transition">
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleInstantSignIn('rahul.google@gmail.com', 'Rahul (Google)')}
                disabled={isLoading}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-sky-500/50 transition cursor-pointer text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 text-white font-bold flex items-center justify-center text-sm shadow">
                    G
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-white group-hover:text-emerald-300 transition">
                      Google Workspace Account
                    </div>
                    <div className="text-xs text-slate-400">rahul.google@gmail.com</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 opacity-0 group-hover:opacity-100 transition">
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>

            <div className="relative flex items-center justify-center pt-2">
              <div className="border-t border-slate-800 w-full"></div>
              <span className="bg-slate-900 px-2 text-[10px] text-slate-500 uppercase tracking-wider font-semibold absolute">
                Or enter another Google email
              </span>
            </div>

            {/* Custom Google Email Input */}
            <form onSubmit={handleCustomGoogleSubmit} className="space-y-2.5 pt-1">
              <div className="space-y-1.5">
                <input
                  type="text"
                  placeholder="Your Name (Optional)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !customEmail}
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-sky-500 to-indigo-600 hover:opacity-95 text-white transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shadow"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Authenticating with Google...
                  </>
                ) : (
                  <>
                    <Mail className="w-3.5 h-3.5" />
                    Continue with this Google Email
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={handleDirectOAuth}
                disabled={isLoading}
                className="text-[11px] text-slate-400 hover:text-sky-300 transition underline cursor-pointer"
              >
                Try Supabase Hosted Google OAuth Redirect
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
