import React, { useState } from 'react';
import { Film, LogOut, BookmarkCheck, User as UserIcon, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ReactionDrawer } from '../media/ReactionDrawer';
import { calculateTasteProfile } from '../../api/tmdb';

export const Navbar: React.FC = () => {
  const { currentUser, userProfile, reactions, signOut, isDemoUser } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const totalReactions = Object.keys(reactions).length;

  // Compute primary taste vibe
  const taste = calculateTasteProfile(
    userProfile?.top5 || [],
    reactions
  );
  const primaryVibe = taste.topGenreNames[0] || 'Eclectic';

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-slate-950/85 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Vibe Tag */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-amber-400 flex items-center justify-center shadow-lg shadow-fuchsia-500/25 shrink-0 rotate-[-2deg]">
              <Film className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent truncate">
                NextWatch
              </span>

              {/* Gen Z Taste Radar Pill (Hidden on tiny screens to preserve room) */}
              <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 shrink-0">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>{primaryVibe} Radar</span>
              </div>

              {isDemoUser && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0">
                  Demo
                </span>
              )}
            </div>
          </div>

          {/* User Controls */}
          {currentUser && (
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {/* Activity / Reactions Drawer */}
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-white/10 hover:border-white/25 text-slate-200 hover:text-white transition-all text-xs sm:text-sm font-bold cursor-pointer hover:shadow-lg shrink-0"
                title="View your saved reactions"
              >
                <BookmarkCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="hidden sm:inline">Taste Log</span>
                {totalReactions > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shrink-0">
                    {totalReactions}
                  </span>
                )}
              </button>

              {/* User Avatar & Logout */}
              <div className="flex items-center gap-1.5 sm:gap-2.5 pl-1 sm:pl-2 border-l border-white/10 shrink-0">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full ring-2 ring-indigo-500/50 object-cover shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300 shrink-0">
                    <UserIcon className="w-4 h-4 shrink-0" />
                  </div>
                )}
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-white max-w-[120px] truncate">
                    {userProfile?.displayName || currentUser.displayName || 'Movie Fan'}
                  </span>
                  <span className="text-[10px] text-slate-400 max-w-[120px] truncate">
                    {currentUser.email}
                  </span>
                </div>

                {/* Sign Out Button (Always visible on mobile & desktop) */}
                <button
                  type="button"
                  onClick={signOut}
                  title="Sign out of NextWatch"
                  className="p-2 sm:p-2 text-slate-300 hover:text-rose-400 hover:bg-rose-500/20 bg-slate-900/80 sm:bg-transparent border border-white/10 sm:border-transparent rounded-xl transition-all cursor-pointer shrink-0 flex items-center justify-center"
                >
                  <LogOut className="w-4 h-4 shrink-0 text-slate-300 hover:text-rose-400" />
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <ReactionDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
};
