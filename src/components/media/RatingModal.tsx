import React, { useState } from 'react';
import { X, Star, Check } from 'lucide-react';
import type { MediaItem } from '../../types';
import { getImageUrl } from '../../api/tmdb';

interface RatingModalProps {
  media: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitRating: (media: MediaItem, rating: number) => void;
  onSkipRating: (media: MediaItem) => void;
}

const RATING_FEEDBACK: Record<number, { label: string; emoji: string; color: string }> = {
  1: { label: 'Terrible', emoji: '💀', color: 'text-rose-400' },
  2: { label: 'Bad', emoji: '👎', color: 'text-rose-400' },
  3: { label: 'Poor', emoji: '😕', color: 'text-rose-300' },
  4: { label: 'Weak', emoji: '🥱', color: 'text-orange-400' },
  5: { label: 'Meh / Average', emoji: '😐', color: 'text-amber-400' },
  6: { label: 'Decent', emoji: '👌', color: 'text-yellow-400' },
  7: { label: 'Good', emoji: '👍', color: 'text-lime-400' },
  8: { label: 'Really Good!', emoji: '✨', color: 'text-emerald-400' },
  9: { label: 'Loved It!', emoji: '🔥', color: 'text-fuchsia-400' },
  10: { label: 'Masterpiece!', emoji: '🏆', color: 'text-amber-300' },
};

export const RatingModal: React.FC<RatingModalProps> = ({
  media,
  isOpen,
  onClose,
  onSubmitRating,
  onSkipRating,
}) => {
  const [selectedScore, setSelectedScore] = useState<number>(8);

  if (!isOpen || !media) return null;

  const feedback = RATING_FEEDBACK[selectedScore] || { label: 'Good', emoji: '👍', color: 'text-emerald-400' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-slate-900/95 border border-white/15 rounded-[32px] p-6 shadow-2xl backdrop-blur-2xl z-10 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Media Header Preview */}
        <div className="flex items-center gap-4 mb-5">
          <img
            src={getImageUrl(media.poster_path, 'w300')}
            alt={media.title}
            className="w-16 h-24 object-cover rounded-2xl shadow-md bg-slate-800 shrink-0"
          />
          <div className="min-w-0">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Watched Title
            </span>
            <h3 className="text-lg font-black text-white truncate drop-shadow-sm mt-0.5">
              {media.title}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Rate it out of 10 to train your recommendation engine:
            </p>
          </div>
        </div>

        {/* Big Score Visualizer */}
        <div className="text-center py-4 px-3 bg-slate-950/60 rounded-2xl border border-white/5 mb-5">
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl">{feedback.emoji}</span>
            <span className="text-4xl font-black text-white">
              {selectedScore}<span className="text-lg text-slate-500 font-medium">/10</span>
            </span>
          </div>
          <p className={`text-xs font-black tracking-wide mt-1.5 ${feedback.color}`}>
            {feedback.label}
          </p>
        </div>

        {/* 1 - 10 Score Chips Grid */}
        <div className="grid grid-cols-5 gap-2 mb-6">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => {
            const isSelected = selectedScore === num;
            return (
              <button
                key={num}
                type="button"
                onClick={() => setSelectedScore(num)}
                className={`
                  py-2.5 rounded-xl font-black text-sm transition-all cursor-pointer flex flex-col items-center justify-center select-none
                  ${
                    isSelected
                      ? 'bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-fuchsia-600/30 scale-105 ring-2 ring-white/50'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/5'
                  }
                `}
              >
                <span>{num}</span>
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onSkipRating(media)}
            className="flex-1 py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-bold transition-all cursor-pointer"
          >
            Skip Rating
          </button>
          <button
            type="button"
            onClick={() => onSubmitRating(media, selectedScore)}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs sm:text-sm font-black shadow-lg shadow-emerald-500/25 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Star className="w-4 h-4 fill-white" />
            <span>Save {selectedScore}/10</span>
          </button>
        </div>
      </div>
    </div>
  );
};
