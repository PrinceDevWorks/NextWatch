import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Film, Tv, Check, X, Sparkles, Star, ArrowRight, Loader2, Flame } from 'lucide-react';
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

  useEffect(() => {
    let mounted = true;
    fetchTrending('all', 1)
      .then((items) => {
        if (mounted) setTrendingItems(items.slice(0, 18));
      })
      .catch((err) => console.error('Error loading onboarding suggestions:', err));
    return () => {
      mounted = false;
    };
  }, []);

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
          setSearchResults(results.slice(0, 18));
        })
        .catch((err) => {
          console.error('Search error:', err);
        })
        .finally(() => {
          setIsSearching(false);
        });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const toggleSelect = (media: MediaItem) => {
    setErrorMsg(null);
    const isAlreadySelected = selectedItems.some((item) => item.id === media.id);

    if (isAlreadySelected) {
      setSelectedItems((prev) => prev.filter((item) => item.id !== media.id));
    } else {
      if (selectedItems.length >= 5) {
        setErrorMsg('You already picked 5! Tap any selected title to swap it out.');
        return;
      }
      setSelectedItems((prev) => [...prev, media]);
    }
  };

  const handleFinish = async () => {
    if (selectedItems.length !== 5) {
      setErrorMsg('Pick exactly 5 titles to tune your recommendation algorithm.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      const top5Ids = selectedItems.map((item) => item.id);
      await completeOnboarding(top5Ids);
      navigate('/', { replace: true });
    } catch (err: any) {
      console.warn('Onboarding save notice:', err);
      navigate('/', { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const itemsToDisplay = searchQuery.trim() ? searchResults : trendingItems;
  const isComplete = selectedItems.length === 5;

  return (
    <div className="min-h-screen bg-[#05070f] flex flex-col justify-between selection:bg-fuchsia-500 selection:text-white pb-32">
      {/* Background Neon Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 left-1/4 w-[600px] h-[500px] bg-gradient-to-tr from-violet-600/20 via-fuchsia-600/10 to-transparent blur-[120px]" />
      </div>

      {/* Header Bar */}
      <header className="sticky top-0 z-30 w-full bg-slate-950/80 backdrop-blur-2xl border-b border-white/10 py-4 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-fuchsia-500/25">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white tracking-tight flex items-center gap-1.5">
                <span>Welcome, {currentUser?.displayName?.split(' ')[0] || 'Friend'}!</span>
                <span className="text-xs font-normal text-fuchsia-400">✨</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">Calibrate Your Spotify For Movies</p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-white/10">
              <span className="text-xs font-bold text-slate-400">Your Picks:</span>
              <span
                className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                  isComplete
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white'
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
                flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all shadow-xl
                ${
                  isComplete
                    ? 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 hover:opacity-90 text-white shadow-fuchsia-600/30 active:scale-95 cursor-pointer animate-bounce'
                    : 'bg-slate-900 text-slate-600 border border-white/5 cursor-not-allowed'
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Calibrating...</span>
                </>
              ) : (
                <>
                  <span>Launch Feed</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 py-8 w-full flex-1">
        {/* Instruction Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-300 mb-3">
            <Flame className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>Pick Exactly 5 GOATs</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            What 5 movies or shows define your{' '}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              vibe?
            </span>
          </h2>
          <p className="text-sm text-slate-400 mt-2 font-medium">
            NextWatch studies your 5 favorites to seed your personalized Discover mix.
          </p>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="max-w-xl mx-auto mb-6 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs text-center font-bold">
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
            placeholder="Search favorites: e.g. Interstellar, Breaking Bad, Arcane..."
            className="w-full pl-11 pr-10 py-3.5 bg-slate-900/90 border border-white/10 rounded-3xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20 shadow-2xl transition-all font-medium"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {isSearching && (
            <div className="absolute right-11 top-1/2 -translate-y-1/2">
              <Loader2 className="w-4 h-4 text-fuchsia-400 animate-spin" />
            </div>
          )}
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
            {searchQuery.trim() ? `Search Matches for "${searchQuery}"` : '🔥 Trending & Certified Banger Suggestions'}
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Tap to select or deselect
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
                  relative group flex flex-col rounded-3xl overflow-hidden border cursor-pointer transition-all duration-300 select-none
                  ${
                    isSelected
                      ? 'border-fuchsia-500 ring-2 ring-fuchsia-500/60 bg-fuchsia-950/20 shadow-xl shadow-fuchsia-950/50 -translate-y-1.5'
                      : 'border-white/10 bg-slate-900/60 hover:border-white/20 hover:bg-slate-900 hover:-translate-y-0.5'
                  }
                `}
              >
                {/* Poster */}
                <div className="relative aspect-[2/3] w-full bg-slate-950 overflow-hidden">
                  <img
                    src={getImageUrl(item.poster_path, 'w300')}
                    alt={item.title}
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                      isSelected ? 'brightness-75' : ''
                    }`}
                    loading="lazy"
                  />

                  {/* Selected Check Badge */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-fuchsia-950/60 backdrop-blur-xs flex items-center justify-center">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 text-white flex items-center justify-center shadow-xl shadow-fuchsia-900/60 scale-110 animate-in zoom-in-75 duration-150">
                        <Check className="w-6 h-6 stroke-[3]" />
                      </div>
                    </div>
                  )}

                  {/* Media Type Badge */}
                  <div className="absolute top-2 left-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-slate-950/80 backdrop-blur-md border border-white/15 text-slate-200">
                      {isMovie ? <Film className="w-2.5 h-2.5 text-indigo-400" /> : <Tv className="w-2.5 h-2.5 text-pink-400" />}
                      {isMovie ? 'Movie' : 'TV'}
                    </span>
                  </div>

                  <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-950/80 backdrop-blur-md border border-amber-400/40 text-amber-300">
                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                      {item.vote_average.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Details Footer */}
                <div className="p-3">
                  <div className="text-[10px] text-slate-400 font-medium">{year}</div>
                  <h4 className="text-xs font-black text-white truncate group-hover:text-fuchsia-300 transition-colors">
                    {item.title}
                  </h4>
                </div>
              </div>
            );
          })}
        </div>

        {itemsToDisplay.length === 0 && !isSearching && (
          <div className="text-center py-16 text-slate-400">
            <p className="text-sm font-bold">No titles found for &quot;{searchQuery}&quot;</p>
            <p className="text-xs text-slate-500 mt-1">Try another title or genre keyword.</p>
          </div>
        )}
      </main>

      {/* Floating Bottom Selection Dock */}
      <aside aria-label="Selection Dock" className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-2xl border-t border-white/10 p-3 sm:p-4 shadow-2xl">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto py-1">
            <span className="text-xs font-black text-slate-400 shrink-0 mr-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" /> Top 5:
            </span>
            {Array.from({ length: 5 }).map((_, idx) => {
              const item = selectedItems[idx];
              return (
                <div
                  key={idx}
                  className={`
                    relative w-11 h-14 rounded-2xl overflow-hidden border shrink-0 flex items-center justify-center transition-all
                    ${
                      item
                        ? 'border-fuchsia-500 shadow-lg shadow-fuchsia-950/50 group ring-1 ring-fuchsia-500/50'
                        : 'border-dashed border-slate-700 bg-slate-900/60 text-slate-600 text-xs font-black'
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
              w-full sm:w-auto px-7 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all
              ${
                isComplete
                  ? 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 text-white shadow-xl shadow-fuchsia-600/30 cursor-pointer active:scale-95'
                  : 'bg-slate-900 text-slate-600 border border-white/5 cursor-not-allowed'
              }
            `}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Launching...</span>
              </>
            ) : (
              <>
                <span>Launch My Discover Mix ({selectedItems.length}/5)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </aside>
    </div>
  );
};
