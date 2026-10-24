import React from 'react';
import { Eye, Flame, Sparkles, Skull } from 'lucide-react';
import type { ReactionType } from '../../types';

interface ReactionButtonsProps {
  onReact: (reaction: ReactionType) => void;
  activeReaction?: ReactionType;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const REACTION_CONFIG: Record<
  ReactionType,
  {
    label: string;
    emoji: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    badgeBg: string;
    btnClass: string;
  }
> = {
  watched: {
    label: 'Watched',
    emoji: '👀',
    icon: Eye,
    accentColor: '#10b981',
    badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    btnClass:
      'hover:bg-emerald-500/20 hover:border-emerald-500/60 hover:text-emerald-300 hover:shadow-emerald-500/20',
  },
  seems_good: {
    label: 'Fire',
    emoji: '🔥',
    icon: Flame,
    accentColor: '#8b5cf6',
    badgeBg: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    btnClass:
      'hover:bg-violet-500/20 hover:border-violet-500/60 hover:text-violet-300 hover:shadow-violet-500/20',
  },
  maybe: {
    label: 'Maybe',
    emoji: '🤔',
    icon: Sparkles,
    accentColor: '#f59e0b',
    badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    btnClass:
      'hover:bg-amber-500/20 hover:border-amber-500/60 hover:text-amber-300 hover:shadow-amber-500/20',
  },
  nah: {
    label: 'Pass',
    emoji: '💀',
    icon: Skull,
    accentColor: '#f43f5e',
    badgeBg: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    btnClass:
      'hover:bg-rose-500/20 hover:border-rose-500/60 hover:text-rose-300 hover:shadow-rose-500/20',
  },
};

export const ReactionButtons: React.FC<ReactionButtonsProps> = ({
  onReact,
  activeReaction,
  disabled = false,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs gap-1.5',
    md: 'px-3.5 py-2 text-xs sm:text-sm gap-2',
    lg: 'px-5 py-3 text-sm sm:text-base gap-2.5',
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
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
            className={`
              relative flex items-center justify-center font-bold rounded-2xl border transition-all duration-200 backdrop-blur-md select-none
              ${sizeClasses[size]}
              ${item.btnClass}
              ${
                isActive
                  ? 'bg-white text-slate-950 border-white shadow-xl scale-[1.02]'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:shadow-lg'
              }
              ${disabled ? 'opacity-40 cursor-not-allowed' : 'active:scale-95 cursor-pointer'}
            `}
          >
            <span className="text-base sm:text-lg shrink-0 leading-none">{item.emoji}</span>
            <span className="truncate tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
