import React, { useState } from 'react';
import { X, Trash2, Film, Tv, BookmarkCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { REACTION_CONFIG } from './ReactionButtons';
import type { ReactionType } from '../../types';
import { getImageUrl } from '../../api/tmdb';

interface ReactionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReactionDrawer: React.FC<ReactionDrawerProps> = ({ isOpen, onClose }) => {
  const { reactions, removeReaction } = useAuth();
  const [activeTab, setActiveTab] = useState<ReactionType | 'all'>('all');

  if (!isOpen) return null;

  const reactionList = Object.values(reactions);
  const filteredList =
    activeTab === 'all'
      ? reactionList
      : reactionList.filter((item) => item.reaction === activeTab);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-slate-900 border-l border-white/10 h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <BookmarkCheck className="w-5 h-5 text-fuchsia-400" />
              Taste Activity Log
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              {reactionList.length} total titles reviewed
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reaction Filter Tabs */}
        <div className="p-3 border-b border-white/10 flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            All ({reactionList.length})
          </button>
          {(Object.keys(REACTION_CONFIG) as ReactionType[]).map((type) => {
            const config = REACTION_CONFIG[type];
            const count = reactionList.filter((r) => r.reaction === type).length;
            const isActive = activeTab === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setActiveTab(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-white text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <span>{config.emoji}</span>
                <span>{config.label}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredList.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <span className="text-4xl mb-3">🎬</span>
              <p className="text-sm font-bold text-white">No titles in this reaction category yet.</p>
              <p className="text-xs text-slate-400 mt-1">
                React to movies or TV shows on the discover feed!
              </p>
            </div>
          ) : (
            filteredList.map((item) => {
              const config = REACTION_CONFIG[item.reaction];
              return (
                <div
                  key={item.tmdbId}
                  className="flex items-center justify-between gap-3 p-3 bg-slate-950/60 border border-white/5 rounded-2xl hover:border-white/15 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={getImageUrl(item.poster_path, 'w300')}
                      alt={item.title || 'Media poster'}
                      className="w-12 h-16 object-cover rounded-xl shrink-0 bg-slate-800"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">
                        {item.title || `TMDB ID: ${item.tmdbId}`}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400">
                          {item.mediaType === 'movie' ? (
                            <Film className="w-3 h-3 text-indigo-400" />
                          ) : (
                            <Tv className="w-3 h-3 text-pink-400" />
                          )}
                          {item.mediaType === 'movie' ? 'Movie' : 'TV'}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border ${config.badgeBg}`}
                        >
                          <span>{config.emoji}</span>
                          <span>{config.label}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeReaction(item.tmdbId)}
                    title="Remove reaction (restore to discovery feed)"
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
