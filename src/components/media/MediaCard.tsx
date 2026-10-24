import React, { useState } from 'react';
import { Star, Tv, Film, Calendar, ChevronDown, ChevronUp, Sparkles, Zap } from 'lucide-react';
import type { MediaItem, ReactionType } from '../../types';
import { getImageUrl, getGenreName } from '../../api/tmdb';
import { ReactionButtons } from './ReactionButtons';

interface MediaCardProps {
  media: MediaItem;
  onReact: (media: MediaItem, reaction: ReactionType) => void;
  activeReaction?: ReactionType;
  layout?: 'grid' | 'focus';
}

export const MediaCard: React.FC<MediaCardProps> = ({
  media,
  onReact,
  activeReaction,
  layout = 'grid',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const posterUrl = imageError
    ? getImageUrl(null)
    : getImageUrl(media.poster_path, layout === 'focus' ? 'w780' : 'w500');

  const releaseYear = (media.release_date || media.first_air_date || '').split('-')[0];
  const isMovie = media.media_type === 'movie';
  const genres = (media.genre_ids || []).slice(0, 3).map(getGenreName);

  if (layout === 'focus') {
    return (
      <div className="w-full max-w-xl mx-auto bg-slate-900/90 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl backdrop-blur-2xl transition-all ring-1 ring-white/5">
        {/* Recommendation Reason Banner */}
        {media.recommendationReason && (
          <div
            className={`px-5 py-2 text-xs font-black tracking-wide flex items-center justify-between border-b ${
              media.isWildcard
                ? 'bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-purple-500/20 border-amber-500/30 text-amber-300'
                : 'bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 border-indigo-500/30 text-indigo-300'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              {media.isWildcard ? <Sparkles className="w-3.5 h-3.5 text-amber-400" /> : <Zap className="w-3.5 h-3.5 text-indigo-400" />}
              <span className="truncate">{media.recommendationReason}</span>
            </div>
            {media.matchScore && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-white/10 text-white shrink-0 ml-2">
                {media.matchScore}% Match
              </span>
            )}
          </div>
        )}

        {/* Backdrop / Poster Container */}
        <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-slate-950">
          <img
            src={media.backdrop_path ? getImageUrl(media.backdrop_path, 'w1280') : posterUrl}
            alt={media.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center filter brightness-90 transition-transform duration-700 hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Badges Overlay */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-950/80 backdrop-blur-xl border border-white/15 text-slate-200">
              {isMovie ? <Film className="w-3.5 h-3.5 text-indigo-400" /> : <Tv className="w-3.5 h-3.5 text-pink-400" />}
              {isMovie ? 'Movie' : 'Series'}
            </span>
            {releaseYear && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-950/80 backdrop-blur-xl border border-white/15 text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {releaseYear}
              </span>
            )}
          </div>

          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20">
              <Star className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
              {media.vote_average.toFixed(1)}
            </span>
          </div>

          {/* Title and Genre Tags */}
          <div className="absolute bottom-4 left-5 right-5 space-y-1.5">
            <div className="flex flex-wrap gap-1.5">
              {genres.map((g) => (
                <span
                  key={g}
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/15 text-white/90 backdrop-blur-md"
                >
                  {g}
                </span>
              ))}
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
              {media.title}
            </h2>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 sm:p-6 space-y-5">
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
            {media.overview}
          </p>

          <div className="pt-2 border-t border-white/10">
            <div className="mb-3 text-[11px] font-black uppercase tracking-wider text-slate-400 text-center flex items-center justify-center gap-1.5">
              <span>Quick Vibe Check</span>
            </div>
            <ReactionButtons
              size="lg"
              variant="full"
              activeReaction={activeReaction}
              onReact={(reaction) => onReact(media, reaction)}
            />
          </div>
        </div>
      </div>
    );
  }

  // Standard Grid Layout (Uses Emoji-Only buttons with zero text truncation!)
  return (
    <div
      className={`group flex flex-col bg-slate-900/70 hover:bg-slate-900 border rounded-3xl overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
        media.isWildcard
          ? 'border-amber-500/40 hover:border-amber-400 hover:shadow-amber-500/20'
          : 'border-white/10 hover:border-indigo-500/50 hover:shadow-indigo-500/20'
      }`}
    >
      {/* Top Spotify-Style Reason Badge */}
      {media.recommendationReason && (
        <div
          className={`px-3 py-1.5 text-[11px] font-bold truncate flex items-center justify-between border-b ${
            media.isWildcard
              ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
              : 'bg-indigo-500/15 border-indigo-500/20 text-indigo-300'
          }`}
        >
          <span className="truncate">{media.recommendationReason}</span>
          {media.matchScore && (
            <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-white/10 text-white ml-1 shrink-0">
              {media.matchScore}%
            </span>
          )}
        </div>
      )}

      {/* Poster Image */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-950">
        <img
          src={posterUrl}
          alt={media.title}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-transparent to-black/30" />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950/80 backdrop-blur-md border border-white/15 text-slate-200">
            {isMovie ? <Film className="w-3 h-3 text-indigo-400" /> : <Tv className="w-3 h-3 text-pink-400" />}
            {isMovie ? 'Movie' : 'TV'}
          </span>
        </div>

        <div className="absolute top-2.5 right-2.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-black bg-slate-950/80 backdrop-blur-md border border-amber-400/40 text-amber-300">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {media.vote_average.toFixed(1)}
          </span>
        </div>

        {/* Genres & Title Overlay */}
        <div className="absolute bottom-3 left-3 right-3 space-y-1">
          <div className="flex flex-wrap gap-1">
            {genres.slice(0, 2).map((g) => (
              <span
                key={g}
                className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-md"
              >
                {g}
              </span>
            ))}
            {releaseYear && (
              <span className="text-[10px] font-medium text-slate-300/80 self-center ml-0.5">
                &bull; {releaseYear}
              </span>
            )}
          </div>
          <h3 className="text-base font-extrabold text-white line-clamp-1 drop-shadow-md">
            {media.title}
          </h3>
        </div>
      </div>

      {/* Card Content & Reactions */}
      <div className="flex-1 flex flex-col justify-between p-3.5 gap-3">
        <div>
          <p
            className={`text-xs text-slate-400 leading-relaxed ${
              isExpanded ? 'line-clamp-none' : 'line-clamp-2'
            }`}
          >
            {media.overview}
          </p>
          {media.overview && media.overview.length > 85 && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-0.5 mt-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
            >
              {isExpanded ? (
                <>
                  Less <ChevronUp className="w-3 h-3" />
                </>
              ) : (
                <>
                  More <ChevronDown className="w-3 h-3" />
                </>
              )}
            </button>
          )}
        </div>

        {/* Reaction Buttons (Emoji-Only for clean, un-truncated layout) */}
        <div className="pt-2 border-t border-white/5">
          <ReactionButtons
            size="md"
            variant="emoji-only"
            activeReaction={activeReaction}
            onReact={(reaction) => onReact(media, reaction)}
          />
        </div>
      </div>
    </div>
  );
};
