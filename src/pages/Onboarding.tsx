import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Film, Tv, Check, X, Sparkles, Star, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchTrending, searchMedia, getImageUrl } from '../api/tmdb';
import type { MediaItem } from '../types';

export const Onboarding: React.FC = () => {
  const { currentUser, completeOnboarding } = useAuth();
  const navigate = useNavigate();

  const [selectedItems, setSelectedItems] = useState<MediaItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [trendingItems, setTrendingItems] = useState<MediaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load initial trending suggestions to pick from
  useEffect(() => {
    let mounted = true;
    fetchTrending('all', 1)
      .then((items) => {
        if (mounted) setTrendingItems(items.slice(0, 16));
      })
      .catch((err) => console.error('Error loading onboarding suggestions:', err));
    return () => {
      mounted = false;
    };
  }, []);

  // Search effect with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      searchMedia(searchQuery, 'all')
        .then((results) => {
          setSearchResults(results.slice(0, 16));
        })
        .catch((err) => {
          console.error('Search error:', err);
        })
        .finally(() => {
          setIsSearching(false);
        });
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const toggleSelect = (media: MediaItem) => {
    setErrorMsg(null);
    const isAlreadySelected = selectedItems.some((item) => item.id === media.id);

    if (isAlreadySelected) {
      setSelectedItems((prev) => prev.filter((item) => item.id !== media.id));
    } else {
      if (selectedItems.length >= 5) {
        setErrorMsg('You can select exactly 5 favorites. Remove one to add this title.');
        return;
      }
      setSelectedItems((prev) => [...prev, media]);
    }
  };

  const handleFinish = async () => {
    if (selectedItems.length !== 5) {
      setErrorMsg('Please select exactly 5 movies or TV shows to proceed.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      const top5Ids = selectedItems.map((item) => item.id);
      await completeOnboarding(top5Ids);
      navigate('/', { replace: true });
    } catch (err: any) {
      console.error('Failed to complete onboarding:', err);
      setErrorMsg(err.message || 'Failed to save your selections. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const itemsToDisplay = searchQuery.trim() ? searchResults : trendingItems;
  const isComplete = selectedItems.length === 5;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between selection:bg-indigo-500 selection:text-white pb-28">
      {/* Header Bar */}
      <header className="sticky top-0 z-30 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 py-4 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Film className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                Welcome, {currentUser?.displayName?.split(' ')[0] || 'Friend'}!
              </h1>
              <p className="text-xs text-slate-400">Step 1 of 1: Taste Profile Calibration</p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800">
              <span className="text-xs font-medium text-slate-300">Selected:</span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  isComplete
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                }`}
              >
                {selectedItems.length} / 5
              </span>
            </div>

            <button
              type="button"
              disabled={!isComplete || isSubmitting}
              onClick={handleFinish}
              className={`
                flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-lg
                ${
                  isComplete
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 active:scale-95 cursor-pointer animate-pulse'
                    : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Taste Profile...</span>
                </>
              ) : (
                <>
                  <span>Start Discovering</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 w-full flex-1">
        {/* Instruction Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Select Exactly 5 Titles</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            What are 5 movies or shows you genuinely love?
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            These will be stored in your Firestore profile to anchor your personalized recommendation algorithm.
          </p>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="max-w-xl mx-auto mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center">
            {errorMsg}
          </div>
        )}

        {/* Search Input Bar */}
        <div className="max-w-xl mx-auto mb-8 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search favorites: e.g. Inception, Breaking Bad, Arcane..."
            className="w-full pl-11 pr-10 py-3 bg-slate-900/90 border border-slate-800 rounded-2xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-xl transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          {isSearching && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2">
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
            </div>
          )}
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            {searchQuery.trim() ? `Search Results for "${searchQuery}"` : 'Trending & Popular Suggestions'}
          </h3>
          <span className="text-xs text-slate-500">
            Click any title to select or unselect
          </span>
        </div>

        {/* Media Selection Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
          {itemsToDisplay.map((item) => {
            const isSelected = selectedItems.some((selected) => selected.id === item.id);
            const isMovie = item.media_type === 'movie';
            const year = (item.release_date || item.first_air_date || '').split('-')[0];

            return (
              <div
                key={item.id}
                onClick={() => toggleSelect(item)}
                className={`
                  relative group flex flex-col rounded-2xl overflow-hidden border cursor-pointer transition-all duration-200 select-none
                  ${
                    isSelected
                      ? 'border-indigo-500 ring-2 ring-indigo-500/50 bg-indigo-950/20 shadow-lg shadow-indigo-950/40 -translate-y-1'
                      : 'border-slate-800/80 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                  }
                `}
              >
                {/* Poster */}
                <div className="relative aspect-[2/3] w-full bg-slate-950 overflow-hidden">
                  <img
                    src={getImageUrl(item.poster_path, 'w300')}
                    alt={item.title}
                    className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                      isSelected ? 'brightness-75' : ''
                    }`}
                    loading="lazy"
                  />

                  {/* Selected Check Badge */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-indigo-950/50 backdrop-blur-xs flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-900/60 scale-110 animate-in zoom-in-75 duration-150">
                        <Check className="w-6 h-6 stroke-[3]" />
                      </div>
                    </div>
                  )}

                  {/* Media Type Badge */}
                  <div className="absolute top-2 left-2">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-950/80 backdrop-blur-md border border-slate-700/50 text-slate-200">
                      {isMovie ? <Film className="w-2.5 h-2.5 text-indigo-400" /> : <Tv className="w-2.5 h-2.5 text-purple-400" />}
                      {isMovie ? 'Movie' : 'TV'}
                    </span>
                  </div>

                  <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-950/80 backdrop-blur-md border border-amber-500/30 text-amber-300">
                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                      {item.vote_average.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Details Footer */}
                <div className="p-2.5">
                  <div className="text-[10px] text-slate-400">{year}</div>
                  <h4 className="text-xs font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                    {item.title}
                  </h4>
                </div>
              </div>
            );
          })}
        </div>

        {itemsToDisplay.length === 0 && !isSearching && (
          <div className="text-center py-16 text-slate-400">
            <p className="text-sm font-semibold">No titles found for &quot;{searchQuery}&quot;</p>
            <p className="text-xs text-slate-500 mt-1">Try another title or keyword.</p>
          </div>
        )}
      </main>

      {/* Floating Bottom Selection Dock */}
      <aside aria-label="Selection Dock" className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 p-3 sm:p-4 shadow-2xl">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto py-1">
            <span className="text-xs font-semibold text-slate-400 shrink-0 mr-1">
              Your Top 5:
            </span>
            {Array.from({ length: 5 }).map((_, idx) => {
              const item = selectedItems[idx];
              return (
                <div
                  key={idx}
                  className={`
                    relative w-11 h-14 rounded-lg overflow-hidden border shrink-0 flex items-center justify-center transition-all
                    ${
                      item
                        ? 'border-indigo-500 shadow-md shadow-indigo-950/50 group'
                        : 'border-dashed border-slate-700 bg-slate-900/60 text-slate-600 text-xs font-bold'
                    }
                  `}
                >
                  {item ? (
                    <>
                      <img
                        src={getImageUrl(item.poster_path, 'w300')}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => toggleSelect(item)}
                        className="absolute inset-0 bg-slate-950/70 text-rose-400 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
              );
            })}
          </div>

          <button
            type="button"
            disabled={!isComplete || isSubmitting}
            onClick={handleFinish}
            className={`
              w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all
              ${
                isComplete
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 cursor-pointer active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }
            `}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Finalizing...</span>
              </>
            ) : (
              <>
                <span>Complete Onboarding ({selectedItems.length}/5)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </aside>
    </div>
  );
};
