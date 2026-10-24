import React, { useState } from 'react';
import { X, Trash2, Film, Tv, Clock } from 'lucide-react';
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
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              Reaction History
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {reactionList.length} total titles reviewed
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reaction Filter Tabs */}
        <div className="p-3 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
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
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium shrink-0 flex items-center gap-1.5 transition-all ${
                  isActive
                    ? `${config.activeClass}`
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
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
              <Clock className="w-10 h-10 text-slate-600 mb-2" />
              <p className="text-sm font-medium">No titles in this reaction category yet.</p>
              <p className="text-xs text-slate-500 mt-1">
                React to movies or TV shows on the discover feed!
              </p>
            </div>
          ) : (
            filteredList.map((item) => {
              const config = REACTION_CONFIG[item.reaction];
              const Icon = config.icon;
              return (
                <div
                  key={item.tmdbId}
                  className="flex items-center justify-between gap-3 p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={getImageUrl(item.poster_path, 'w300')}
                      alt={item.title || 'Media poster'}
                      className="w-12 h-16 object-cover rounded-lg shrink-0 bg-slate-800"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate">
                        {item.title || `TMDB ID: ${item.tmdbId}`}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                          {item.mediaType === 'movie' ? (
                            <Film className="w-3 h-3 text-indigo-400" />
                          ) : (
                            <Tv className="w-3 h-3 text-purple-400" />
                          )}
                          {item.mediaType === 'movie' ? 'Movie' : 'TV'}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${config.badgeBg}`}
                        >
                          <Icon className="w-3 h-3" />
                          {config.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeReaction(item.tmdbId)}
                    title="Remove reaction (restore to discovery feed)"
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
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
