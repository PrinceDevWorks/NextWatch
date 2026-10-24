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
 * Fetch a user's profile document from Firestore.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
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
    console.error('Error fetching user profile:', error);
    throw error;
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
    await setDoc(
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
  } catch (error) {
    console.error('Error saving user top 5:', error);
    throw error;
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
    await setDoc(reactionRef, {
      mediaType,
      reaction,
      timestamp: serverTimestamp(),
      ...(metadata?.title && { title: metadata.title }),
      ...(metadata?.poster_path !== undefined && { poster_path: metadata.poster_path }),
    });
  } catch (error) {
    console.error(`Error saving reaction for media ${tmdbId}:`, error);
    throw error;
  }
}

/**
 * Fetch all reactions for a given user.
 * Returns a map of tmdbId -> UserReaction for instant O(1) lookup.
 */
export async function getUserReactions(
  uid: string
): Promise<Record<number, UserReaction>> {
  try {
    const reactionsRef = collection(db, 'users', uid, 'reactions');
    const snapshot = await getDocs(reactionsRef);
    const reactionsMap: Record<number, UserReaction> = {};

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

    return reactionsMap;
  } catch (error) {
    console.error('Error fetching user reactions:', error);
    return {};
  }
}

/**
 * Remove a reaction (in case user resets or un-reacts)
 */
export async function deleteUserReaction(uid: string, tmdbId: number): Promise<void> {
  try {
    const reactionRef = doc(db, 'users', uid, 'reactions', String(tmdbId));
    await deleteDoc(reactionRef);
  } catch (error) {
    console.error(`Error deleting reaction ${tmdbId}:`, error);
    throw error;
  }
}
