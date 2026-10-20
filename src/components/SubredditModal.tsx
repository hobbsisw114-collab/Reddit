import React, { useState } from 'react';
import { POPULAR_SUBREDDITS } from '../services/redditApi';
import { 
  X, 
  Search, 
  Compass, 
  History, 
  Flame, 
  Layers, 
  ArrowRight
} from 'lucide-react';

interface SubredditModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSubreddit: string;
  onSelectSubreddit: (subreddit: string) => void;
  recentSubreddits: string[];
}

export const SubredditModal: React.FC<SubredditModalProps> = ({
  isOpen,
  onClose,
  activeSubreddit,
  onSelectSubreddit,
  recentSubreddits,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [multiSubs, setMultiSubs] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputVal.replace(/^r\//, '').trim();
    if (clean) {
      onSelectSubreddit(clean);
      onClose();
    }
  };

  const handlePick = (sub: string) => {
    onSelectSubreddit(sub);
    onClose();
  };

  const handleAddMulti = (sub: string) => {
    if (!multiSubs.includes(sub)) {
      setMultiSubs([...multiSubs, sub]);
    } else {
      setMultiSubs(multiSubs.filter((s) => s !== sub));
    }
  };

  const handleLaunchMulti = () => {
    if (multiSubs.length > 0) {
      onSelectSubreddit(multiSubs.join('+'));
      onClose();
    }
  };

  // Group popular subreddits by category
  const categories = Array.from(new Set(POPULAR_SUBREDDITS.map((s) => s.category)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div 
        className="w-full max-w-2xl bg-[#0f111a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FF4500]/10 text-[#FF4500]">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">Browse Subreddits</h2>
              <p className="text-xs text-zinc-400">
                Explore photography, visual art, nature, or enter any subreddit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="p-4 border-b border-white/[0.06] bg-[#141724]">
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-zinc-500 font-mono text-sm select-none">
              r/
            </span>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="e.g. EarthPorn, spaceporn, wallpapers, pics..."
              autoFocus
              className="w-full pl-8 pr-24 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-[#FF4500] transition-colors"
            />
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="absolute right-2 px-3 py-1.5 bg-[#FF4500] hover:bg-[#e03d00] disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
            >
              <span>Go</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Multi-Subreddit Composer Bar if any selected */}
        {multiSubs.length > 0 && (
          <div className="p-3 bg-[#FF4500]/10 border-b border-[#FF4500]/20 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-x-auto text-xs text-zinc-200">
              <Layers className="w-4 h-4 text-[#FF4500] shrink-0" />
              <span className="font-semibold text-[#FF8717]">Combined Multi-Reddit:</span>
              <span className="font-mono text-white">r/{multiSubs.join('+')}</span>
            </div>
            <button
              onClick={handleLaunchMulti}
              className="px-3 py-1 bg-[#FF4500] text-white text-xs font-semibold rounded-lg hover:bg-[#e03d00] transition-colors shrink-0"
            >
              Launch Feed
            </button>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Recent Subreddits */}
          {recentSubreddits.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 mb-2.5">
                <History className="w-3.5 h-3.5 text-zinc-500" />
                <span>Recently Visited</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSubreddits.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => handlePick(sub)}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-medium text-zinc-300 hover:text-white transition-colors"
                  >
                    r/{sub}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Curated Categories */}
          {categories.map((cat) => {
            const subsInCat = POPULAR_SUBREDDITS.filter((s) => s.category === cat);
            return (
              <div key={cat}>
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2.5">
                  {cat}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {subsInCat.map((sub) => {
                    const isMultiSelected = multiSubs.includes(sub.name);
                    const isActive = activeSubreddit.toLowerCase() === sub.name.toLowerCase();

                    return (
                      <div
                        key={sub.name}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                          isActive
                            ? 'bg-[#FF4500]/10 border-[#FF4500]/40'
                            : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]'
                        }`}
                      >
                        <button
                          onClick={() => handlePick(sub.name)}
                          className="flex-1 text-left"
                        >
                          <div className="text-xs font-semibold text-zinc-200">
                            r/{sub.name}
                          </div>
                          <div className="text-[11px] text-zinc-500">
                            {sub.label}
                          </div>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddMulti(sub.name);
                          }}
                          className={`text-[10px] font-mono px-2 py-0.5 rounded transition-colors ${
                            isMultiSelected
                              ? 'bg-[#FF4500] text-white font-bold'
                              : 'bg-white/[0.06] text-zinc-400 hover:text-white'
                          }`}
                          title="Add to multi-reddit combine"
                        >
                          {isMultiSelected ? '✓ Added' : '+ Multi'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
