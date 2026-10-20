import React, { useState } from 'react';
import { RedditPost } from '../types';
import { formatNumber, formatTimeAgo } from '../services/redditApi';
import { 
  Bookmark, 
  Trash2, 
  Download, 
  Share2, 
  ArrowBigUp, 
  ExternalLink, 
  Sparkles,
  Layers,
  Play
} from 'lucide-react';

interface SavedPostsViewProps {
  posts: RedditPost[];
  onOpenLightbox: (post: RedditPost) => void;
  onRemoveSaved: (post: RedditPost) => void;
  onClearAll: () => void;
}

export const SavedPostsView: React.FC<SavedPostsViewProps> = ({
  posts,
  onOpenLightbox,
  onRemoveSaved,
  onClearAll,
}) => {
  const [selectedSubFilter, setSelectedSubFilter] = useState<string>('all');
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);

  // Unique subreddits among saved posts
  const subreddits = Array.from(new Set(posts.map((p) => p.subreddit)));

  const filteredPosts = selectedSubFilter === 'all'
    ? posts
    : posts.filter((p) => p.subreddit.toLowerCase() === selectedSubFilter.toLowerCase());

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(posts, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `aetherscroll_saved_posts_${Date.now()}.json`);
    dlAnchor.click();
  };

  const handleCopyLinks = () => {
    const links = posts.map((p) => `${p.title}: ${p.redditUrl}`).join('\n');
    navigator.clipboard.writeText(links).then(() => {
      setCopiedMessage('Copied all links to clipboard!');
      setTimeout(() => setCopiedMessage(null), 2500);
    });
  };

  if (posts.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 text-amber-400">
          <Bookmark className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-semibold text-zinc-100">No saved media yet</h2>
        <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
          While scrolling through Stream, Masonry, or Grid mode, click the bookmark icon or press <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-300 font-mono text-[10px]">S</kbd> to save any photo or clip.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header with Title & Export Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-100">
              Saved Collection
            </h1>
            <span className="text-xs font-mono tabular-nums px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {posts.length} {posts.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Locally stored media bookmarks across all your visited subreddits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLinks}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 rounded-lg border border-white/10 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Copy Links</span>
          </button>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 rounded-lg border border-white/10 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all saved media?')) {
                onClearAll();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-xs font-medium text-rose-300 rounded-lg border border-rose-500/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {copiedMessage && (
        <div className="mt-4 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-300 text-center animate-fade-in">
          {copiedMessage}
        </div>
      )}

      {/* Subreddit Filter Tags */}
      {subreddits.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto py-4">
          <span className="text-xs text-zinc-500 shrink-0">Filter by sub:</span>
          <button
            onClick={() => setSelectedSubFilter('all')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              selectedSubFilter === 'all'
                ? 'bg-zinc-100 text-zinc-950 font-semibold'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All ({posts.length})
          </button>
          {subreddits.map((sub) => {
            const count = posts.filter((p) => p.subreddit.toLowerCase() === sub.toLowerCase()).length;
            return (
              <button
                key={sub}
                onClick={() => setSelectedSubFilter(sub)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  selectedSubFilter.toLowerCase() === sub.toLowerCase()
                    ? 'bg-[#FF4500] text-white font-semibold'
                    : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                r/{sub} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Saved Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pt-4">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            onClick={() => onOpenLightbox(post)}
            className="group relative bg-[#11131b] border border-white/[0.08] hover:border-white/20 rounded-xl overflow-hidden cursor-pointer shadow-md transition-all flex flex-col justify-between"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-zinc-950">
              <img
                src={post.thumbnailUrl || post.mediaUrl}
                alt={post.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                {post.mediaType === 'video' && (
                  <div className="p-1 rounded bg-black/60 backdrop-blur-md text-white">
                    <Play className="w-3 h-3 fill-current" />
                  </div>
                )}
                {post.mediaType === 'gallery' && (
                  <div className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md text-white text-[10px] font-mono flex items-center gap-1">
                    <Layers className="w-3 h-3 text-[#FF8717]" />
                    <span>{post.galleryItems?.length || 1}</span>
                  </div>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveSaved(post);
                }}
                className="absolute top-2 left-2 p-1.5 rounded-lg bg-black/60 hover:bg-rose-600 backdrop-blur-md text-zinc-300 hover:text-white transition-colors"
                title="Remove from saved"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-3.5">
              <div className="flex items-center gap-1 text-[11px] text-zinc-400 mb-1">
                <span className="font-semibold text-[#FF8717]">r/{post.subreddit}</span>
                <span>·</span>
                <span>{formatTimeAgo(post.createdAt)}</span>
              </div>
              <h3 className="text-xs font-medium text-zinc-100 line-clamp-2 leading-relaxed mb-3">
                {post.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-white/[0.04]">
                <span className="flex items-center gap-1 font-mono tabular-nums text-zinc-300">
                  <ArrowBigUp className="w-3.5 h-3.5 text-[#FF4500]" />
                  {formatNumber(post.score)}
                </span>
                <a
                  href={post.redditUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="hover:text-[#FF8717] transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
