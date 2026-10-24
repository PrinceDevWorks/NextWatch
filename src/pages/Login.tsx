import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Film, Sparkles, ShieldCheck, AlertCircle, Flame, Shuffle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const { currentUser, userProfile, signInWithGoogle, signInAsDemoUser, loading } =
    useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const navigate = useNavigate();

  // If already logged in, redirect based on onboarding state
  if (!loading && currentUser) {
    if (userProfile?.onboardingCompleted) {
      return <Navigate to="/" replace />;
    }
    return <Navigate to="/onboarding" replace />;
  }

  const handleGoogleSignIn = async () => {
    try {
      setAuthError(null);
      setIsSigningIn(true);
      await signInWithGoogle();
      navigate('/');
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setAuthError(err.message || 'Google sign-in was cancelled or failed.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleDemoSignIn = () => {
    signInAsDemoUser();
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-[#05070f] flex flex-col justify-between selection:bg-fuchsia-500 selection:text-white relative overflow-hidden">
      {/* Background Neon Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[550px] bg-gradient-to-b from-violet-600/25 via-fuchsia-600/15 to-transparent blur-[130px]" />
        <div className="absolute -bottom-40 -right-20 w-[600px] h-[600px] bg-cyan-600/15 blur-[140px] rounded-full" />
      </div>

      {/* Top Simple Brand Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-amber-400 flex items-center justify-center shadow-xl shadow-fuchsia-500/25 rotate-[-3deg]">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-2xl font-black text-white tracking-tight">NextWatch</span>
            <span className="text-[10px] block font-black uppercase tracking-widest text-fuchsia-400">Discover Weekly</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-black text-slate-300 bg-slate-900/80 border border-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-md">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Serverless & Secure</span>
        </div>
      </header>

      {/* Main Hero & Sign-In Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-300 mb-6 backdrop-blur-xl">
          <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
          <span>Spotify for Movies & TV Shows</span>
        </div>

        <h1 className="text-4xl sm:text-7xl font-black text-white tracking-tight leading-[1.05] mb-6">
          Never ask{' '}
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
            &ldquo;what to watch&rdquo;
          </span>{' '}
          again.
        </h1>

        <p className="text-slate-300 text-base sm:text-xl max-w-2xl mb-10 leading-relaxed font-normal">
          Pick 5 GOATs, get an algorithmic Discover mix tailored to your vibe with 25% wildcard surprises, and swipe through recommendations with one-tap reactions.
        </p>

        {/* Auth Error Banner */}
        {authError && (
          <div className="w-full max-w-md mb-6 p-4 rounded-3xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs text-left flex items-start gap-3 backdrop-blur-md">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Authentication Notice</p>
              <p className="mt-0.5 text-rose-300/80 font-medium">{authError}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full max-w-md flex flex-col gap-3">
          <button
            type="button"
            disabled={isSigningIn}
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-3xl bg-white hover:bg-slate-100 text-slate-950 font-black text-base shadow-2xl shadow-white/10 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01]"
          >
            {/* Google G Logo SVG */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
            <span>{isSigningIn ? 'Connecting...' : 'Continue with Google'}</span>
          </button>

          {/* Quick Demo Mode Button */}
          <button
            type="button"
            onClick={handleDemoSignIn}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-3xl bg-slate-900/90 hover:bg-slate-800/90 border border-white/10 text-slate-300 hover:text-white font-bold text-sm transition-all cursor-pointer backdrop-blur-md hover:border-white/25"
          >
            <Sparkles className="w-4 h-4 text-fuchsia-400" />
            <span>Try Interactive Demo Mode</span>
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl text-left">
          <div className="p-5 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-xl">
            <div className="w-9 h-9 rounded-2xl bg-fuchsia-500/15 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400 mb-3">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-white">1. Live Taste Profile</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">
              Every reaction dynamically weights genres like Sci-Fi, Thriller, & Anime in real time.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-xl">
            <div className="w-9 h-9 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-3">
              <Shuffle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-white">2. 25% Wildcard Surprises</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">
              Spotify-style serendipity: mixes critically acclaimed cross-genre gems to expand your taste.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-xl">
            <div className="w-9 h-9 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3">
              <Film className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-white">3. Zero Friction Reactions</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">
              React with Watched, Fire, Maybe, or Pass — immediately removes the title from your feed.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 border-t border-white/5 text-center text-xs text-slate-500 font-medium">
        NextWatch &copy; {new Date().getFullYear()} &bull; Spotify for Movies &bull; Powered by TMDB & Firebase
      </footer>
    </div>
  );
};
