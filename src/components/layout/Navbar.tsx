import React, { useState } from 'react';
import { Film, LogOut, BookmarkCheck, User as UserIcon, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ReactionDrawer } from '../media/ReactionDrawer';

export const Navbar: React.FC = () => {
  const { currentUser, userProfile, reactions, signOut, isDemoUser } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const totalReactions = Object.keys(reactions).length;

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                NextWatch
              </span>
              {isDemoUser && (
                <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Sparkles className="w-2.5 h-2.5" /> Demo Mode
                </span>
              )}
            </div>
          </div>

          {/* User Controls */}
          {currentUser && (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* History / Reactions Button */}
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white transition-all text-xs sm:text-sm font-medium cursor-pointer"
                title="View your saved reactions"
              >
                <BookmarkCheck className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">My Activity</span>
                {totalReactions > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                    {totalReactions}
                  </span>
                )}
              </button>

              {/* User Avatar */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-semibold text-white max-w-[120px] truncate">
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
