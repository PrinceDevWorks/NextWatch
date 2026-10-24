import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchPersonalizedFeed, searchMedia, calculateTasteProfile } from '../api/tmdb';
import { MediaCard } from '../components/media/MediaCard';
import { FilterBar } from '../components/media/FilterBar';
import { Navbar } from '../components/layout/Navbar';
import { EmojiLegend } from '../components/media/ReactionButtons';
import { RatingModal } from '../components/media/RatingModal';
import { MediaDetailsModal } from '../components/media/MediaDetailsModal';
import type { MediaItem, MediaTypeFilter, ReactionType } from '../types';
import { Sparkles, Loader2, RefreshCw, ChevronLeft, ChevronRight, CheckCircle2, Shuffle, Flame } from 'lucide-react';

export const MainFeed: React.FC = () => {
  const { userProfile, reactions, addReaction } = useAuth();

  const [filter, setFilter] = useState<MediaTypeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'focus'>('grid');
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);
  const [recentReactionNotice, setRecentReactionNotice] = useState<string | null>(null);

  // Rating Modal state for "Watched" reaction feedback (1-10)
  const [ratingTargetMedia, setRatingTargetMedia] = useState<MediaItem | null>(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  // Trailer & Where to Watch (OTT) Modal state
  const [detailsMedia, setDetailsMedia] = useState<MediaItem | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleOpenDetails = (media: MediaItem) => {
    setDetailsMedia(media);
    setIsDetailsModalOpen(true);
  };

  // Compute live taste profile
  const taste = useMemo(() => {
    return calculateTasteProfile(userProfile?.top5 || [], reactions);
  }, [userProfile?.top5, reactions]);

  // Fetch personalized Spotify-style feed
  const loadMedia = useCallback(
    async (pageToLoad = 1, append = false) => {
      try {
        if (pageToLoad === 1) {
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }

        let results: MediaItem[] = [];

        if (searchQuery.trim()) {
          results = await searchMedia(searchQuery, filter, pageToLoad);
        } else {
          results = await fetchPersonalizedFeed({
            top5Ids: userProfile?.top5 || [],
            reactions,
            filter,
            page: pageToLoad,
          });
        }

        if (append) {
          setMediaList((prev) => {
            const existingIds = new Set(prev.map((i) => i.id));
            const newUnique = results.filter((i) => !existingIds.has(i.id));
            return [...prev, ...newUnique];
          });
        } else {
          setMediaList(results);
          setFocusIndex(0);
        }
      } catch (err) {
        console.error('Error fetching media for discovery feed:', err);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [filter, searchQuery, userProfile?.top5, reactions]
  );

  useEffect(() => {
    setCurrentPage(1);
    const timer = setTimeout(() => {
      loadMedia(1, false);
    }, searchQuery ? 350 : 0);

    return () => clearTimeout(timer);
  }, [loadMedia, searchQuery, filter]);

  const discoveryItems = useMemo(() => {
    return mediaList.filter((item) => !reactions[item.id]);
  }, [mediaList, reactions]);

  // Auto-paginate if remaining items are low
  useEffect(() => {
    if (!isLoading && !isLoadingMore && discoveryItems.length > 0 && discoveryItems.length < 4 && !searchQuery) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadMedia(nextPage, true);
    }
  }, [discoveryItems.length, isLoading, isLoadingMore, currentPage, loadMedia, searchQuery]);

  // Adjust focusIndex when list shrinks
  useEffect(() => {
    if (focusIndex >= discoveryItems.length && discoveryItems.length > 0) {
      setFocusIndex(discoveryItems.length - 1);
    }
  }, [discoveryItems.length, focusIndex]);

  // Handle user reaction click
  const handleReact = async (media: MediaItem, reaction: ReactionType) => {
    // If user marked as "Watched", prompt for 1-10 rating feedback!
    if (reaction === 'watched') {
      setRatingTargetMedia(media);
      setIsRatingModalOpen(true);
      return;
    }

    try {
      await addReaction(media.id, media.media_type, reaction, {
        title: media.title,
        poster_path: media.poster_path,
        genre_ids: media.genre_ids,
      });

      if (reaction === 'seems_good') {
        setRecentReactionNotice(`🔥 Super Liked "${media.title}"! Prioritizing similar vibes.`);
      } else if (reaction === 'nah') {
        setRecentReactionNotice(`💀 Passed on "${media.title}" • Disliked genres downweighted.`);
      } else {
        setRecentReactionNotice(`🤔 Saved "${media.title}" to Maybe.`);
      }
      setTimeout(() => setRecentReactionNotice(null), 3000);

      if (viewMode === 'focus' && focusIndex >= discoveryItems.length - 1) {
        setFocusIndex(Math.max(0, discoveryItems.length - 2));
      }
    } catch (err) {
      console.error('Failed to record reaction:', err);
    }
  };

  // Submit 1-10 rating from modal
  const handleRatingSubmit = async (media: MediaItem, rating: number) => {
    setIsRatingModalOpen(false);
    try {
      await addReaction(media.id, media.media_type, 'watched', {
        title: media.title,
        poster_path: media.poster_path,
        genre_ids: media.genre_ids,
        rating,
      });

      if (rating >= 8) {
        setRecentReactionNotice(`🏆 Rated ${rating}/10! Masterpiece added to your taste seed algorithm.`);
      } else if (rating <= 5) {
        setRecentReactionNotice(`💀 Rated ${rating}/10 • We'll show less of this genre in future mixes.`);
      } else {
        setRecentReactionNotice(`👀 Rated ${rating}/10 • Logged in your Watched activity.`);
      }
      setTimeout(() => setRecentReactionNotice(null), 3200);

      if (viewMode === 'focus' && focusIndex >= discoveryItems.length - 1) {
        setFocusIndex(Math.max(0, discoveryItems.length - 2));
      }
    } catch (err) {
      console.error('Failed to submit rating:', err);
    }
  };

  // Skip rating from modal
  const handleRatingSkip = async (media: MediaItem) => {
    setIsRatingModalOpen(false);
    try {
      await addReaction(media.id, media.media_type, 'watched', {
        title: media.title,
        poster_path: media.poster_path,
        genre_ids: media.genre_ids,
      });
      setRecentReactionNotice(`👀 Marked "${media.title}" as Watched.`);
      setTimeout(() => setRecentReactionNotice(null), 2500);

      if (viewMode === 'focus' && focusIndex >= discoveryItems.length - 1) {
        setFocusIndex(Math.max(0, discoveryItems.length - 2));
      }
    } catch (err) {
      console.error('Failed to skip rating:', err);
    }
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    loadMedia(nextPage, true);
  };

  const currentFocusItem = discoveryItems[focusIndex];

  return (
    <div className="min-h-screen bg-[#05070f] flex flex-col text-slate-100 selection:bg-fuchsia-500 selection:text-white">
      {/* Background Neon Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 left-1/3 w-[600px] h-[500px] bg-gradient-to-tr from-violet-600/15 via-fuchsia-600/10 to-transparent blur-[120px]" />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-cyan-600/10 blur-[140px]" />
      </div>

      {/* Top Navbar */}
      <Navbar onOpenDetails={handleOpenDetails} />

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Spotify-Style Taste DNA Header Banner */}
        {!searchQuery && (
          <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-violet-950/60 via-slate-900/80 to-slate-950/90 border border-white/10 shadow-2xl backdrop-blur-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-300 mb-2">
                  <Flame className="w-3.5 h-3.5 text-fuchsia-400" />
                  <span>Discover Mix &bull; Tuned For You</span>
                </div>
                <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                  Your Taste Radar
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  75% tailored to your favorite genres + 25% wildcard surprises to check out.
                </p>
              </div>

              {/* Dynamic Genre Affinity Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-400 mr-1">Active Vibe:</span>
                {taste.topGenreNames.map((name, i) => (
                  <span
                    key={name}
                    className={`px-3 py-1 rounded-full text-xs font-black tracking-wide border shadow-sm ${
                      i === 0
                        ? 'bg-gradient-to-r from-violet-500/30 to-fuchsia-500/30 border-fuchsia-500/50 text-fuchsia-200'
                        : i === 1
                        ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-200'
                        : 'bg-cyan-500/20 border-cyan-500/40 text-cyan-200'
                    }`}
                  >
                    #{name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reaction Emoji Legend */}
        <EmojiLegend />

        {/* Filter and Search Bar */}
        <FilterBar
          filter={filter}
          onFilterChange={setFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalFilteredCount={discoveryItems.length}
        />

        {/* Temporary Feedback Notification */}
        {recentReactionNotice && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl bg-slate-900/95 border border-fuchsia-500/50 text-white text-xs sm:text-sm font-black shadow-2xl backdrop-blur-2xl animate-in slide-in-from-bottom-3 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{recentReactionNotice}</span>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="py-28 flex flex-col items-center justify-center text-slate-400">
            <div className="relative mb-4">
              <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-xl shadow-fuchsia-500/25 animate-pulse">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div className="absolute inset-0 rounded-3xl border-2 border-fuchsia-500 border-t-transparent animate-spin" />
            </div>
            <p className="text-sm font-bold text-slate-300">Curating your personalized watch mix...</p>
          </div>
        ) : discoveryItems.length === 0 ? (
          /* Empty State when all items have been reacted to */
          <div className="py-20 flex flex-col items-center justify-center text-center max-w-md mx-auto p-8 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center text-white mb-4 shadow-xl shadow-fuchsia-500/25">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">Batch Cleared! 🔥</h3>
            <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
              {searchQuery
                ? `No unreacted titles match "${searchQuery}". Try another keyword or vibe.`
                : "You've reviewed every title in this batch. Click below to shuffle and pull the next personalized batch!"}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs sm:text-sm font-black shadow-xl shadow-fuchsia-600/30 transition-all cursor-pointer"
              >
                {isLoadingMore ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Shuffle className="w-4 h-4" />
                )}
                <span>Shuffle Next Watch Mix</span>
              </button>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs sm:text-sm font-bold transition-all cursor-pointer"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        ) : viewMode === 'focus' ? (
          /* Focus Deck Mode: Show one item at a time */
          <div className="py-4 flex flex-col items-center">
            {/* Focus Pagination Controls */}
            <div className="flex items-center justify-between w-full max-w-xl mb-4 px-2">
              <span className="text-xs font-black text-slate-400">
                Card {focusIndex + 1} of {discoveryItems.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={focusIndex === 0}
                  onClick={() => setFocusIndex((prev) => Math.max(0, prev - 1))}
                  className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  title="Previous"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={focusIndex >= discoveryItems.length - 1}
                  onClick={() =>
                    setFocusIndex((prev) => Math.min(discoveryItems.length - 1, prev + 1))
                  }
                  className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  title="Next"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {currentFocusItem && (
              <MediaCard
                media={currentFocusItem}
                layout="focus"
                onReact={handleReact}
                onOpenDetails={handleOpenDetails}
              />
            )}
          </div>
        ) : (
          /* Grid View Mode: Responsive 4-column cards with Emoji-Only reaction buttons */
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {discoveryItems.map((media) => (
                <MediaCard
                  key={media.id}
                  media={media}
                  layout="grid"
                  onReact={handleReact}
                  onOpenDetails={handleOpenDetails}
                />
              ))}
            </div>

            {/* Load More Button */}
            <div className="pt-6 pb-14 flex justify-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-white/15 hover:border-white/30 text-white text-sm font-black shadow-2xl transition-all cursor-pointer disabled:opacity-50 hover:scale-105"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-fuchsia-400" />
                    <span>Pulling More Titles...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 text-fuchsia-400" />
                    <span>Shuffle Next Mix</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Interactive 1-10 Rating Modal for Watched Titles */}
      <RatingModal
        media={ratingTargetMedia}
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        onSubmitRating={handleRatingSubmit}
        onSkipRating={handleRatingSkip}
      />

      {/* Trailer & OTT Streaming Details Modal */}
      <MediaDetailsModal
        media={detailsMedia}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        activeReaction={detailsMedia ? reactions[detailsMedia.id]?.reaction : undefined}
        onReact={handleReact}
      />
    </div>
  );
};
