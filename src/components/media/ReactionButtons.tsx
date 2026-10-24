import React from 'react';
import { Eye, Flame, Sparkles, Skull } from 'lucide-react';
import type { ReactionType } from '../../types';

interface ReactionButtonsProps {
  onReact: (reaction: ReactionType) => void;
  activeReaction?: ReactionType;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'emoji-only' | 'full';
}

export const REACTION_CONFIG: Record<
  ReactionType,
  {
    label: string;
    sublabel: string;
    emoji: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    badgeBg: string;
    btnClass: string;
  }
> = {
  watched: {
    label: 'Watched',
    sublabel: 'Rate 1-10',
    emoji: '👀',
    icon: Eye,
    accentColor: '#10b981',
    badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    btnClass:
      'hover:bg-emerald-500/25 hover:border-emerald-500/70 hover:text-emerald-300 hover:shadow-lg hover:shadow-emerald-500/20',
  },
  seems_good: {
    label: 'Fire',
    sublabel: 'Super Like',
    emoji: '🔥',
    icon: Flame,
    accentColor: '#8b5cf6',
    badgeBg: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    btnClass:
      'hover:bg-violet-500/25 hover:border-violet-500/70 hover:text-violet-300 hover:shadow-lg hover:shadow-violet-500/20',
  },
  maybe: {
    label: 'Maybe',
    sublabel: 'Watchlist',
    emoji: '🤔',
    icon: Sparkles,
    accentColor: '#f59e0b',
    badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    btnClass:
      'hover:bg-amber-500/25 hover:border-amber-500/70 hover:text-amber-300 hover:shadow-lg hover:shadow-amber-500/20',
  },
  nah: {
    label: 'Pass',
    sublabel: 'Hide genre',
    emoji: '💀',
    icon: Skull,
    accentColor: '#f43f5e',
    badgeBg: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    btnClass:
      'hover:bg-rose-500/25 hover:border-rose-500/70 hover:text-rose-300 hover:shadow-lg hover:shadow-rose-500/20',
  },
};

/**
 * Clean visual legend explaining what each reaction emoji means
 */
export const EmojiLegend: React.FC = () => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 py-2 px-3 sm:px-5 rounded-2xl bg-slate-900/40 border border-white/5 backdrop-blur-md text-[11px] font-bold text-slate-400">
      <span className="text-slate-500 font-black uppercase text-[10px] tracking-wider">Legend:</span>
      <div className="flex items-center gap-1.5 hover:text-emerald-300 transition-colors">
        <span className="text-sm">👀</span>
        <span>Watched & Rate</span>
      </div>
      <span className="text-slate-700 hidden sm:inline">&bull;</span>
      <div className="flex items-center gap-1.5 hover:text-violet-300 transition-colors">
        <span className="text-sm">🔥</span>
        <span>Fire / Super Like</span>
      </div>
      <span className="text-slate-700 hidden sm:inline">&bull;</span>
      <div className="flex items-center gap-1.5 hover:text-amber-300 transition-colors">
        <span className="text-sm">🤔</span>
        <span>Maybe / Watchlist</span>
      </div>
      <span className="text-slate-700 hidden sm:inline">&bull;</span>
      <div className="flex items-center gap-1.5 hover:text-rose-300 transition-colors">
        <span className="text-sm">💀</span>
        <span>Pass / Hide</span>
      </div>
    </div>
  );
};

export const ReactionButtons: React.FC<ReactionButtonsProps> = ({
  onReact,
  activeReaction,
  disabled = false,
  size = 'md',
  variant = 'full',
}) => {
  const isEmojiOnly = variant === 'emoji-only';

  const sizeClasses = {
    sm: isEmojiOnly ? 'py-2 text-base' : 'px-2.5 py-1.5 text-xs gap-1.5',
    md: isEmojiOnly ? 'py-2.5 text-lg' : 'px-3.5 py-2 text-xs sm:text-sm gap-2',
    lg: isEmojiOnly ? 'py-3.5 text-2xl' : 'px-5 py-3 text-sm sm:text-base gap-2.5',
  };

  return (
    <div className="grid grid-cols-4 gap-2 w-full">
      {(Object.keys(REACTION_CONFIG) as ReactionType[]).map((key) => {
        const item = REACTION_CONFIG[key];
        const isActive = activeReaction === key;

        return (
          <button
            key={key}
            type="button"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              onReact(key);
            }}
            title={`${item.emoji} ${item.label} (${item.sublabel})`}
            className={`
              relative flex items-center justify-center font-black rounded-2xl border transition-all duration-200 backdrop-blur-md select-none
              ${sizeClasses[size]}
              ${item.btnClass}
              ${
                isActive
                  ? 'bg-white text-slate-950 border-white shadow-xl scale-[1.03]'
                  : 'bg-slate-900/70 border-white/10 text-slate-300 hover:scale-105 active:scale-95'
              }
              ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <span className={isEmojiOnly ? 'text-lg sm:text-xl leading-none' : 'text-base shrink-0 leading-none'}>
              {item.emoji}
            </span>
            {!isEmojiOnly && <span className="truncate tracking-tight">{item.label}</span>}
          </button>
        );
      })}
    </div>
  );
};
