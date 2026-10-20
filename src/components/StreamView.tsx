import React, { useRef, useEffect } from 'react';
import { RedditPost } from '../types';
import { MediaViewer } from './MediaViewer';
import { formatNumber, formatTimeAgo } from '../services/redditApi';
import { 
  ArrowBigUp, 
  MessageSquare, 
  Bookmark, 
  ExternalLink, 
  Share2, 
  Maximize2,
  Sparkles
} from 'lucide-react';

interface StreamViewProps {
  posts: RedditPost[];
  blurNsfw: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenLightbox: (post: RedditPost) => void;
  savedPostIds: Set<string>;
  onToggleSave: (post: RedditPost) => void;
  likedPostIds: Set<string>;
  onToggleLike: (post: RedditPost) => void;
  onOpenComments: (post: RedditPost) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  onShare: (post: RedditPost) => void;
  activePostIndex: number;
  setActivePostIndex: (idx: number) => void;
}

export const StreamView: React.FC<StreamViewProps> = ({
  posts,
  blurNsfw,
  isMuted,
  onToggleMute,
  onOpenLightbox,
  savedPostIds,
  onToggleSave,
  likedPostIds,
  onToggleLike,
  onOpenComments,
  onLoadMore,
  hasMore,
  isLoadingMore,
  onShare,
  activePostIndex,
  setActivePostIndex,
}) => {
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  // Keyboard navigation J / K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = Math.min(activePostIndex + 1, posts.length - 1);
        setActivePostIndex(nextIndex);
        cardRefs.current[nextIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = Math.max(activePostIndex - 1, 0);
        setActivePostIndex(prevIndex);
        cardRefs.current[prevIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePostIndex, posts.length, setActivePostIndex]);

  if (posts.length === 0) {
    return (
      <div className="py-24 text-center">
        <Sparkles className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-zinc-300">No media posts found</h3>
        <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
          Try switching subreddits or clearing your media filter.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 py-6 space-y-8">
      {posts.map((post, idx) => {
        const isSaved = savedPostIds.has(post.id);
        const isLiked = likedPostIds.has(post.id);
        const displayScore = isLiked ? post.score + 1 : post.score;

        return (
          <article
            key={post.id}
            ref={(el) => {
              cardRefs.current[idx] = el;
            }}
            className={`bg-[#11131b] border rounded-2xl overflow-hidden transition-all duration-200 ${
              activePostIndex === idx
                ? 'border-white/20 shadow-xl shadow-black/40 ring-1 ring-[#FF4500]/20'
                : 'border-white/[0.08] hover:border-white/15'
            }`}
            onClick={() => setActivePostIndex(idx)}
          >
            {/* Header: Zero-Pill Unboxed Clean Metadata */}
            <div className="px-5 pt-4 pb-2.5 flex items-center justify-between text-xs text-zinc-400">
              <div className="flex items-center gap-2 truncate">
                <a
                  href={`https://reddit.com/r/${post.subreddit}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-zinc-200 hover:text-[#FF8717] transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  r/{post.subreddit}
                </a>
                <span aria-hidden="true" className="text-zinc-600">·</span>
                <span className="truncate text-zinc-400">
                  u/{post.author}
                </span>
                <span aria-hidden="true" className="text-zinc-600">·</span>
                <span className="text-zinc-500 shrink-0">
                  {formatTimeAgo(post.createdAt)}
                </span>
              </div>

              {post.over18 && (
                <span className="text-[10px] font-semibold tracking-wider text-rose-400 uppercase">
                  NSFW
                </span>
              )}
            </div>

            {/* Post Title */}
            <div className="px-5 pb-3">
              <h2 className="text-sm sm:text-base font-medium text-zinc-100 leading-snug line-clamp-3">
                {post.title}
              </h2>
            </div>

            {/* Media Presentation */}
            <div className="px-2 sm:px-4">
              <MediaViewer
                post={post}
                blurNsfw={blurNsfw}
                isMuted={isMuted}
                onToggleMute={onToggleMute}
                onOpenLightbox={onOpenLightbox}
                containMode="contain"
              />
            </div>

            {/* Footer Action Bar */}
            <div className="px-5 py-3.5 flex items-center justify-between text-xs text-zinc-400 border-t border-white/[0.05] mt-2">
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Upvote button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLike(post);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                    isLiked
                      ? 'bg-[#FF4500]/15 text-[#FF4500] font-semibold'
                      : 'hover:bg-white/[0.06] hover:text-zinc-200'
                  }`}
                  title={isLiked ? 'Undo upvote' : 'Upvote'}
                >
                  <ArrowBigUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="font-mono tabular-nums">{formatNumber(displayScore)}</span>
                </button>

                {/* Comments button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenComments(post);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/[0.06] hover:text-zinc-200 transition-colors"
                  title="View Reddit comments"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="font-mono tabular-nums">{formatNumber(post.numComments)}</span>
                </button>

                {/* Bookmark / Save */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSave(post);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                    isSaved
                      ? 'bg-amber-500/15 text-amber-400 font-semibold'
                      : 'hover:bg-white/[0.06] hover:text-zinc-200'
                  }`}
                  title={isSaved ? 'Remove from Saved' : 'Save post'}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                  <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
                </button>
              </div>

              {/* Utility actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare(post);
                  }}
                  className="p-2 rounded-lg hover:bg-white/[0.06] hover:text-zinc-200 transition-colors"
                  title="Copy link to clipboard"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>

                <a
                  href={post.redditUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 rounded-lg hover:bg-white/[0.06] hover:text-zinc-200 transition-colors"
                  title="Open on Reddit"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenLightbox(post);
                  }}
                  className="p-2 rounded-lg hover:bg-white/[0.06] hover:text-zinc-200 transition-colors"
                  title="Fullscreen lightbox (F)"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </article>
        );
      })}

      {/* Infinite Scroll / Load More Footer */}
      {hasMore && (
        <div className="pt-4 pb-12 text-center">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-sm font-medium text-white rounded-xl border border-white/10 transition-colors shadow-lg disabled:opacity-50"
          >
            {isLoadingMore ? 'Loading more media...' : 'Load More Media'}
          </button>
        </div>
      )}
    </div>
  );
};
