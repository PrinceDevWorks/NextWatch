import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchTrending, searchMedia } from '../api/tmdb';
import { MediaCard } from '../components/media/MediaCard';
import { FilterBar } from '../components/media/FilterBar';
import { Navbar } from '../components/layout/Navbar';
import type { MediaItem, MediaTypeFilter, ReactionType } from '../types';
import { Sparkles, Loader2, RefreshCw, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

export const MainFeed: React.FC = () => {
  const { reactions, addReaction } = useAuth();

  const [filter, setFilter] = useState<MediaTypeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'focus'>('grid');
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);
  const [recentReactionNotice, setRecentReactionNotice] = useState<string | null>(null);

  // Fetch initial batch when filter changes or on mount
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
          results = await fetchTrending(filter, pageToLoad);
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
    [filter, searchQuery]
  );

  // Trigger search with debounce or reload trending
  useEffect(() => {
    setCurrentPage(1);
    const timer = setTimeout(() => {
      loadMedia(1, false);
    }, searchQuery ? 350 : 0);

    return () => clearTimeout(timer);
  }, [loadMedia, searchQuery, filter]);

  // Discovery Filter: Only show items that have NOT been reacted to yet
  const discoveryItems = useMemo(() => {
    return mediaList.filter((item) => !reactions[item.id]);
  }, [mediaList, reactions]);

  // Adjust focusIndex when list shrinks
  useEffect(() => {
    if (focusIndex >= discoveryItems.length && discoveryItems.length > 0) {
      setFocusIndex(discoveryItems.length - 1);
    }
  }, [discoveryItems.length, focusIndex]);

  // Handle user reaction
  const handleReact = async (media: MediaItem, reaction: ReactionType) => {
    try {
      await addReaction(media.id, media.media_type, reaction, {
        title: media.title,
        poster_path: media.poster_path,
      });

      // Show brief floating feedback toast
      setRecentReactionNotice(`Marked "${media.title}" as ${reaction.replace('_', ' ')}`);
      setTimeout(() => setRecentReactionNotice(null), 2500);

      // In focus mode, automatically advance
      if (viewMode === 'focus' && focusIndex >= discoveryItems.length - 1) {
        setFocusIndex(Math.max(0, discoveryItems.length - 2));
      }
    } catch (err) {
      console.error('Failed to record reaction:', err);
    }
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    loadMedia(nextPage, true);
  };

  const currentFocusItem = discoveryItems[focusIndex];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
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
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-indigo-500/50 text-indigo-300 text-xs font-semibold shadow-2xl animate-in slide-in-from-bottom-2 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{recentReactionNotice}</span>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
            <p className="text-sm font-medium">Curating your discovery feed...</p>
          </div>
        ) : discoveryItems.length === 0 ? (
          /* Empty State when all items have been reacted to or nothing matched */
          <div className="py-20 flex flex-col items-center justify-center text-center max-w-md mx-auto p-8 rounded-3xl bg-slate-900/60 border border-slate-800">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">You're All Caught Up!</h3>
            <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
              {searchQuery
                ? `No unreacted titles match "${searchQuery}". Try a different keyword.`
                : "You've reviewed every trending title in this batch. Load the next page to discover more gems, or switch filters!"}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                {isLoadingMore ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>Load More Discoveries</span>
              </button>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
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
              <span className="text-xs font-semibold text-slate-400">
                Item {focusIndex + 1} of {discoveryItems.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={focusIndex === 0}
                  onClick={() => setFocusIndex((prev) => Math.max(0, prev - 1))}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
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
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
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
              />
            )}
          </div>
        ) : (
          /* Grid View Mode: Responsive 4-5 column grid */
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {discoveryItems.map((media) => (
                <MediaCard
                  key={media.id}
                  media={media}
                  layout="grid"
                  onReact={handleReact}
                />
              ))}
            </div>

            {/* Load More Button */}
            <div className="pt-6 pb-12 flex justify-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-white text-sm font-semibold shadow-xl transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    <span>Loading More Titles...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 text-indigo-400" />
                    <span>Load More Trending Media</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
