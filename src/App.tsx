import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Login } from './pages/Login';
import { Onboarding } from './pages/Onboarding';
import { MainFeed } from './pages/MainFeed';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          {/* Public login route */}
          <Route path="/login" element={<Login />} />

          {/* Onboarding route (requires auth, but exempt from completed onboarding check) */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute requiresOnboarding={false}>
                <Onboarding />
              </ProtectedRoute>
            }
          />

          {/* Protected discovery feed (requires auth & completed onboarding) */}
          <Route
            path="/"
            element={
              <ProtectedRoute requiresOnboarding={true}>
                <MainFeed />
              </ProtectedRoute>
            }
          />

          {/* Fallback wildcard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
