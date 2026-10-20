import React, { useState } from 'react';
import { SortOption, TimeFrame, MediaTypeFilter } from '../types';
import { POPULAR_SUBREDDITS } from '../services/redditApi';
import { 
  Flame, 
  TrendingUp, 
  Sparkles, 
  Trophy, 
  RotateCw, 
  Sliders, 
  Search,
  Eye,
  EyeOff,
  ChevronDown
} from 'lucide-react';

interface SubredditBarProps {
  activeSubreddit: string;
  onSelectSubreddit: (subreddit: string) => void;
  sort: SortOption;
  onSelectSort: (sort: SortOption) => void;
  timeframe: TimeFrame;
  onSelectTimeframe: (tf: TimeFrame) => void;
  mediaFilter: MediaTypeFilter;
  onSelectMediaFilter: (filter: MediaTypeFilter) => void;
  blurNsfw: boolean;
  onToggleBlurNsfw: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  onOpenSubredditModal: () => void;
}

export const SubredditBar: React.FC<SubredditBarProps> = ({
  activeSubreddit,
  onSelectSubreddit,
  sort,
  onSelectSort,
  timeframe,
  onSelectTimeframe,
  mediaFilter,
  onSelectMediaFilter,
  blurNsfw,
  onToggleBlurNsfw,
  onRefresh,
  isLoading,
  onOpenSubredditModal,
}) => {
  const [showTopDropdown, setShowTopDropdown] = useState(false);

  const timeframes: { label: string; value: TimeFrame }[] = [
    { label: 'Today', value: 'day' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'This Year', value: 'year' },
    { label: 'All Time', value: 'all' },
  ];

  return (
    <div className="w-full bg-[#0d0f17]/90 border-b border-white/[0.06] py-2.5 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Curated Subreddits Horizontal Scroll Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 mask-radial">
          <button
            onClick={onOpenSubredditModal}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-300 bg-white/[0.05] hover:bg-white/[0.1] rounded-md transition-colors whitespace-nowrap shrink-0 border border-white/[0.08]"
          >
            <Search className="w-3.5 h-3.5 text-zinc-400" />
            <span>Search Sub</span>
          </button>

          <div className="w-[1px] h-4 bg-white/10 mx-1 shrink-0" />

          {POPULAR_SUBREDDITS.map((sub) => {
            const isSelected = activeSubreddit.toLowerCase() === sub.name.toLowerCase();
            return (
              <button
                key={sub.name}
                onClick={() => onSelectSubreddit(sub.name)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-[#FF4500] text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06]'
                }`}
                title={`r/${sub.name} · ${sub.label}`}
              >
                r/{sub.name}
              </button>
            );
          })}
        </div>

        {/* Controls Strip: Sort, Media Filter, NSFW, Refresh */}
        <div className="flex items-center justify-between md:justify-end gap-2 shrink-0 pt-1 md:pt-0 border-t md:border-t-0 border-white/[0.06]">
          {/* Sort Buttons Segment */}
          <div className="flex items-center gap-1 p-0.5 bg-zinc-900/80 rounded-lg border border-white/[0.08]">
            <button
              onClick={() => onSelectSort('hot')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                sort === 'hot'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Flame className="w-3 h-3 text-[#FF4500]" />
              <span>Hot</span>
            </button>

            <button
              onClick={() => onSelectSort('new')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                sort === 'new'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>New</span>
            </button>

            <button
              onClick={() => onSelectSort('rising')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                sort === 'rising'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span>Rising</span>
            </button>

            {/* Top with Timeframe dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  if (sort !== 'top') {
                    onSelectSort('top');
                  } else {
                    setShowTopDropdown(!showTopDropdown);
                  }
                }}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                  sort === 'top'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Trophy className="w-3 h-3 text-yellow-400" />
                <span>Top</span>
                {sort === 'top' && (
                  <span className="text-[10px] text-zinc-400 uppercase">
                    ({timeframe})
                  </span>
                )}
                <ChevronDown className="w-2.5 h-2.5 opacity-60 ml-0.5" />
              </button>

              {showTopDropdown && (
                <div 
                  className="absolute right-0 mt-1 w-32 bg-zinc-900 border border-white/10 rounded-lg shadow-xl z-50 py-1"
                  onMouseLeave={() => setShowTopDropdown(false)}
                >
                  <div className="px-2.5 py-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                    Timeframe
                  </div>
                  {timeframes.map((tf) => (
                    <button
                      key={tf.value}
                      onClick={() => {
                        onSelectSort('top');
                        onSelectTimeframe(tf.value);
                        setShowTopDropdown(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 text-xs transition-colors ${
                        timeframe === tf.value
                          ? 'text-[#FF8717] bg-white/[0.06] font-medium'
                          : 'text-zinc-300 hover:bg-white/[0.04]'
                      }`}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Media Filter Selector */}
          <div className="hidden sm:flex items-center gap-1 p-0.5 bg-zinc-900/80 rounded-lg border border-white/[0.08]">
            {(['all', 'image', 'video', 'gallery'] as MediaTypeFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => onSelectMediaFilter(filter)}
                className={`px-2 py-1 text-xs font-medium capitalize rounded transition-colors whitespace-nowrap shrink-0 ${
                  mediaFilter === filter
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {filter === 'all' ? 'All' : filter === 'image' ? 'Photos' : filter === 'video' ? 'Videos' : 'Galleries'}
              </button>
            ))}
          </div>

          {/* NSFW Blur Toggle */}
          <button
            onClick={onToggleBlurNsfw}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
              blurNsfw
                ? 'bg-zinc-900/80 text-zinc-400 border-white/[0.08] hover:text-zinc-200'
                : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
            }`}
            title={blurNsfw ? 'NSFW media is blurred (Click to unblur)' : 'NSFW blur disabled (Click to blur)'}
          >
            {blurNsfw ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3 text-rose-400" />}
            <span className="hidden sm:inline">{blurNsfw ? 'NSFW Blurred' : 'NSFW Visible'}</span>
          </button>

          {/* Refresh Feed */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.08] transition-colors disabled:opacity-50"
            title="Reload posts"
            aria-label="Reload feed"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#FF8717]' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
