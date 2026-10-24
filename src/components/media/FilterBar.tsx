import React from 'react';
import { Search, Film, Tv, Clapperboard, X, LayoutGrid, Layers } from 'lucide-react';
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
  const filterOptions: { id: MediaTypeFilter; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'all', label: 'Both', icon: Clapperboard },
    { id: 'movie', label: 'Movies', icon: Film },
    { id: 'tv', label: 'TV Shows', icon: Tv },
  ];

  return (
    <div className="w-full bg-slate-900/70 border border-slate-800/80 rounded-2xl p-3 sm:p-4 backdrop-blur-md shadow-xl flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by title, actor, or genre..."
          className="w-full pl-10 pr-9 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Controls Container */}
      <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5">
        {/* MediaType Filter Toggle */}
        <div className="inline-flex p-1 bg-slate-950/70 border border-slate-800 rounded-xl">
          {filterOptions.map((opt) => {
            const Icon = opt.icon;
            const isActive = filter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onFilterChange(opt.id)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer
                  ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }
                `}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* View Mode Switcher (Grid vs Focus) */}
        <div className="inline-flex p-1 bg-slate-950/70 border border-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            title="Grid View"
            className={`
              p-1.5 rounded-lg transition-all cursor-pointer
              ${
                viewMode === 'grid'
                  ? 'bg-slate-800 text-indigo-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }
            `}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('focus')}
            title="Focus Deck View"
            className={`
              p-1.5 rounded-lg transition-all cursor-pointer
              ${
                viewMode === 'focus'
                  ? 'bg-slate-800 text-indigo-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }
            `}
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>

        {typeof totalFilteredCount === 'number' && (
          <span className="hidden lg:inline text-xs font-medium text-slate-400 bg-slate-800/60 px-2.5 py-1.5 rounded-lg border border-slate-700/50">
            {totalFilteredCount} titles
          </span>
        )}
      </div>
    </div>
  );
};
