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
      <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Vibe Tag */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-amber-400 flex items-center justify-center shadow-lg shadow-fuchsia-500/25 rotate-[-2deg] hover:rotate-0 transition-transform">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                NextWatch
              </span>

              {/* Gen Z Taste Radar Pill */}
              <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>{primaryVibe} Radar</span>
              </div>

              {isDemoUser && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Demo
                </span>
              )}
            </div>
          </div>

          {/* User Controls */}
          {currentUser && (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Activity / Reactions Drawer */}
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="relative flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-white/10 hover:border-white/25 text-slate-200 hover:text-white transition-all text-xs sm:text-sm font-bold cursor-pointer hover:shadow-lg hover:shadow-indigo-500/10"
                title="View your saved reactions"
              >
                <BookmarkCheck className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">Taste Log</span>
                {totalReactions > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white">
                    {totalReactions}
                  </span>
                )}
              </button>

              {/* User Avatar */}
              <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-9 h-9 rounded-full ring-2 ring-indigo-500/50 object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-bold text-white max-w-[120px] truncate">
                    {userProfile?.displayName || currentUser.displayName || 'Movie Fan'}
                  </span>
                  <span className="text-[10px] text-slate-400 max-w-[120px] truncate">
                    {currentUser.email}
                  </span>
                </div>

                {/* Sign Out Button */}
                <button
                  type="button"
                  onClick={signOut}
                  title="Sign out"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
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
