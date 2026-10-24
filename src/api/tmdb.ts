import type { MediaItem, MediaType, MediaTypeFilter, TasteProfile, TmdbResponse, UserReaction } from '../types';
import { MOCK_MEDIA_ITEMS } from './mockData';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const tmdbApiKey =
  import.meta.env.VITE_TMDB_API_KEY?.trim() ||
  '4bd93e56b203835764b2be61bfb8a342';
const tmdbToken = import.meta.env.VITE_TMDB_ACCESS_TOKEN?.trim() || '';

export const isTmdbConfigured = Boolean(tmdbApiKey || tmdbToken);

// Comprehensive TMDB Genre Dictionary
export const GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
};

export function getGenreName(id: number): string {
  return GENRE_MAP[id] || 'General';
}

function buildRequestParams(params: Record<string, string | number | undefined> = {}) {
  const query = new URLSearchParams();

  if (tmdbApiKey && !tmdbApiKey.startsWith('eyJ')) {
    query.set('api_key', tmdbApiKey);
  }

  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== '') {
      query.set(key, String(val));
    }
  });

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (tmdbToken || (tmdbApiKey && tmdbApiKey.startsWith('eyJ'))) {
    headers['Authorization'] = `Bearer ${tmdbToken || tmdbApiKey}`;
  }

  return { query: query.toString(), headers };
}

function normalizeMediaItem(item: any, fallbackType?: MediaType): MediaItem | null {
  if (!item || item.media_type === 'person') return null;

  const media_type: MediaType =
    item.media_type === 'movie' || item.media_type === 'tv'
      ? item.media_type
      : fallbackType || (item.first_air_date ? 'tv' : 'movie');

  return {
    id: item.id,
    title: item.title || item.name || 'Untitled',
    original_title: item.original_title || item.original_name,
    name: item.name,
    overview: item.overview || 'No overview available for this title.',
    poster_path: item.poster_path || null,
    backdrop_path: item.backdrop_path || null,
    media_type,
    release_date: item.release_date || item.first_air_date || '',
    first_air_date: item.first_air_date,
    vote_average: typeof item.vote_average === 'number' ? Number(item.vote_average.toFixed(1)) : 0,
    vote_count: item.vote_count || 0,
    genre_ids: item.genre_ids || [],
    popularity: item.popularity || 0,
  };
}

export function getImageUrl(
  path: string | null | undefined,
  size: 'w300' | 'w500' | 'w780' | 'w1280' | 'original' = 'w500'
): string {
  if (!path) {
    return 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22500%22%20height%3D%22750%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20500%20750%22%3E%3Crect%20width%3D%22500%22%20height%3D%22750%22%20fill%3D%22%230b0f19%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%23475569%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%3ENo%20Poster%20Available%3C%2Ftext%3E%3C%2Fsvg%3E';
  }
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

export async function fetchTrending(
  type: MediaTypeFilter = 'all',
  page = 1
): Promise<MediaItem[]> {
  try {
    const endpoint = type === 'all' ? '/trending/all/week' : `/trending/${type}/week`;
    const { query, headers } = buildRequestParams({ page });
    const response = await fetch(`${TMDB_BASE_URL}${endpoint}?${query}`, { headers });

    if (!response.ok) throw new Error(`TMDB error: ${response.status}`);
    const data: TmdbResponse<any> = await response.json();
    return data.results
      .map((item) => normalizeMediaItem(item, type === 'all' ? undefined : type))
      .filter((item): item is MediaItem => item !== null);
  } catch (err) {
    console.warn('Fallback to sample items for trending:', err);
    return type === 'all'
      ? MOCK_MEDIA_ITEMS
      : MOCK_MEDIA_ITEMS.filter((item) => item.media_type === type);
  }
}

export async function searchMedia(
  searchQuery: string,
  type: MediaTypeFilter = 'all',
  page = 1
): Promise<MediaItem[]> {
  const trimmed = searchQuery.trim();
  if (!trimmed) return [];

  try {
    const endpoint = type === 'all' ? '/search/multi' : `/search/${type}`;
    const { query, headers } = buildRequestParams({
      query: trimmed,
      page,
      include_adult: 'false',
    });

    const response = await fetch(`${TMDB_BASE_URL}${endpoint}?${query}`, { headers });
    if (!response.ok) throw new Error(`TMDB search error: ${response.status}`);

    const data: TmdbResponse<any> = await response.json();
    return data.results
      .map((item) => normalizeMediaItem(item, type === 'all' ? undefined : type))
      .filter((item): item is MediaItem => item !== null);
  } catch (err) {
    console.warn('Fallback search in mock items:', err);
    const q = trimmed.toLowerCase();
    return MOCK_MEDIA_ITEMS.filter(
      (m) => (type === 'all' || m.media_type === type) && m.title.toLowerCase().includes(q)
    );
  }
}

export async function fetchMediaDetails(
  id: number,
  type: MediaType = 'movie'
): Promise<MediaItem | null> {
  try {
    const { query, headers } = buildRequestParams();
    const response = await fetch(`${TMDB_BASE_URL}/${type}/${id}?${query}`, { headers });
    if (!response.ok) return null;
    const data = await response.json();
    return normalizeMediaItem(data, type);
  } catch {
    return MOCK_MEDIA_ITEMS.find((item) => item.id === id) || null;
  }
}

/**
 * Fetch recommendations from TMDB based on a specific movie or TV ID
 */
export async function fetchRecommendationsForId(
  id: number,
  type: MediaType = 'movie'
): Promise<MediaItem[]> {
  try {
    const { query, headers } = buildRequestParams({ page: 1 });
    const response = await fetch(`${TMDB_BASE_URL}/${type}/${id}/recommendations?${query}`, { headers });
    if (!response.ok) return [];
    const data: TmdbResponse<any> = await response.json();
    return data.results
      .map((item) => normalizeMediaItem(item, type))
      .filter((item): item is MediaItem => item !== null);
  } catch {
    return [];
  }
}

/**
 * Discover titles by genre from TMDB
 */
export async function discoverByGenres(
  genreIds: number[],
  type: MediaType = 'movie',
  page = 1
): Promise<MediaItem[]> {
  if (genreIds.length === 0) return [];
  try {
    const { query, headers } = buildRequestParams({
      with_genres: genreIds.join(','),
      sort_by: 'popularity.desc',
      'vote_count.gte': 150,
      page,
    });
    const response = await fetch(`${TMDB_BASE_URL}/discover/${type}?${query}`, { headers });
    if (!response.ok) return [];
    const data: TmdbResponse<any> = await response.json();
    return data.results
      .map((item) => normalizeMediaItem(item, type))
      .filter((item): item is MediaItem => item !== null);
  } catch {
    return [];
  }
}

/**
 * Fetch Wildcard Surprise gems (Critically acclaimed hidden gems or cross-genres with vote >= 8.0)
 */
export async function fetchWildcardGems(page = 1, type: MediaTypeFilter = 'all'): Promise<MediaItem[]> {
  try {
    const mediaType: MediaType = type === 'tv' ? 'tv' : 'movie';
    const { query, headers } = buildRequestParams({
      sort_by: 'vote_average.desc',
      'vote_count.gte': 1200,
      'vote_average.gte': 8.0,
      page,
    });
    const response = await fetch(`${TMDB_BASE_URL}/discover/${mediaType}?${query}`, { headers });
    if (!response.ok) return [];
    const data: TmdbResponse<any> = await response.json();
    return data.results
      .map((item) => {
        const normalized = normalizeMediaItem(item, mediaType);
        if (normalized) {
          normalized.isWildcard = true;
          normalized.recommendationReason = '✨ Spotify Surprise • Critically Acclaimed Gem';
          normalized.matchScore = Math.floor(84 + Math.random() * 8); // 84 - 92%
        }
        return normalized;
      })
      .filter((item): item is MediaItem => item !== null);
  } catch {
    return [];
  }
}

/**
 * Compute the user's dynamic taste profile from their Top 5 and live reactions
 */
export function calculateTasteProfile(
  top5Ids: number[],
  reactions: Record<number, UserReaction>
): TasteProfile {
  const genreWeights: Record<number, number> = {};
  const positiveSeedIds: number[] = [...top5Ids];

  // Weight top 5 anchors (+3.5)
  top5Ids.forEach((id) => {
    // If we have known mock/cache genres or defaults
    const mockFound = MOCK_MEDIA_ITEMS.find((m) => m.id === id);
    if (mockFound?.genre_ids) {
      mockFound.genre_ids.forEach((gId) => {
        genreWeights[gId] = (genreWeights[gId] || 0) + 3.5;
      });
    } else {
      // Default common anchors like Sci-Fi (878) and Thriller (53)
      genreWeights[878] = (genreWeights[878] || 0) + 2.0;
      genreWeights[18] = (genreWeights[18] || 0) + 1.5;
    }
  });

  // Factor in live reactions dynamically!
  Object.values(reactions).forEach((r) => {
    let weight = 0;
    if (r.reaction === 'seems_good') {
      weight = 3.0;
      positiveSeedIds.push(r.tmdbId);
    } else if (r.reaction === 'watched') {
      weight = 2.0;
      positiveSeedIds.push(r.tmdbId);
    } else if (r.reaction === 'maybe') {
      weight = 0.5;
    } else if (r.reaction === 'nah') {
      weight = -2.5; // Downweight disliked genres
    }

    if (r.genre_ids && r.genre_ids.length > 0) {
      r.genre_ids.forEach((gId) => {
        genreWeights[gId] = (genreWeights[gId] || 0) + weight;
      });
    }
  });

  // Sort genres by highest weight
  const sortedGenreEntries = Object.entries(genreWeights)
    .filter(([_, score]) => score > 0)
    .sort((a, b) => b[1] - a[1]);

  const topGenreIds = sortedGenreEntries.slice(0, 3).map(([id]) => Number(id));
  const topGenreNames = topGenreIds.map((id) => getGenreName(id));

  // Fallback to Sci-Fi & Adventure if user is completely new
  if (topGenreIds.length === 0) {
    topGenreIds.push(878, 12, 18);
    topGenreNames.push('Sci-Fi', 'Adventure', 'Drama');
  }

  return {
    genreWeights,
    topGenreIds,
    topGenreNames,
    positiveSeedIds: Array.from(new Set(positiveSeedIds)),
  };
}

/**
 * Master Spotify-style Personalized Feed Generator
 * - Combines genre-affinity discoveries (Sci-Fi, Thriller, etc.)
 * - Direct TMDB recommendations based on seed favorites
 * - Injects ~20-25% "Wildcard Surprises" to expand taste
 * - Dynamically updates scores & reasons
 */
export async function fetchPersonalizedFeed({
  top5Ids,
  reactions,
  filter = 'all',
  page = 1,
}: {
  top5Ids: number[];
  reactions: Record<number, UserReaction>;
  filter: MediaTypeFilter;
  page: number;
}): Promise<MediaItem[]> {
  const taste = calculateTasteProfile(top5Ids, reactions);
  const reactedIds = new Set(Object.keys(reactions).map(Number));

  const targetTypes: MediaType[] =
    filter === 'all' ? ['movie', 'tv'] : [filter];

  // 1. Fetch targeted Genre Discoveries based on user's top genres
  const genrePromises = targetTypes.map((type) =>
    discoverByGenres(taste.topGenreIds.slice(0, 2), type, page)
  );

  // 2. Fetch seed recommendations from their latest positive titles
  const seedIdsToUse = taste.positiveSeedIds.slice(-3); // Last 3 liked items
  const seedPromises = seedIdsToUse.map((seedId) =>
    fetchRecommendationsForId(seedId, 'movie')
  );

  // 3. Fetch 2 Wildcard Surprises for serendipity
  const wildcardPromise = fetchWildcardGems(page, filter);

  // 4. Trending buffer as fallback
  const trendingPromise = fetchTrending(filter, page);

  const [genreResultsArrays, seedResultsArrays, wildcards, trending] =
    await Promise.all([
      Promise.all(genrePromises),
      Promise.all(seedPromises),
      wildcardPromise,
      trendingPromise,
    ]);

  const genreItems = genreResultsArrays.flat();
  const seedItems = seedResultsArrays.flat();

  // Combine & de-duplicate pool
  const candidateMap = new Map<number, MediaItem>();

  // Add Seed recommendations (High match score 94 - 99%)
  seedItems.forEach((item) => {
    if (!reactedIds.has(item.id)) {
      item.matchScore = Math.floor(94 + Math.random() * 5);
      const genreLabel = item.genre_ids?.slice(0, 2).map(getGenreName).join(' & ');
      item.recommendationReason = genreLabel
        ? `🔥 ${item.matchScore}% Vibe Match • ${genreLabel}`
        : `🧬 Because of your Top Picks`;
      candidateMap.set(item.id, item);
    }
  });

  // Add Genre-targeted discoveries (Score 90 - 96%)
  genreItems.forEach((item) => {
    if (!reactedIds.has(item.id) && !candidateMap.has(item.id)) {
      item.matchScore = Math.floor(89 + Math.random() * 7);
      const genreLabel = item.genre_ids?.slice(0, 2).map(getGenreName).join(' & ') || taste.topGenreNames[0];
      item.recommendationReason = `⚡ Tailored for your ${genreLabel} taste`;
      candidateMap.set(item.id, item);
    }
  });

  // Add trending items if pool is small
  trending.forEach((item) => {
    if (!reactedIds.has(item.id) && !candidateMap.has(item.id)) {
      item.matchScore = Math.floor(82 + Math.random() * 8);
      item.recommendationReason = '📈 Trending in your region';
      candidateMap.set(item.id, item);
    }
  });

  const mainPool = Array.from(candidateMap.values());

  // Interleave Wildcards (every 4th item is a Surprise Gem!)
  const interleavedList: MediaItem[] = [];
  let wildcardIdx = 0;

  for (let i = 0; i < mainPool.length; i++) {
    interleavedList.push(mainPool[i]);

    // Inject a surprise gem roughly every 4 items
    if ((i + 1) % 4 === 0 && wildcardIdx < wildcards.length) {
      const wildcard = wildcards[wildcardIdx++];
      if (!reactedIds.has(wildcard.id) && !candidateMap.has(wildcard.id)) {
        interleavedList.push(wildcard);
      }
    }
  }

  return interleavedList.length > 0 ? interleavedList : trending;
}
