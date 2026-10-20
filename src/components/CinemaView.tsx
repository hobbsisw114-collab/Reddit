import React, { useState, useEffect, useRef } from 'react';
import { RedditPost } from '../types';
import { formatNumber } from '../services/redditApi';
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Bookmark, 
  Info, 
  Layers, 
  Sparkles,
  ArrowBigUp,
  Clock
} from 'lucide-react';

interface CinemaViewProps {
  posts: RedditPost[];
  blurNsfw: boolean;
  savedPostIds: Set<string>;
  onToggleSave: (post: RedditPost) => void;
  speedSeconds: number;
  onSetSpeed: (sec: number) => void;
  onOpenLightbox: (post: RedditPost) => void;
}

export const CinemaView: React.FC<CinemaViewProps> = ({
  posts,
  blurNsfw,
  savedPostIds,
  onToggleSave,
  speedSeconds,
  onSetSpeed,
  onOpenLightbox,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showInfo, setShowInfo] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [gallerySubIndex, setGallerySubIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const currentPost = posts[currentIndex];
  const isSaved = currentPost ? savedPostIds.has(currentPost.id) : false;

  // Auto-advance slideshow timer
  useEffect(() => {
    if (!isPlaying || posts.length === 0) {
      setProgress(0);
      return;
    }

    const intervalMs = 100;
    const totalMs = speedSeconds * 1000;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += intervalMs;
      const pct = Math.min((elapsed / totalMs) * 100, 100);
      setProgress(pct);

      if (elapsed >= totalMs) {
        elapsed = 0;
        setProgress(0);
        setCurrentIndex((prev) => (prev + 1) % posts.length);
        setGallerySubIndex(0);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, speedSeconds, posts.length, currentIndex]);

  // Keyboard navigation for Cinema mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        setCurrentIndex((prev) => (prev + 1) % posts.length);
        setGallerySubIndex(0);
        setProgress(0);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length);
        setGallerySubIndex(0);
        setProgress(0);
      } else if (e.key === 'p') {
        setIsPlaying((p) => !p);
      } else if (e.key === 'm') {
        setIsMuted((m) => !m);
      } else if (e.key === 'i') {
        setShowInfo((s) => !s);
      } else if (e.key === 'f') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [posts.length]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  if (!currentPost) {
    return (
      <div className="py-24 text-center">
        <Sparkles className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-zinc-300">No media available for cinema</h3>
      </div>
    );
  }

  // Derive media url
  let activeUrl = currentPost.mediaUrl;
  if (currentPost.mediaType === 'gallery' && currentPost.galleryItems?.length) {
    activeUrl = currentPost.galleryItems[gallerySubIndex]?.url || currentPost.mediaUrl;
  }

  const shouldBlur = currentPost.over18 && blurNsfw;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[calc(100vh-3.5rem)] bg-[#050505] flex items-center justify-center overflow-hidden select-none group"
    >
      {/* Subtle Ambient Backlight Glow */}
      <div 
        className="absolute inset-0 opacity-20 filter blur-3xl scale-125 pointer-events-none transition-all duration-700"
        style={{
          backgroundImage: `url(${currentPost.thumbnailUrl || activeUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Media Centerpiece */}
      <div className="relative z-10 max-w-6xl max-h-[85vh] w-full flex items-center justify-center p-4">
        {currentPost.mediaType === 'video' ? (
          <video
            ref={videoRef}
            src={activeUrl}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            className={`max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl ${
              shouldBlur ? 'blur-2xl' : ''
            }`}
          />
        ) : (
          <img
            src={activeUrl}
            alt={currentPost.title}
            referrerPolicy="no-referrer"
            className={`max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl transition-opacity duration-300 ${
              shouldBlur ? 'blur-2xl' : ''
            }`}
          />
        )}
      </div>

      {/* Left/Right manual slide navigation buttons */}
      <button
        onClick={() => {
          setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length);
          setGallerySubIndex(0);
          setProgress(0);
        }}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity z-20"
        title="Previous (Left Arrow)"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={() => {
          setCurrentIndex((prev) => (prev + 1) % posts.length);
          setGallerySubIndex(0);
          setProgress(0);
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity z-20"
        title="Next (Right Arrow / Space)"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Top Floating Bar: Gallery sub-indexer & Quick Actions */}
      <div className="absolute top-4 inset-x-6 flex items-center justify-between text-white z-20 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2">
          {currentPost.mediaType === 'gallery' && currentPost.galleryItems?.length > 1 && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-xs font-mono">
              <Layers className="w-3.5 h-3.5 text-[#FF8717]" />
              <span>
                Slide {gallerySubIndex + 1} of {currentPost.galleryItems.length}
              </span>
              <div className="flex gap-1 ml-2">
                {currentPost.galleryItems.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setGallerySubIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === gallerySubIndex ? 'bg-[#FF8717] w-3' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleSave(currentPost)}
            className={`p-2 rounded-lg bg-black/60 backdrop-blur-md transition-colors ${
              isSaved ? 'text-amber-400' : 'text-zinc-300 hover:text-white'
            }`}
            title="Save post"
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`p-2 rounded-lg bg-black/60 backdrop-blur-md transition-colors ${
              showInfo ? 'text-[#FF8717]' : 'text-zinc-300 hover:text-white'
            }`}
            title="Toggle post title & stats (I)"
          >
            <Info className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-black/60 backdrop-blur-md text-zinc-300 hover:text-white transition-colors"
            title="Toggle fullscreen (F)"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Bottom Floating Scrim & Controls */}
      <div className="absolute bottom-0 inset-x-0 z-20 bg-gradient-to-t from-black via-black/80 to-transparent pt-12 pb-4 px-6 flex flex-col gap-3">
        {/* Progress Bar for Auto-Advance */}
        {isPlaying && (
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FF4500] transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Info Text (Title, Subreddit, Score) */}
        {showInfo && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
                <span className="font-semibold text-[#FF8717]">r/{currentPost.subreddit}</span>
                <span>·</span>
                <span>u/{currentPost.author}</span>
                <span>·</span>
                <span className="font-mono tabular-nums flex items-center gap-1 text-zinc-300">
                  <ArrowBigUp className="w-3.5 h-3.5 text-[#FF4500]" />
                  {formatNumber(currentPost.score)}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-medium text-white truncate max-w-2xl">
                {currentPost.title}
              </h2>
            </div>

            {/* Slideshow Control Panel */}
            <div className="flex items-center gap-3">
              {/* Play / Pause */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              {/* Speed Selectors */}
              <div className="flex items-center gap-1 p-0.5 bg-black/60 rounded-lg border border-white/10 text-xs">
                {[3, 5, 8, 12].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => onSetSpeed(sec)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                      speedSeconds === sec
                        ? 'bg-[#FF4500] text-white font-semibold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>

              {/* Video Audio Mute Toggle */}
              {currentPost.mediaType === 'video' && (
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#FF8717]" />}
                </button>
              )}

              {/* Slide Counter */}
              <div className="text-xs font-mono text-zinc-400 pl-2">
                {currentIndex + 1} / {posts.length}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
