export type MediaType = 'movie' | 'tv';
export type MediaTypeFilter = 'all' | 'movie' | 'tv';

export type ReactionType = 'watched' | 'seems_good' | 'maybe' | 'nah';

export interface ReactionConfig {
  id: ReactionType;
  label: string;
  emoji: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface MediaItem {
  id: number;
  title: string;
  original_title?: string;
  name?: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  media_type: MediaType;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  popularity?: number;
  // Spotify-style Smart Recommendation Attributes
  matchScore?: number;
  recommendationReason?: string;
  isWildcard?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  onboardingCompleted: boolean;
  top5: number[];
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface UserReaction {
  tmdbId: number;
  mediaType: MediaType;
  reaction: ReactionType;
  timestamp: unknown;
  title?: string;
  poster_path?: string | null;
  genre_ids?: number[];
  rating?: number; // 1 to 10 rating for watched items
}

export interface TasteProfile {
  genreWeights: Record<number, number>;
  topGenreIds: number[];
  topGenreNames: string[];
  positiveSeedIds: number[];
}

export interface TmdbResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}
