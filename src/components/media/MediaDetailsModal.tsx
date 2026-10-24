import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Film,
  Tv,
  Star,
  Calendar,
  ExternalLink,
  Loader2,
  Tv2,
  ShoppingCart,
  Sparkles,
} from 'lucide-react';
import type { MediaItem, MediaVideo, ReactionType, WatchProvidersResponse, WatchProvider } from '../../types';
import { fetchMediaVideos, fetchWatchProviders, getImageUrl, getProviderLogoUrl, getGenreName } from '../../api/tmdb';
import { ReactionButtons } from './ReactionButtons';

interface MediaDetailsModalProps {
  media: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  activeReaction?: ReactionType;
  onReact?: (media: MediaItem, reaction: ReactionType) => void;
}

const POPULAR_COUNTRIES = [
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
];

export const MediaDetailsModal: React.FC<MediaDetailsModalProps> = ({
  media,
  isOpen,
  onClose,
  activeReaction,
  onReact,
}) => {
  const [videos, setVideos] = useState<MediaVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<MediaVideo | null>(null);
  const [providers, setProviders] = useState<WatchProvidersResponse>({});
  const [selectedCountry, setSelectedCountry] = useState<string>('IN');
  const [isLoadingExtras, setIsLoadingExtras] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Fetch trailers and OTT providers when media changes
  useEffect(() => {
    if (!isOpen || !media) {
      setVideos([]);
      setSelectedVideo(null);
      setProviders({});
      return;
    }

    let isMounted = true;
    setIsLoadingExtras(true);

    Promise.all([
      fetchMediaVideos(media.id, media.media_type),
      fetchWatchProviders(media.id, media.media_type),
    ])
      .then(([vids, provs]) => {
        if (!isMounted) return;
        setVideos(vids);
        setSelectedVideo(vids.length > 0 ? vids[0] : null);
        setProviders(provs);

        // Smart default: If IN has no providers but US does, or keep IN as default
        if (!provs['IN'] && provs['US']) {
          setSelectedCountry('US');
        } else {
          setSelectedCountry('IN');
        }
      })
      .catch((err) => {
        console.error('Failed to load extra details:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingExtras(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, media]);

  if (!isOpen || !media) return null;

  const isMovie = media.media_type === 'movie';
  const releaseYear = (media.release_date || media.first_air_date || '').split('-')[0];
  const genres = (media.genre_ids || []).map(getGenreName);

  const countryData = providers[selectedCountry] || providers['US'] || providers['IN'];
  const flatrateProviders: WatchProvider[] = countryData?.flatrate || [];
  const rentProviders: WatchProvider[] = countryData?.rent || [];
  const buyProviders: WatchProvider[] = countryData?.buy || [];

  // Deduplicate buy providers if they are already in rent
  const uniqueRentBuyMap = new Map<number, WatchProvider>();
  rentProviders.forEach((p) => uniqueRentBuyMap.set(p.provider_id, p));
  buyProviders.forEach((p) => {
    if (!uniqueRentBuyMap.has(p.provider_id)) {
      uniqueRentBuyMap.set(p.provider_id, p);
    }
  });
  const rentOrBuyList = Array.from(uniqueRentBuyMap.values());

  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${media.title} official trailer`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-xl transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-3xl bg-slate-900/95 border border-white/15 rounded-3xl sm:rounded-[32px] overflow-hidden shadow-2xl z-10 my-auto text-slate-100 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 ring-1 ring-white/10">
        
        {/* Modal Top Bar */}
        <div className="relative p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/60 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 pr-4">
            <span className="p-2 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400">
              {isMovie ? <Film className="w-4 h-4" /> : <Tv className="w-4 h-4" />}
            </span>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-black text-white truncate tracking-tight">
                {media.title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                {releaseYear && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {releaseYear}
                  </span>
                )}
                {releaseYear && <span>&bull;</span>}
                <span className="flex items-center gap-1 text-amber-300 font-bold">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {media.vote_average.toFixed(1)}
                </span>
                {media.matchScore && (
                  <>
                    <span>&bull;</span>
                    <span className="text-fuchsia-400 font-bold">{media.matchScore}% Match</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1">
          
          {/* YouTube Trailer Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Play className="w-4 h-4 text-rose-500 fill-rose-500" />
                <span>Trailer & Video Preview</span>
              </h3>

              {selectedVideo && (
                <a
                  href={`https://www.youtube.com/watch?v=${selectedVideo.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in YouTube</span>
                </a>
              )}
            </div>

            {/* Video Player */}
            {isLoadingExtras ? (
              <div className="aspect-video w-full rounded-2xl bg-slate-950/80 border border-white/10 flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-fuchsia-500" />
                <span className="text-xs font-medium">Finding official trailer...</span>
              </div>
            ) : selectedVideo ? (
              <div className="space-y-2.5">
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/15 shadow-xl">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${selectedVideo.key}?rel=0&modestbranding=1`}
                    title={selectedVideo.name || media.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>

                {/* Video Switcher Pills (if multiple trailers/clips) */}
                {videos.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {videos.slice(0, 5).map((vid) => {
                      const isCurrent = selectedVideo.key === vid.key;
                      return (
                        <button
                          key={vid.key}
                          type="button"
                          onClick={() => setSelectedVideo(vid)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-white/5'
                          }`}
                        >
                          {vid.type === 'Trailer' ? '🎬' : '▶'} {vid.name.length > 25 ? `${vid.name.slice(0, 25)}...` : vid.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-video w-full rounded-2xl bg-slate-950/60 border border-white/10 flex flex-col items-center justify-center p-6 text-center gap-3">
                <div className="p-3 rounded-full bg-rose-500/10 text-rose-400">
                  <Play className="w-8 h-8 fill-rose-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">No direct TMDB trailer available</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-md">
                    You can watch the official trailers, teasers, and interviews directly on YouTube.
                  </p>
                </div>
                <a
                  href={youtubeSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-black shadow-lg shadow-rose-600/25 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Search "{media.title}" on YouTube</span>
                </a>
              </div>
            )}
          </div>

          {/* OTT Platforms & Where to Stream Section */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <Tv2 className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Where to Stream & Watch (OTT)
                </h3>
              </div>

              {/* Country Picker Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto bg-slate-950/80 p-1 rounded-xl border border-white/10">
                {POPULAR_COUNTRIES.map((c) => {
                  const isSelected = selectedCountry === c.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setSelectedCountry(c.code)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>{c.flag}</span>
                      <span>{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Providers Content */}
            {isLoadingExtras ? (
              <div className="p-8 rounded-2xl bg-slate-950/60 border border-white/10 flex items-center justify-center gap-2 text-slate-400 text-xs">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span>Checking streaming availability...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 1. Subscription / Flatrate Streaming (Prime, Netflix, Hotstar, etc.) */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                    <span>Included with Subscription</span>
                  </h4>

                  {flatrateProviders.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                      {flatrateProviders.map((provider) => (
                        <div
                          key={provider.provider_id}
                          className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-slate-950/70 border border-white/10 hover:border-emerald-500/40 hover:bg-slate-950 transition-all group"
                        >
                          {provider.logo_path ? (
                            <img
                              src={getProviderLogoUrl(provider.logo_path, 'w92')}
                              alt={provider.provider_name}
                              className="w-9 h-9 rounded-xl object-cover shrink-0 shadow-md group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                              OTT
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">
                              {provider.provider_name}
                            </p>
                            <span className="text-[10px] text-emerald-400 font-semibold">
                              Stream Free
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-slate-950/40 border border-white/5 text-slate-400 text-xs">
                      Not currently available on subscription streaming in{' '}
                      <span className="font-bold text-slate-300">
                        {POPULAR_COUNTRIES.find((c) => c.code === selectedCountry)?.name || selectedCountry}
                      </span>
                      . Check Rent / Buy options below or switch country.
                    </div>
                  )}
                </div>

                {/* 2. Rent or Buy Options */}
                {rentOrBuyList.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <ShoppingCart className="w-3.5 h-3.5 text-amber-400" />
                      <span>Rent / Buy Digitally</span>
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                      {rentOrBuyList.map((provider) => (
                        <div
                          key={provider.provider_id}
                          className="flex items-center gap-2.5 p-2 rounded-2xl bg-slate-950/50 border border-white/5 hover:border-amber-400/30 transition-all"
                        >
                          {provider.logo_path ? (
                            <img
                              src={getProviderLogoUrl(provider.logo_path, 'w92')}
                              alt={provider.provider_name}
                              className="w-8 h-8 rounded-xl object-cover shrink-0 shadow-sm"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-[10px] text-slate-400">
                              Store
                            </div>
                          )}
                          <p className="text-xs font-medium text-slate-300 truncate">
                            {provider.provider_name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* External JustWatch / TMDB Provider Link */}
                {countryData?.link && (
                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-white/5">
                    <span>Streaming data powered by JustWatch &amp; TMDB</span>
                    <a
                      href={countryData.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-bold"
                    >
                      <span>Full Streaming Guide</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Overview & Genre Details */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              About this Title
            </h4>
            <div className="flex gap-4 items-start">
              {media.poster_path && (
                <img
                  src={getImageUrl(media.poster_path, 'w300')}
                  alt={media.title}
                  className="w-16 sm:w-20 rounded-xl object-cover shadow-lg border border-white/10 shrink-0"
                />
              )}
              <div className="space-y-2 flex-1 min-w-0">
                <p className="text-sm text-slate-300 leading-relaxed">
                  {media.overview || 'No synopsis provided.'}
                </p>
                {genres.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {genres.map((g) => (
                      <span
                        key={g}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/10 text-slate-200 border border-white/5"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer with Reaction Buttons */}
        {onReact && (
          <div className="p-4 sm:p-5 border-t border-white/10 bg-slate-950/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>React &amp; Update Taste</span>
            </div>

            <ReactionButtons
              size="md"
              variant="full"
              activeReaction={activeReaction}
              onReact={(reaction) => {
                onReact(media, reaction);
                onClose();
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
