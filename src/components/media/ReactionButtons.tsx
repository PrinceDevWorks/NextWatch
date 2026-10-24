import React from 'react';
import { Check, ThumbsUp, HelpCircle, X } from 'lucide-react';
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
    icon: React.ComponentType<{ className?: string }>;
    accentClass: string;
    hoverClass: string;
    activeClass: string;
    badgeBg: string;
  }
> = {
  watched: {
    label: 'Watched',
    icon: Check,
    accentClass: 'text-emerald-400 border-emerald-500/30',
    hoverClass: 'hover:bg-emerald-500/15 hover:border-emerald-500/50 hover:text-emerald-300',
    activeClass: 'bg-emerald-500/25 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-950/50',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  seems_good: {
    label: 'Seems Good',
    icon: ThumbsUp,
    accentClass: 'text-indigo-400 border-indigo-500/30',
    hoverClass: 'hover:bg-indigo-500/15 hover:border-indigo-500/50 hover:text-indigo-300',
    activeClass: 'bg-indigo-500/25 border-indigo-500 text-indigo-300 shadow-lg shadow-indigo-950/50',
    badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  },
  maybe: {
    label: 'Maybe',
    icon: HelpCircle,
    accentClass: 'text-amber-400 border-amber-500/30',
    hoverClass: 'hover:bg-amber-500/15 hover:border-amber-500/50 hover:text-amber-300',
    activeClass: 'bg-amber-500/25 border-amber-500 text-amber-300 shadow-lg shadow-amber-950/50',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  nah: {
    label: 'Nah',
    icon: X,
    accentClass: 'text-rose-400 border-rose-500/30',
    hoverClass: 'hover:bg-rose-500/15 hover:border-rose-500/50 hover:text-rose-300',
    activeClass: 'bg-rose-500/25 border-rose-500 text-rose-300 shadow-lg shadow-rose-950/50',
    badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  },
};

export const ReactionButtons: React.FC<ReactionButtonsProps> = ({
  onReact,
  activeReaction,
  disabled = false,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1.5 text-xs gap-1.5',
    md: 'px-3 py-2 text-xs sm:text-sm gap-2',
    lg: 'px-4 py-2.5 text-sm sm:text-base gap-2.5',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
      {(Object.keys(REACTION_CONFIG) as ReactionType[]).map((key) => {
        const item = REACTION_CONFIG[key];
        const Icon = item.icon;
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
              relative flex items-center justify-center font-medium rounded-xl border transition-all duration-200
              ${sizeClasses[size]}
              ${isActive ? item.activeClass : `bg-slate-900/80 border-slate-800 text-slate-300 ${item.hoverClass}`}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95 cursor-pointer'}
            `}
            title={`Mark as ${item.label}`}
          >
            <Icon className={`${iconSizes[size]} shrink-0`} />
            <span className="truncate">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
