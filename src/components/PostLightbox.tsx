import React, { useState, useEffect, useRef } from 'react';
import { RedditPost, RedditComment } from '../types';
import { fetchComments, formatNumber, formatTimeAgo } from '../services/redditApi';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ArrowBigUp, 
  MessageSquare, 
  Bookmark, 
  ExternalLink, 
  Download, 
  Copy, 
  Check, 
  Layers, 
  Volume2, 
  VolumeX,
  Share2
} from 'lucide-react';

interface PostLightboxProps {
  post: RedditPost | null;
  onClose: () => void;
  onPrevPost?: () => void;
  onNextPost?: () => void;
  savedPostIds: Set<string>;
  onToggleSave: (post: RedditPost) => void;
  likedPostIds: Set<string>;
  onToggleLike: (post: RedditPost) => void;
  blurNsfw: boolean;
}

export const PostLightbox: React.FC<PostLightboxProps> = ({
  post,
  onClose,
  onPrevPost,
  onNextPost,
  savedPostIds,
  onToggleSave,
  likedPostIds,
  onToggleLike,
  blurNsfw,
}) => {
  const [comments, setComments] = useState<RedditComment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showCommentsSidebar, setShowCommentsSidebar] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Reset gallery and load comments when post changes
  useEffect(() => {
    setActiveGalleryIdx(0);
    if (!post) return;

    let isMounted = true;
    setIsLoadingComments(true);

    fetchComments(post.permalink)
      .then((data) => {
        if (isMounted) {
          setComments(data);
          setIsLoadingComments(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoadingComments(false);
      });

    return () => {
      isMounted = false;
    };
  }, [post?.id, post?.permalink]);

  // Keyboard navigation inside lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && onPrevPost) {
        onPrevPost();
      } else if (e.key === 'ArrowRight' && onNextPost) {
        onNextPost();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrevPost, onNextPost]);

  if (!post) return null;

  const isSaved = savedPostIds.has(post.id);
  const isLiked = likedPostIds.has(post.id);
  const displayScore = isLiked ? post.score + 1 : post.score;

  let currentMediaUrl = post.mediaUrl;
  let currentCaption = '';
  if (post.mediaType === 'gallery' && post.galleryItems?.length) {
    const item = post.galleryItems[activeGalleryIdx] || post.galleryItems[0];
    currentMediaUrl = item.url;
    currentCaption = item.caption || '';
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(post.redditUrl).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = currentMediaUrl;
    a.target = '_blank';
    a.download = `reddit_${post.subreddit}_${post.id}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md">
      {/* Top Bar Floating Controls */}
      <div className="absolute top-3 left-4 right-4 flex items-center justify-between text-white z-30 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="text-xs font-semibold px-2.5 py-1 bg-white/10 rounded-lg backdrop-blur-md text-zinc-200">
            r/{post.subreddit}
          </span>
          <span className="text-xs text-zinc-400 hidden sm:inline">
            by u/{post.author}
          </span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setShowCommentsSidebar(!showCommentsSidebar)}
            className={`p-2 rounded-lg bg-zinc-900/80 border border-white/10 text-xs flex items-center gap-1.5 transition-colors ${
              showCommentsSidebar ? 'text-[#FF8717]' : 'text-zinc-400 hover:text-white'
            }`}
            title="Toggle Comments Panel"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline font-mono tabular-nums">
              {formatNumber(post.numComments)}
            </span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Split Body: Media Stage (Left/Center) + Comments (Right) */}
      <div className="w-full h-full flex flex-col lg:flex-row items-stretch pt-14 pb-4 px-4 gap-4 overflow-hidden">
        {/* Media Viewport */}
        <div className="relative flex-1 flex flex-col items-center justify-center min-h-0 overflow-hidden bg-black/50 rounded-2xl border border-white/[0.06]">
          {/* Previous Post Nav Button */}
          {onPrevPost && (
            <button
              onClick={onPrevPost}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md z-20 transition-transform active:scale-95"
              title="Previous post (Left arrow)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Next Post Nav Button */}
          {onNextPost && (
            <button
              onClick={onNextPost}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md z-20 transition-transform active:scale-95"
              title="Next post (Right arrow)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Active Media Container */}
          <div className="w-full h-full flex items-center justify-center p-2 sm:p-6 select-none overflow-hidden">
            {post.mediaType === 'video' ? (
              <div className="relative max-w-full max-h-full flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={currentMediaUrl}
                  autoPlay
                  loop
                  muted={isMuted}
                  controls
                  playsInline
                  className="max-w-full max-h-[78vh] object-contain rounded-lg shadow-2xl"
                />
              </div>
            ) : (
              <div className="relative max-w-full max-h-full flex items-center justify-center">
                <img
                  src={currentMediaUrl}
                  alt={post.title}
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-[78vh] object-contain rounded-lg shadow-2xl transition-all"
                />
              </div>
            )}
          </div>

          {/* Gallery Thumbnails Strip */}
          {post.mediaType === 'gallery' && post.galleryItems && post.galleryItems.length > 1 && (
            <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-2 p-2 z-20">
              <div className="flex items-center gap-2 p-1.5 bg-black/80 backdrop-blur-md rounded-xl border border-white/10 overflow-x-auto max-w-[90%]">
                {post.galleryItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveGalleryIdx(idx)}
                    className={`relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                      idx === activeGalleryIdx
                        ? 'border-[#FF4500] scale-105'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={`Thumb ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Info & Live Comments Sidebar */}
        {showCommentsSidebar && (
          <aside className="w-full lg:w-96 flex flex-col bg-[#0e1017] border border-white/[0.08] rounded-2xl overflow-hidden shrink-0 max-h-[40vh] lg:max-h-full">
            {/* Post Header Details */}
            <div className="p-4 border-b border-white/[0.06] bg-[#12141e]">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                <a
                  href={`https://reddit.com/r/${post.subreddit}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-[#FF8717] hover:underline"
                >
                  r/{post.subreddit}
                </a>
                <span>{formatTimeAgo(post.createdAt)}</span>
              </div>

              <h2 className="text-sm font-semibold text-zinc-100 leading-snug mb-3">
                {post.title}
              </h2>

              {currentCaption && (
                <p className="text-xs text-zinc-300 italic mb-3 bg-white/[0.03] p-2 rounded-lg border border-white/[0.04]">
                  {currentCaption}
                </p>
              )}

              {/* Stats & Actions */}
              <div className="flex items-center justify-between text-xs text-zinc-300 pt-2 border-t border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onToggleLike(post)}
                    className={`flex items-center gap-1 font-mono tabular-nums transition-colors ${
                      isLiked ? 'text-[#FF4500] font-bold' : 'hover:text-[#FF4500]'
                    }`}
                    title="Upvote"
                  >
                    <ArrowBigUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    <span>{formatNumber(displayScore)}</span>
                  </button>

                  <span className="text-[11px] text-zinc-500 font-mono">
                    ({Math.round(post.upvoteRatio * 100)}% upvoted)
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onToggleSave(post)}
                    className={`p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors ${
                      isSaved ? 'text-amber-400' : 'text-zinc-400 hover:text-white'
                    }`}
                    title="Bookmark"
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    onClick={handleCopyLink}
                    className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors"
                    title="Copy Link"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={handleDownload}
                    className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors"
                    title="Open original image"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <a
                    href={post.redditUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-400 hover:text-[#FF8717] transition-colors"
                    title="Open thread on Reddit"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 pb-1">
                <span>Top Comments</span>
                <span className="font-mono tabular-nums text-zinc-500">
                  {comments.length} loaded
                </span>
              </div>

              {isLoadingComments ? (
                <div className="py-12 flex flex-col items-center justify-center text-zinc-500">
                  <div className="w-5 h-5 border-2 border-[#FF4500] border-t-transparent rounded-full animate-spin mb-2" />
                  <span className="text-xs">Fetching comments from Reddit...</span>
                </div>
              ) : comments.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500">
                  No comments available for this post.
                </div>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span className="font-medium text-zinc-300">u/{comment.author}</span>
                      <div className="flex items-center gap-1 font-mono tabular-nums text-zinc-500">
                        <ArrowBigUp className="w-3 h-3 text-[#FF4500]" />
                        <span>{formatNumber(comment.score)}</span>
                      </div>
                    </div>
                    <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap break-words">
                      {comment.body}
                    </p>
                  </div>
                ))
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
