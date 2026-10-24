import React from 'react';
import { Search, Film, Tv, Sparkles, X, LayoutGrid, Layers } from 'lucide-react';
import type { MediaTypeFilter } from '../../types';

interface FilterBarProps {
  filter: MediaTypeFilter;
  onFilterChange: (filter: MediaTypeFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: 'grid' | 'focus';
  onViewModeChange: (mode: 'grid' | 'focus') => void;
  totalFilteredCount?: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  totalFilteredCount,
}) => {
  const filterOptions: { id: MediaTypeFilter; label: string; emoji: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'all', label: 'All Mix', emoji: '✨', icon: Sparkles },
    { id: 'movie', label: 'Movies', emoji: '🎬', icon: Film },
    { id: 'tv', label: 'Series', emoji: '📺', icon: Tv },
  ];

  return (
    <div className="w-full bg-slate-900/60 border border-white/10 rounded-3xl p-3 sm:p-4 backdrop-blur-2xl shadow-xl flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by title, director, or vibe..."
          className="w-full pl-11 pr-10 py-2.5 bg-slate-950/80 border border-white/10 rounded-2xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Controls Container */}
      <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5">
        {/* MediaType Filter Toggle */}
        <div className="inline-flex p-1 bg-slate-950/80 border border-white/10 rounded-2xl">
          {filterOptions.map((opt) => {
            const isActive = filter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onFilterChange(opt.id)}
                className={`
                  flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer
                  ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500 to-fuchsia-600 text-white shadow-lg shadow-indigo-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <span>{opt.emoji}</span>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* View Mode Switcher (Grid vs Focus) */}
        <div className="inline-flex p-1 bg-slate-950/80 border border-white/10 rounded-2xl">
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            title="Grid View"
            className={`
              p-2 rounded-xl transition-all cursor-pointer
              ${
                viewMode === 'grid'
                  ? 'bg-white/10 text-indigo-400 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }
            `}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('focus')}
            title="Focus Deck Mode"
            className={`
              p-2 rounded-xl transition-all cursor-pointer
              ${
                viewMode === 'focus'
                  ? 'bg-white/10 text-fuchsia-400 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }
            `}
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>

        {typeof totalFilteredCount === 'number' && (
          <span className="hidden lg:inline text-xs font-bold text-slate-400 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
            {totalFilteredCount} in queue
          </span>
        )}
      </div>
    </div>
  );
};
