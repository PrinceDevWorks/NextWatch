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
function withTimeout<T>(promise: Promise<T>, ms = 8000, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

/**
 * Fetch a user's profile document from Firestore.
 * This is the source of truth across all devices.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await withTimeout(getDoc(userRef), 8000, null);

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
    console.error('Firestore getUserProfile error:', error);
    return null;
  }
}

/**
 * Save user onboarding top 5 choices and mark onboardingCompleted: true
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

    await withTimeout(savePromise, 8000, null);
  } catch (error) {
    console.error('Error saving user top 5 to Firestore:', error);
  }
}

/**
 * Save reaction to users/{uid}/reactions/{tmdbId} in Cloud Firestore.
 * Schema: { mediaType: "movie" | "tv", reaction: string, rating?: number, timestamp: serverTimestamp }
 */
export async function saveUserReaction(
  uid: string,
  tmdbId: number,
  mediaType: MediaType,
  reaction: ReactionType,
  metadata?: {
    title?: string;
    poster_path?: string | null;
    genre_ids?: number[];
    rating?: number;
  }
): Promise<void> {
  try {
    const reactionRef = doc(db, 'users', uid, 'reactions', String(tmdbId));
    const payload: Record<string, any> = {
      mediaType,
      reaction,
      timestamp: serverTimestamp(),
    };

    if (metadata?.title) payload.title = metadata.title;
    if (metadata?.poster_path !== undefined) payload.poster_path = metadata.poster_path;
    if (metadata?.genre_ids && Array.isArray(metadata.genre_ids)) payload.genre_ids = metadata.genre_ids;
    if (metadata?.rating !== undefined) payload.rating = metadata.rating;

    await setDoc(reactionRef, payload, { merge: true });
  } catch (error) {
    console.error(`Error saving reaction to Firestore for ${tmdbId}:`, error);
  }
}

/**
 * Fetch all reactions for a given user from Cloud Firestore.
 * Returns a map of tmdbId -> UserReaction for instant O(1) lookup.
 */
export async function getUserReactions(
  uid: string
): Promise<Record<number, UserReaction>> {
  try {
    const reactionsRef = collection(db, 'users', uid, 'reactions');
    const snapshot = await withTimeout(getDocs(reactionsRef), 8000, null);
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
          genre_ids: data.genre_ids,
          rating: data.rating,
        };
      });
    }

    return reactionsMap;
  } catch (error) {
    console.error('Error fetching user reactions from Firestore:', error);
    return {};
  }
}

/**
 * Remove a reaction from Firestore
 */
export async function deleteUserReaction(uid: string, tmdbId: number): Promise<void> {
  try {
    const reactionRef = doc(db, 'users', uid, 'reactions', String(tmdbId));
    await deleteDoc(reactionRef);
  } catch (error) {
    console.error(`Error deleting reaction ${tmdbId} from Firestore:`, error);
  }
}
