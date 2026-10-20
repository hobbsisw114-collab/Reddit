import React from 'react';
import { RedditPost } from '../types';
import { formatNumber } from '../services/redditApi';
import { 
  Play, 
  Layers, 
  ArrowBigUp, 
  Bookmark, 
  EyeOff,
  Sparkles
} from 'lucide-react';

interface MasonryViewProps {
  posts: RedditPost[];
  blurNsfw: boolean;
  onOpenLightbox: (post: RedditPost) => void;
  savedPostIds: Set<string>;
  onToggleSave: (post: RedditPost) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
}

export const MasonryView: React.FC<MasonryViewProps> = ({
  posts,
  blurNsfw,
  onOpenLightbox,
  savedPostIds,
  onToggleSave,
  onLoadMore,
  hasMore,
  isLoadingMore,
}) => {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* CSS Columns Masonry */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        {posts.map((post) => {
          const isSaved = savedPostIds.has(post.id);
          const shouldBlur = post.over18 && blurNsfw;
          const displayUrl = post.thumbnailUrl || post.mediaUrl;

          return (
            <div
              key={post.id}
              onClick={() => onOpenLightbox(post)}
              className="break-inside-avoid group relative rounded-xl overflow-hidden bg-zinc-900 border border-white/[0.08] hover:border-white/20 transition-all duration-300 cursor-pointer shadow-md hover:shadow-2xl"
            >
              {/* Media Image Thumbnail */}
              <div className="relative w-full overflow-hidden bg-zinc-950">
                <img
                  src={displayUrl}
                  alt={post.title}
                  referrerPolicy="no-referrer"
                  className={`w-full object-cover group-hover:scale-[1.03] transition-transform duration-300 ${
                    shouldBlur ? 'blur-2xl' : ''
                  }`}
                  loading="lazy"
                  onError={(e) => {
                    if (post.mediaUrl && e.currentTarget.src !== post.mediaUrl) {
                      e.currentTarget.src = post.mediaUrl;
                    }
                  }}
                />

                {/* Media Type Badges */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 z-10">
                  {post.mediaType === 'video' && (
                    <div className="p-1 rounded bg-black/60 backdrop-blur-md text-white shadow-sm">
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </div>
                  )}

                  {post.mediaType === 'gallery' && post.galleryItems?.length > 1 && (
                    <div className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md text-white text-[10px] font-mono flex items-center gap-1 shadow-sm">
                      <Layers className="w-3 h-3 text-[#FF8717]" />
                      <span>{post.galleryItems.length}</span>
                    </div>
                  )}

                  {post.over18 && (
                    <div className="px-1.5 py-0.5 rounded bg-rose-500/80 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase">
                      NSFW
                    </div>
                  )}
                </div>

                {/* NSFW notice if blurred */}
                {shouldBlur && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 p-4 text-center">
                    <EyeOff className="w-5 h-5 text-rose-300 mb-1" />
                    <span className="text-[11px] font-semibold text-rose-200">NSFW Media</span>
                    <span className="text-[9px] text-zinc-400">Click to inspect</span>
                  </div>
                )}
              </div>

              {/* Hover Dark Gradient Overlay with Title and Metadata */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3.5 text-white pointer-events-none">
                <div className="flex items-center justify-between pointer-events-auto">
                  <span className="text-[11px] font-semibold text-zinc-300 truncate max-w-[150px]">
                    r/{post.subreddit}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSave(post);
                    }}
                    className={`p-1.5 rounded-lg bg-black/60 backdrop-blur-md transition-colors ${
                      isSaved ? 'text-amber-400' : 'text-white/80 hover:text-white'
                    }`}
                    title={isSaved ? 'Remove from Saved' : 'Save post'}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <div className="pointer-events-auto">
                  <p className="text-xs font-medium text-zinc-100 line-clamp-2 mb-2 leading-snug">
                    {post.title}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span className="flex items-center gap-1 font-mono tabular-nums text-zinc-300">
                      <ArrowBigUp className="w-3.5 h-3.5 text-[#FF8717]" />
                      {formatNumber(post.score)}
                    </span>
                    <span className="text-zinc-400">
                      u/{post.author}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Subtle Bar for non-hover state */}
              <div className="p-3 bg-[#11131b] border-t border-white/[0.04] flex items-center justify-between text-xs text-zinc-400">
                <span className="truncate max-w-[140px] font-medium text-zinc-300">
                  r/{post.subreddit}
                </span>
                <span className="font-mono tabular-nums text-[11px] text-zinc-400 flex items-center gap-1">
                  <ArrowBigUp className="w-3 h-3 text-[#FF8717]" />
                  {formatNumber(post.score)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="pt-8 pb-12 text-center">
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
