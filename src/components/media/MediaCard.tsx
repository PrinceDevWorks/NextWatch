import React, { useState } from 'react';
import { Star, Tv, Film, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import type { MediaItem, ReactionType } from '../../types';
import { getImageUrl } from '../../api/tmdb';
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

  if (layout === 'focus') {
    return (
      <div className="w-full max-w-xl mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md transition-all">
        {/* Backdrop / Poster Container */}
        <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-slate-950">
          <img
            src={media.backdrop_path ? getImageUrl(media.backdrop_path, 'w1280') : posterUrl}
            alt={media.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center filter brightness-90 transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

          {/* Badges Overlay */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-200">
              {isMovie ? <Film className="w-3.5 h-3.5 text-indigo-400" /> : <Tv className="w-3.5 h-3.5 text-purple-400" />}
              {isMovie ? 'Movie' : 'TV Series'}
            </span>
            {releaseYear && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {releaseYear}
              </span>
            )}
          </div>

          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 backdrop-blur-md border border-amber-500/40 text-amber-300">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {media.vote_average.toFixed(1)}
              {media.vote_count > 0 && (
                <span className="text-amber-300/70 text-[10px]">({media.vote_count.toLocaleString()})</span>
              )}
            </span>
          </div>

          {/* Title on Focus Banner */}
          <div className="absolute bottom-4 left-5 right-5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
              {media.title}
            </h2>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 sm:p-6 space-y-5">
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {media.overview}
          </p>

          <div className="pt-2 border-t border-slate-800/80">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 text-center">
              Quick Reaction
            </div>
            <ReactionButtons
              size="lg"
              activeReaction={activeReaction}
              onReact={(reaction) => onReact(media, reaction)}
            />
          </div>
        </div>
      </div>
    );
  }

  // Standard Grid Layout
  return (
    <div className="group flex flex-col bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-950/20">
      {/* Poster Image */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-950">
        <img
          src={posterUrl}
          alt={media.title}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/30" />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-950/80 backdrop-blur-md border border-slate-700/50 text-slate-200">
            {isMovie ? <Film className="w-3 h-3 text-indigo-400" /> : <Tv className="w-3 h-3 text-purple-400" />}
            {isMovie ? 'Movie' : 'TV'}
          </span>
        </div>

        <div className="absolute top-2.5 right-2.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-slate-950/80 backdrop-blur-md border border-amber-500/40 text-amber-300">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {media.vote_average.toFixed(1)}
          </span>
        </div>

        {/* Year & Title Overlay near bottom of image */}
        <div className="absolute bottom-2.5 left-3 right-3">
          {releaseYear && (
            <span className="text-[11px] font-medium text-slate-300/80">
              {releaseYear}
            </span>
          )}
          <h3 className="text-base sm:text-lg font-bold text-white line-clamp-1 drop-shadow-sm">
            {media.title}
          </h3>
        </div>
      </div>

      {/* Card Content & Reactions */}
      <div className="flex-1 flex flex-col justify-between p-3.5 sm:p-4 gap-3">
        <div className="relative">
          <p
            className={`text-xs text-slate-400 leading-relaxed ${
              isExpanded ? 'line-clamp-none' : 'line-clamp-2'
            }`}
          >
            {media.overview}
          </p>
          {media.overview && media.overview.length > 90 && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-0.5 mt-1 text-[11px] font-medium text-indigo-400 hover:text-indigo-300 cursor-pointer"
            >
              {isExpanded ? (
                <>
                  Show Less <ChevronUp className="w-3 h-3" />
                </>
              ) : (
                <>
                  Read More <ChevronDown className="w-3 h-3" />
                </>
              )}
            </button>
          )}
        </div>

        {/* Reaction Buttons */}
        <div className="pt-2 border-t border-slate-800/80">
          <ReactionButtons
            size="sm"
            activeReaction={activeReaction}
            onReact={(reaction) => onReact(media, reaction)}
          />
        </div>
      </div>
    </div>
  );
};
