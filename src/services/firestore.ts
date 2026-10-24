import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { MediaType, ReactionType, UserProfile, UserReaction } from '../types';

/**
 * Helper to race any promise against a timeout in milliseconds
 */
function withTimeout<T>(promise: Promise<T>, ms = 4000, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

/**
 * Fetch a user's profile document from Firestore with a 4s timeout
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await withTimeout(getDoc(userRef), 4000, null);

    if (!snap || !snap.exists()) {
      return null;
    }

    const data = snap.data();
    return {
      uid,
      email: data.email ?? null,
      displayName: data.displayName ?? null,
      photoURL: data.photoURL ?? null,
      onboardingCompleted: Boolean(data.onboardingCompleted),
      top5: Array.isArray(data.top5) ? data.top5 : [],
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  } catch (error) {
    console.warn('Firestore getUserProfile error (using fallback):', error);
    return null;
  }
}

/**
 * Save user onboarding top 5 choices and mark onboardingCompleted: true
 * Times out after 4 seconds to never freeze the user if the Firestore database is not yet created.
 */
export async function saveUserTop5(
  uid: string,
  email: string | null,
  top5: number[],
  extraProfileData?: { displayName?: string | null; photoURL?: string | null }
): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    const savePromise = setDoc(
      userRef,
      {
        email,
        onboardingCompleted: true,
        top5,
        displayName: extraProfileData?.displayName ?? null,
        photoURL: extraProfileData?.photoURL ?? null,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    await withTimeout(savePromise, 4000, null);
  } catch (error) {
    console.warn('Warning saving user top 5 to Firestore:', error);
  }
}

/**
 * Save reaction to users/{uid}/reactions/{tmdbId}
 * Schema: { mediaType: "movie" | "tv", reaction: string, timestamp: serverTimestamp }
 */
export async function saveUserReaction(
  uid: string,
  tmdbId: number,
  mediaType: MediaType,
  reaction: ReactionType,
  metadata?: { title?: string; poster_path?: string | null }
): Promise<void> {
  try {
    const reactionRef = doc(db, 'users', uid, 'reactions', String(tmdbId));
    setDoc(reactionRef, {
      mediaType,
      reaction,
      timestamp: serverTimestamp(),
      ...(metadata?.title && { title: metadata.title }),
      ...(metadata?.poster_path !== undefined && { poster_path: metadata.poster_path }),
    }).catch((err) => console.warn('Background Firestore reaction sync:', err));
  } catch (error) {
    console.warn(`Warning saving reaction for media ${tmdbId}:`, error);
  }
}

/**
 * Fetch all reactions for a given user with timeout protection.
 */
export async function getUserReactions(
  uid: string
): Promise<Record<number, UserReaction>> {
  try {
    const reactionsRef = collection(db, 'users', uid, 'reactions');
    const snapshot = await withTimeout(getDocs(reactionsRef), 4000, null);
    const reactionsMap: Record<number, UserReaction> = {};

    if (snapshot && typeof snapshot.forEach === 'function') {
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const id = Number(docSnap.id);
        reactionsMap[id] = {
          tmdbId: id,
          mediaType: data.mediaType as MediaType,
          reaction: data.reaction as ReactionType,
          timestamp: data.timestamp,
          title: data.title,
          poster_path: data.poster_path,
        };
      });
    }

    return reactionsMap;
  } catch (error) {
    console.warn('Warning fetching user reactions from Firestore:', error);
    return {};
  }
}

/**
 * Remove a reaction (in case user resets or un-reacts)
 */
export async function deleteUserReaction(uid: string, tmdbId: number): Promise<void> {
  try {
    const reactionRef = doc(db, 'users', uid, 'reactions', String(tmdbId));
    deleteDoc(reactionRef).catch((err) => console.warn('Background reaction deletion error:', err));
  } catch (error) {
    console.warn(`Warning deleting reaction ${tmdbId}:`, error);
  }
}
