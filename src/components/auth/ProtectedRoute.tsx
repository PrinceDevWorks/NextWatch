import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Film } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresOnboarding?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiresOnboarding = true,
}) => {
  const { currentUser, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200">
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center animate-pulse">
            <Film className="w-8 h-8 text-indigo-400" />
          </div>
          <div className="absolute inset-0 rounded-2xl border-2 border-indigo-500 border-t-transparent animate-spin" />
        </div>
        <p className="text-sm font-medium text-slate-400">Loading NextWatch...</p>
      </div>
    );
  }

  // Not logged in -> send to login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in user hitting /onboarding
  if (location.pathname === '/onboarding') {
    // If onboarding is already completed, redirect to main feed
    if (userProfile?.onboardingCompleted) {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  }

  // Logged in user hitting regular app routes (requires onboarding)
  if (requiresOnboarding && userProfile && !userProfile.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};
