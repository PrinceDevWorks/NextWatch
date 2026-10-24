import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Film, Sparkles, CheckCircle2, ShieldCheck, Zap, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const { currentUser, userProfile, signInWithGoogle, signInAsDemoUser, isFirebaseReady, loading } =
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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-indigo-600/20 via-pink-600/10 to-transparent blur-3xl opacity-60" />
        <div className="absolute -bottom-40 -right-20 w-[600px] h-[600px] bg-indigo-900/15 blur-3xl rounded-full" />
      </div>

      {/* Top Simple Brand Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Film className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-extrabold text-white tracking-tight">NextWatch</span>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Serverless & Secure</span>
        </div>
      </header>

      {/* Main Hero & Sign-In Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 mb-6 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Discover What To Watch Next in Seconds</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
          Find movies & TV shows that match your{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            true taste.
          </span>
        </h1>

        <p className="text-slate-300 text-base sm:text-lg max-w-2xl mb-10 leading-relaxed">
          Tired of endless scrolling? Pick 5 titles you adore, swipe through personalized recommendations, and curate your personal watch list with one-click reactions.
        </p>

        {/* Auth Error Banner */}
        {authError && (
          <div className="w-full max-w-md mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-left flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Authentication Notice</p>
              <p className="mt-0.5 text-rose-300/80">{authError}</p>
            </div>
          </div>
        )}

        {/* Unconfigured Firebase Notice */}
        {!isFirebaseReady && (
          <div className="w-full max-w-md mb-6 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs text-left">
            <p className="font-semibold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Firebase Environment Keys Not Detected
            </p>
            <p className="mt-1 text-amber-200/80">
              Provide your Firebase variables in <code className="bg-amber-950/60 px-1 py-0.5 rounded text-amber-300">.env</code> to enable live Google Auth and Cloud Firestore, or click below to explore using the fully interactive Demo Mode.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full max-w-md flex flex-col gap-3">
          <button
            type="button"
            disabled={isSigningIn}
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-base shadow-xl shadow-white/5 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
            <span>{isSigningIn ? 'Connecting to Google...' : 'Sign in with Google'}</span>
          </button>

          {/* Quick Demo Mode Button */}
          <button
            type="button"
            onClick={handleDemoSignIn}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 text-slate-300 hover:text-white font-medium text-sm transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Explore with Interactive Demo Profile</span>
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl text-left">
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">1. Pick Your Top 5</h3>
            <p className="text-xs text-slate-400 mt-1">
              Select 5 favorite films or series to initialize your taste graph in Firestore.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80">
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-3">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">2. Instant 4-Way Reactions</h3>
            <p className="text-xs text-slate-400 mt-1">
              Tag with Watched, Seems Good, Maybe, or Nah to refine your discovery feed.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
              <Film className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">3. Powered by TMDB</h3>
            <p className="text-xs text-slate-400 mt-1">
              Browse trending releases and search millions of movies and television shows.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 border-t border-slate-900 text-center text-xs text-slate-500">
        NextWatch &copy; {new Date().getFullYear()} &bull; Built with React, Vite, Firebase & TMDB
      </footer>
    </div>
  );
};
