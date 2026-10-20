import React from 'react';
import { RedditPost } from '../types';
import { formatNumber, formatTimeAgo } from '../services/redditApi';
import { 
  Play, 
  Layers, 
  ArrowBigUp, 
  MessageSquare, 
  Bookmark, 
  Sparkles
} from 'lucide-react';

interface GridViewProps {
  posts: RedditPost[];
  blurNsfw: boolean;
  onOpenLightbox: (post: RedditPost) => void;
  savedPostIds: Set<string>;
  onToggleSave: (post: RedditPost) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
}

export const GridView: React.FC<GridViewProps> = ({
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {posts.map((post) => {
          const isSaved = savedPostIds.has(post.id);
          const shouldBlur = post.over18 && blurNsfw;
          const displayUrl = post.thumbnailUrl || post.mediaUrl;

          return (
            <div
              key={post.id}
              onClick={() => onOpenLightbox(post)}
              className="group flex flex-col bg-[#11131b] border border-white/[0.08] hover:border-white/20 rounded-xl overflow-hidden transition-all duration-200 cursor-pointer shadow-md hover:shadow-xl"
            >
              {/* Media Container (16:10 ratio) */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-950">
                <img
                  src={displayUrl}
                  alt={post.title}
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                    shouldBlur ? 'blur-2xl' : ''
                  }`}
                  loading="lazy"
                  onError={(e) => {
                    if (post.mediaUrl && e.currentTarget.src !== post.mediaUrl) {
                      e.currentTarget.src = post.mediaUrl;
                    }
                  }}
                />

                {/* Badges */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
                  {post.mediaType === 'video' && (
                    <div className="p-1 rounded bg-black/70 backdrop-blur-md text-white">
                      <Play className="w-3 h-3 fill-current" />
                    </div>
                  )}

                  {post.mediaType === 'gallery' && (
                    <div className="px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-white text-[10px] font-mono flex items-center gap-1">
                      <Layers className="w-3 h-3 text-[#FF8717]" />
                      <span>{post.galleryItems?.length || 1}</span>
                    </div>
                  )}

                  {post.over18 && (
                    <div className="px-1.5 py-0.5 rounded bg-rose-600/90 text-white text-[10px] font-bold">
                      NSFW
                    </div>
                  )}
                </div>

                {/* Bookmark Shortcut Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSave(post);
                  }}
                  className={`absolute bottom-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 backdrop-blur-md transition-colors opacity-0 group-hover:opacity-100 ${
                    isSaved ? 'text-amber-400 !opacity-100' : 'text-white hover:text-amber-400'
                  }`}
                  title={isSaved ? 'Remove from Saved' : 'Save post'}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Card Content */}
              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mb-1.5">
                    <span className="font-semibold text-zinc-300">r/{post.subreddit}</span>
                    <span aria-hidden="true" className="text-zinc-600">·</span>
                    <span className="text-zinc-500">{formatTimeAgo(post.createdAt)}</span>
                  </div>
                  <h3 className="text-xs font-medium text-zinc-100 line-clamp-2 leading-relaxed">
                    {post.title}
                  </h3>
                </div>

                <div className="pt-3 mt-2 border-t border-white/[0.04] flex items-center justify-between text-xs text-zinc-400">
                  <span className="flex items-center gap-1 font-mono tabular-nums text-zinc-300">
                    <ArrowBigUp className="w-3.5 h-3.5 text-[#FF8717]" />
                    {formatNumber(post.score)}
                  </span>
                  <span className="flex items-center gap-1 font-mono tabular-nums text-zinc-500">
                    <MessageSquare className="w-3 h-3" />
                    {formatNumber(post.numComments)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

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
