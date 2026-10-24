import type { MediaItem, MediaType, MediaTypeFilter, TmdbResponse } from '../types';
import { MOCK_MEDIA_ITEMS } from './mockData';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const tmdbApiKey =
  import.meta.env.VITE_TMDB_API_KEY?.trim() ||
  '4bd93e56b203835764b2be61bfb8a342';
const tmdbToken = import.meta.env.VITE_TMDB_ACCESS_TOKEN?.trim() || '';

export const isTmdbConfigured = Boolean(tmdbApiKey || tmdbToken);

if (!isTmdbConfigured) {
  console.warn(
    '[NextWatch TMDB] No TMDB API key or Bearer token provided in VITE_TMDB_API_KEY. Using fallback sample media data.'
  );
}

/**
 * Helper to build headers & query params for TMDB requests
 */
function buildRequestParams(params: Record<string, string | number | undefined> = {}) {
  const query = new URLSearchParams();

  // If apiKey is provided (and not a v4 bearer token), add it as param
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

  // If using v4 token or token starting with eyJ
  if (tmdbToken || (tmdbApiKey && tmdbApiKey.startsWith('eyJ'))) {
    headers['Authorization'] = `Bearer ${tmdbToken || tmdbApiKey}`;
  }

  return { query: query.toString(), headers };
}

/**
 * Normalizes movie/tv item from TMDB so our UI receives consistent fields
 */
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

/**
 * Generates full TMDB image URL with fallback SVG placeholder if missing
 */
export function getImageUrl(
  path: string | null | undefined,
  size: 'w300' | 'w500' | 'w780' | 'w1280' | 'original' = 'w500'
): string {
  if (!path) {
    return 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22500%22%20height%3D%22750%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20500%20750%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder%7Bfill%3A%231e293b%3Bfill-opacity%3A1%3B%7D%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder%22%3E%3Crect%20width%3D%22500%22%20height%3D%22750%22%20fill%3D%22%231e293b%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%2364748b%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224%22%3ENo%20Poster%20Available%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fsvg%3E';
  }
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

/**
 * Fetch trending media (all, movies, or tv)
 */
export async function fetchTrending(
  type: MediaTypeFilter = 'all',
  page = 1
): Promise<MediaItem[]> {
  if (!isTmdbConfigured) {
    // Filter mock data
    const filtered =
      type === 'all'
        ? MOCK_MEDIA_ITEMS
        : MOCK_MEDIA_ITEMS.filter((item) => item.media_type === type);
    return filtered;
  }

  try {
    const endpoint = type === 'all' ? '/trending/all/week' : `/trending/${type}/week`;
    const { query, headers } = buildRequestParams({ page });
    const response = await fetch(`${TMDB_BASE_URL}${endpoint}?${query}`, { headers });

    if (!response.ok) {
      throw new Error(`TMDB error: ${response.status} ${response.statusText}`);
    }

    const data: TmdbResponse<any> = await response.json();
    return data.results
      .map((item) => normalizeMediaItem(item, type === 'all' ? undefined : type))
      .filter((item): item is MediaItem => item !== null);
  } catch (err) {
    console.error('Failed to fetch trending media from TMDB:', err);
    // Graceful fallback to mock data on network error
    return type === 'all'
      ? MOCK_MEDIA_ITEMS
      : MOCK_MEDIA_ITEMS.filter((item) => item.media_type === type);
  }
}

/**
 * Search movies, tv shows, or multi
 */
export async function searchMedia(
  searchQuery: string,
  type: MediaTypeFilter = 'all',
  page = 1
): Promise<MediaItem[]> {
  const trimmed = searchQuery.trim();
  if (!trimmed) return [];

  if (!isTmdbConfigured) {
    const q = trimmed.toLowerCase();
    return MOCK_MEDIA_ITEMS.filter((item) => {
      const matchesType = type === 'all' || item.media_type === type;
      const matchesQuery =
        item.title.toLowerCase().includes(q) || item.overview.toLowerCase().includes(q);
      return matchesType && matchesQuery;
    });
  }

  try {
    const endpoint = type === 'all' ? '/search/multi' : `/search/${type}`;
    const { query, headers } = buildRequestParams({
      query: trimmed,
      page,
      include_adult: 'false',
    });

    const response = await fetch(`${TMDB_BASE_URL}${endpoint}?${query}`, { headers });
    if (!response.ok) {
      throw new Error(`TMDB search error: ${response.status}`);
    }

    const data: TmdbResponse<any> = await response.json();
    return data.results
      .map((item) => normalizeMediaItem(item, type === 'all' ? undefined : type))
      .filter((item): item is MediaItem => item !== null);
  } catch (err) {
    console.error('Failed to search TMDB:', err);
    const q = trimmed.toLowerCase();
    return MOCK_MEDIA_ITEMS.filter(
      (m) => (type === 'all' || m.media_type === type) && m.title.toLowerCase().includes(q)
    );
  }
}

/**
 * Fetch detailed info for a movie or TV show by TMDB ID
 */
export async function fetchMediaDetails(
  id: number,
  type: MediaType = 'movie'
): Promise<MediaItem | null> {
  if (!isTmdbConfigured) {
    const found = MOCK_MEDIA_ITEMS.find((item) => item.id === id);
    return found || null;
  }

  try {
    const { query, headers } = buildRequestParams();
    const response = await fetch(`${TMDB_BASE_URL}/${type}/${id}?${query}`, { headers });
    if (!response.ok) {
      throw new Error(`TMDB details error: ${response.status}`);
    }

    const data = await response.json();
    return normalizeMediaItem(data, type);
  } catch (err) {
    console.error(`Failed to fetch TMDB details for ${type} ${id}:`, err);
    return null;
  }
}
