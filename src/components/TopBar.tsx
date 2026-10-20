import React from 'react';
import { ViewMode } from '../types';
import { 
  Film, 
  LayoutGrid, 
  Columns3, 
  Tv2, 
  Bookmark, 
  SlidersHorizontal,
  Keyboard,
  Compass
} from 'lucide-react';

interface TopBarProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  savedCount: number;
  onOpenShortcuts: () => void;
  onOpenSettings: () => void;
  onOpenSubredditSearch: () => void;
  activeSubreddit: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentView,
  onSelectView,
  savedCount,
  onOpenShortcuts,
  onOpenSettings,
  onOpenSubredditSearch,
  activeSubreddit,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#090a10]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => onSelectView('stream')} 
            className="flex items-center gap-2.5 text-left group transition-opacity hover:opacity-90"
            title="AetherScroll Home"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#FF4500] to-[#FF8717] flex items-center justify-center text-white shadow-sm shadow-[#FF4500]/20">
              <Film className="w-4 h-4" />
            </div>
            <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
              AetherScroll
            </span>
          </button>
        </div>

        {/* Zone 2: Primary Nav View Modes (Single-line controls) */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onSelectView('stream')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'stream'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Stream</span>
          </button>

          <button
            onClick={() => onSelectView('masonry')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'masonry'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
            }`}
          >
            <Columns3 className="w-3.5 h-3.5" />
            <span>Masonry</span>
          </button>

          <button
            onClick={() => onSelectView('grid')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'grid'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Grid</span>
          </button>

          <button
            onClick={() => onSelectView('cinema')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'cinema'
                ? 'bg-[#FF4500]/20 text-[#FF8717] border border-[#FF4500]/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
            }`}
          >
            <Tv2 className="w-3.5 h-3.5" />
            <span>Cinema</span>
          </button>

          <button
            onClick={() => onSelectView('saved')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'saved'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved</span>
            {savedCount > 0 && (
              <span className="text-[11px] font-mono tabular-nums text-zinc-300">
                ({savedCount})
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenSubredditSearch}
            className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-zinc-800/80 hover:bg-zinc-700/80 border border-white/10 rounded-lg transition-colors whitespace-nowrap shrink-0"
            title="Browse or switch subreddit"
          >
            <Compass className="w-3.5 h-3.5 text-[#FF8717]" />
            <span className="max-w-[100px] sm:max-w-[140px] truncate">
              r/{activeSubreddit}
            </span>
          </button>

          <button
            onClick={onOpenShortcuts}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors"
            title="Keyboard shortcuts (?)"
            aria-label="Keyboard shortcuts"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors"
            title="Preferences & playback settings"
            aria-label="Preferences"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
