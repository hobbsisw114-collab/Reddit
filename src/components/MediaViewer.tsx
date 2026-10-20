import React, { useState, useRef, useEffect } from 'react';
import { RedditPost } from '../types';
import { 
  Volume2, 
  VolumeX, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Maximize2, 
  Layers, 
  Image as ImageIcon,
  AlertCircle,
  Eye
} from 'lucide-react';

interface MediaViewerProps {
  post: RedditPost;
  blurNsfw: boolean;
  isAutoplay?: boolean;
  isMuted?: boolean;
  onToggleMute?: () => void;
  onOpenLightbox?: (post: RedditPost) => void;
  className?: string;
  maxHeight?: string;
  containMode?: 'contain' | 'cover';
}

export const MediaViewer: React.FC<MediaViewerProps> = ({
  post,
  blurNsfw,
  isAutoplay = true,
  isMuted = true,
  onToggleMute,
  onOpenLightbox,
  className = '',
  maxHeight = 'max-h-[75vh]',
  containMode = 'contain',
}) => {
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(isAutoplay);
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const shouldBlur = post.over18 && blurNsfw && !isRevealed;

  // Sync video muted state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = !!isMuted;
    }
  }, [isMuted]);

  // Handle play/pause
  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleNextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.galleryItems && post.galleryItems.length > 0) {
      setActiveGalleryIndex((prev) => (prev + 1) % post.galleryItems.length);
    }
  };

  const handlePrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.galleryItems && post.galleryItems.length > 0) {
      setActiveGalleryIndex((prev) => (prev - 1 + post.galleryItems.length) % post.galleryItems.length);
    }
  };

  // Determine current media URL
  let currentUrl = post.mediaUrl;
  let currentCaption = '';
  if (post.mediaType === 'gallery' && post.galleryItems && post.galleryItems.length > 0) {
    const currentItem = post.galleryItems[activeGalleryIndex] || post.galleryItems[0];
    currentUrl = currentItem.url;
    currentCaption = currentItem.caption || '';
  }

  return (
    <div 
      className={`relative w-full bg-zinc-950/80 rounded-xl overflow-hidden flex items-center justify-center select-none group border border-white/[0.05] ${maxHeight} ${className}`}
      onClick={() => onOpenLightbox && onOpenLightbox(post)}
    >
      {/* Blurred NSFW Overlay */}
      {shouldBlur && (
        <div className="absolute inset-0 z-20 backdrop-blur-3xl bg-zinc-950/80 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-3">
            <Eye className="w-6 h-6 text-rose-400" />
          </div>
          <span className="text-sm font-semibold text-zinc-100 mb-1">
            Sensitive Content (NSFW)
          </span>
          <p className="text-xs text-zinc-400 max-w-sm mb-4">
            This media was flagged as adult or sensitive on Reddit.
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsRevealed(true);
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors shadow-md"
          >
            Click to View
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {!isMediaLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 animate-pulse z-0">
          <ImageIcon className="w-8 h-8 text-zinc-700 animate-pulse" />
        </div>
      )}

      {/* Error Fallback */}
      {hasError && (
        <div className="w-full py-20 flex flex-col items-center justify-center text-zinc-500 p-6 text-center">
          <AlertCircle className="w-8 h-8 text-zinc-600 mb-2" />
          <span className="text-xs font-medium text-zinc-400">Media could not be loaded</span>
          <a
            href={post.redditUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-2 text-xs text-[#FF8717] hover:underline"
          >
            View original thread on Reddit
          </a>
        </div>
      )}

      {/* Media Rendering */}
      {!hasError && (
        <>
          {post.mediaType === 'video' ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                src={currentUrl}
                poster={post.thumbnailUrl}
                autoPlay={isAutoplay}
                loop
                muted={isMuted}
                playsInline
                onLoadedData={() => setIsMediaLoaded(true)}
                onError={() => setHasError(true)}
                className={`w-full max-h-[75vh] ${
                  containMode === 'contain' ? 'object-contain' : 'object-cover'
                } ${shouldBlur ? 'blur-2xl' : ''}`}
              />

              {/* Video Controls Bar */}
              <div 
                className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlay}
                    className="p-1 hover:text-[#FF8717] transition-colors"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  {onToggleMute && (
                    <button
                      onClick={onToggleMute}
                      className="p-1 hover:text-[#FF8717] transition-colors"
                      title={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-zinc-400" /> : <Volume2 className="w-4 h-4 text-[#FF8717]" />}
                    </button>
                  )}
                  <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider ml-1">
                    {post.videoSources?.isGif ? 'GIFV' : 'VIDEO'}
                  </span>
                </div>

                {onOpenLightbox && (
                  <button
                    onClick={() => onOpenLightbox(post)}
                    className="p-1 text-zinc-400 hover:text-white transition-colors"
                    title="Fullscreen"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={currentUrl}
                alt={post.title}
                referrerPolicy="no-referrer"
                onLoad={() => setIsMediaLoaded(true)}
                onError={() => {
                  // If high-res failed and thumb exists, fallback
                  if (post.thumbnailUrl && currentUrl !== post.thumbnailUrl) {
                    currentUrl = post.thumbnailUrl;
                  } else {
                    setHasError(true);
                  }
                }}
                className={`w-full max-h-[75vh] ${
                  containMode === 'contain' ? 'object-contain' : 'object-cover'
                } transition-opacity duration-300 ${
                  isMediaLoaded ? 'opacity-100' : 'opacity-0'
                } ${shouldBlur ? 'blur-2xl' : ''}`}
                loading="lazy"
              />

              {/* Gallery Controls */}
              {post.mediaType === 'gallery' && post.galleryItems && post.galleryItems.length > 1 && (
                <>
                  {/* Left / Right Carousel Buttons */}
                  <button
                    onClick={handlePrevSlide}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm opacity-80 hover:opacity-100 transition-all z-10"
                    title="Previous photo"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextSlide}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm opacity-80 hover:opacity-100 transition-all z-10"
                    title="Next photo"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Slide Counter Overlay */}
                  <div className="absolute top-3 right-3 px-2 py-1 bg-black/70 backdrop-blur-md rounded-md text-[11px] font-mono text-white flex items-center gap-1.5 z-10">
                    <Layers className="w-3 h-3 text-[#FF8717]" />
                    <span>
                      {activeGalleryIndex + 1} / {post.galleryItems.length}
                    </span>
                  </div>

                  {/* Caption if provided */}
                  {currentCaption && (
                    <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white text-xs z-10 pointer-events-none">
                      <p className="line-clamp-2">{currentCaption}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
