import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  type User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../services/firebase';
import {
  getUserProfile,
  saveUserTop5,
  saveUserReaction,
  getUserReactions,
  deleteUserReaction,
} from '../services/firestore';
import type { MediaType, ReactionType, UserProfile, UserReaction } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  reactions: Record<number, UserReaction>;
  loading: boolean;
  isFirebaseReady: boolean;
  isDemoUser: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsDemoUser: () => void;
  signOut: () => Promise<void>;
  completeOnboarding: (top5: number[]) => Promise<void>;
  addReaction: (
    tmdbId: number,
    mediaType: MediaType,
    reaction: ReactionType,
    metadata?: { title?: string; poster_path?: string | null }
  ) => Promise<void>;
  removeReaction: (tmdbId: number) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER_UID = 'demo-explorer-user-123';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [reactions, setReactions] = useState<Record<number, UserReaction>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoUser, setIsDemoUser] = useState<boolean>(false);

  // Sync profile & reactions for a given UID
  const syncUserData = useCallback(async (user: User | null) => {
    if (!user) {
      setUserProfile(null);
      setReactions({});
      return;
    }

    try {
      if (user.uid === DEMO_USER_UID) {
        const cachedProfile = localStorage.getItem('nextwatch_demo_profile');
        const cachedReactions = localStorage.getItem('nextwatch_demo_reactions');

        const initialProfile: UserProfile = cachedProfile
          ? JSON.parse(cachedProfile)
          : {
              uid: DEMO_USER_UID,
              email: 'explorer@nextwatch.demo',
              displayName: 'Demo Explorer',
              photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
              onboardingCompleted: false,
              top5: [],
            };

        setUserProfile(initialProfile);
        setReactions(cachedReactions ? JSON.parse(cachedReactions) : {});
        return;
      }

      // Check local cache backup first
      const localProfileRaw = localStorage.getItem(`nextwatch_profile_${user.uid}`);
      const localReactionsRaw = localStorage.getItem(`nextwatch_reactions_${user.uid}`);
      const localProfile: UserProfile | null = localProfileRaw ? JSON.parse(localProfileRaw) : null;
      const localReactions: Record<number, UserReaction> = localReactionsRaw
        ? JSON.parse(localReactionsRaw)
        : {};

      // If user has local onboarding completed, respect it immediately
      if (localProfile?.onboardingCompleted) {
        setUserProfile(localProfile);
        setReactions(localReactions);
      }

      // Live Firestore sync with timeout
      const [remoteProfile, remoteReactions] = await Promise.all([
        getUserProfile(user.uid),
        getUserReactions(user.uid),
      ]);

      if (remoteProfile) {
        setUserProfile(remoteProfile);
        localStorage.setItem(`nextwatch_profile_${user.uid}`, JSON.stringify(remoteProfile));
      } else if (!localProfile) {
        setUserProfile({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          onboardingCompleted: false,
          top5: [],
        });
      }

      if (Object.keys(remoteReactions).length > 0) {
        const mergedReactions = { ...localReactions, ...remoteReactions };
        setReactions(mergedReactions);
        localStorage.setItem(`nextwatch_reactions_${user.uid}`, JSON.stringify(mergedReactions));
      }
    } catch (err) {
      console.warn('Error syncing user data:', err);
    }
  }, []);

  useEffect(() => {
    const savedDemo = localStorage.getItem('nextwatch_is_demo_session');
    if (savedDemo === 'true') {
      setIsDemoUser(true);
      const fakeUser = {
        uid: DEMO_USER_UID,
        email: 'explorer@nextwatch.demo',
        displayName: 'Demo Explorer',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
      } as unknown as User;
      setCurrentUser(fakeUser);
      syncUserData(fakeUser).finally(() => setLoading(false));
      return;
    }

    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser);
      setIsDemoUser(false);
      if (firebaseUser) {
        await syncUserData(firebaseUser);
      } else {
        setUserProfile(null);
        setReactions({});
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [syncUserData]);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await syncUserData(result.user);
    } catch (err) {
      console.error('Sign-in failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInAsDemoUser = () => {
    setLoading(true);
    setIsDemoUser(true);
    localStorage.setItem('nextwatch_is_demo_session', 'true');
    const fakeUser = {
      uid: DEMO_USER_UID,
      email: 'explorer@nextwatch.demo',
      displayName: 'Demo Explorer',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    } as unknown as User;

    setCurrentUser(fakeUser);
    syncUserData(fakeUser).finally(() => setLoading(false));
  };

  const signOut = async () => {
    setLoading(true);
    try {
      if (isDemoUser) {
        localStorage.removeItem('nextwatch_is_demo_session');
        setIsDemoUser(false);
      } else if (isFirebaseConfigured) {
        await firebaseSignOut(auth);
      }
      setCurrentUser(null);
      setUserProfile(null);
      setReactions({});
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async (top5: number[]) => {
    if (!currentUser) throw new Error('No user logged in');

    const updatedProfile: UserProfile = {
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName,
      photoURL: currentUser.photoURL,
      onboardingCompleted: true,
      top5,
    };

    // Always update local cache & state immediately
    if (isDemoUser) {
      localStorage.setItem('nextwatch_demo_profile', JSON.stringify(updatedProfile));
    } else {
      localStorage.setItem(`nextwatch_profile_${currentUser.uid}`, JSON.stringify(updatedProfile));
    }
    setUserProfile(updatedProfile);

    if (!isDemoUser) {
      // Fire-and-forget save to Firestore with timeout
      await saveUserTop5(currentUser.uid, currentUser.email, top5, {
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
      });
    }
  };

  const addReaction = async (
    tmdbId: number,
    mediaType: MediaType,
    reaction: ReactionType,
    metadata?: { title?: string; poster_path?: string | null }
  ) => {
    if (!currentUser) return;

    // Optimistic UI update
    const newReaction: UserReaction = {
      tmdbId,
      mediaType,
      reaction,
      timestamp: Date.now(),
      title: metadata?.title,
      poster_path: metadata?.poster_path,
    };

    setReactions((prev) => {
      const next = { ...prev, [tmdbId]: newReaction };
      if (!isDemoUser) {
        localStorage.setItem(`nextwatch_reactions_${currentUser.uid}`, JSON.stringify(next));
      }
      return next;
    });

    if (isDemoUser) {
      const updated = {
        ...reactions,
        [tmdbId]: newReaction,
      };
      localStorage.setItem('nextwatch_demo_reactions', JSON.stringify(updated));
      return;
    }

    // Persist to Firestore in background
    await saveUserReaction(currentUser.uid, tmdbId, mediaType, reaction, metadata);
  };

  const removeReaction = async (tmdbId: number) => {
    if (!currentUser) return;

    setReactions((prev) => {
      const copy = { ...prev };
      delete copy[tmdbId];
      if (!isDemoUser) {
        localStorage.setItem(`nextwatch_reactions_${currentUser.uid}`, JSON.stringify(copy));
      }
      return copy;
    });

    if (isDemoUser) {
      const copy = { ...reactions };
      delete copy[tmdbId];
      localStorage.setItem('nextwatch_demo_reactions', JSON.stringify(copy));
      return;
    }

    await deleteUserReaction(currentUser.uid, tmdbId);
  };

  const refreshProfile = async () => {
    if (currentUser) {
      await syncUserData(currentUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        reactions,
        loading,
        isFirebaseReady: isFirebaseConfigured,
        isDemoUser,
        signInWithGoogle,
        signInAsDemoUser,
        signOut,
        completeOnboarding,
        addReaction,
        removeReaction,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
