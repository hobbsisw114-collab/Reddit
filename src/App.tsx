/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  RedditPost, 
  ViewMode, 
  SortOption, 
  TimeFrame, 
  MediaTypeFilter, 
  UserPreferences 
} from './types';
import { 
  fetchRedditPosts, 
  getSavedPosts, 
  savePost, 
  getLikedPosts, 
  toggleLikePost, 
  getRecentSubreddits, 
  addRecentSubreddit, 
  getStoredPreferences, 
  storePreferences 
} from './services/redditApi';
import { TopBar } from './components/TopBar';
import { SubredditBar } from './components/SubredditBar';
import { StreamView } from './components/StreamView';
import { MasonryView } from './components/MasonryView';
import { GridView } from './components/GridView';
import { CinemaView } from './components/CinemaView';
import { SavedPostsView } from './components/SavedPostsView';
import { PostLightbox } from './components/PostLightbox';
import { SubredditModal } from './components/SubredditModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { SettingsModal } from './components/SettingsModal';
import { Film, AlertCircle, Sparkles, Check } from 'lucide-react';

export default function App() {
  const [activeSubreddit, setActiveSubreddit] = useState<string>('EarthPorn');
  const [currentView, setCurrentView] = useState<ViewMode>('stream');
  const [sort, setSort] = useState<SortOption>('hot');
  const [timeframe, setTimeframe] = useState<TimeFrame>('week');
  const [mediaFilter, setMediaFilter] = useState<MediaTypeFilter>('all');
  
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [after, setAfter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Saved & Liked Posts
  const [savedPosts, setSavedPosts] = useState<RedditPost[]>(() => getSavedPosts());
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(() => new Set(getLikedPosts()));
  const [recentSubreddits, setRecentSubreddits] = useState<string[]>(() => getRecentSubreddits());
  const [preferences, setPreferences] = useState<UserPreferences>(() => getStoredPreferences());

  // Active indices & modals
  const [activePostIndex, setActivePostIndex] = useState<number>(0);
  const [lightboxPost, setLightboxPost] = useState<RedditPost | null>(null);
  const [isSubredditModalOpen, setIsSubredditModalOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Derived set of saved post IDs
  const savedPostIds = useMemo(() => new Set(savedPosts.map((p) => p.id)), [savedPosts]);

  // Toast notifier helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  }, []);

  // Fetch initial posts for subreddit + sort + timeframe
  const loadPosts = useCallback(async (subreddit: string, sortOpt: SortOption, tf: TimeFrame) => {
    setIsLoading(true);
    setStatusMessage(null);
    setActivePostIndex(0);

    const result = await fetchRedditPosts({
      subreddit,
      sort: sortOpt,
      timeframe: tf,
      limit: 30,
    });

    setPosts(result.posts);
    setAfter(result.after);
    setIsLoading(false);

    if (result.isFallback && result.message) {
      setStatusMessage(result.message);
    }
  }, []);

  // Reload when subreddit, sort, or timeframe changes
  useEffect(() => {
    loadPosts(activeSubreddit, sort, timeframe);
    addRecentSubreddit(activeSubreddit);
    setRecentSubreddits(getRecentSubreddits());
  }, [activeSubreddit, sort, timeframe, loadPosts]);

  // Load more posts for infinite scrolling
  const handleLoadMore = async () => {
    if (!after || isLoadingMore) return;
    setIsLoadingMore(true);

    const result = await fetchRedditPosts({
      subreddit: activeSubreddit,
      sort,
      timeframe,
      after,
      limit: 30,
    });

    if (result.posts.length > 0) {
      // Append unique posts
      setPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newPosts = result.posts.filter((p) => !existingIds.has(p.id));
        return [...prev, ...newPosts];
      });
      setAfter(result.after);
    } else {
      setAfter(null);
    }
    setIsLoadingMore(false);
  };

  // Filter posts by media type
  const displayedPosts = useMemo(() => {
    if (mediaFilter === 'all') return posts;
    if (mediaFilter === 'image') return posts.filter((p) => p.mediaType === 'image');
    if (mediaFilter === 'video') return posts.filter((p) => p.mediaType === 'video' || p.mediaType === 'gif');
    if (mediaFilter === 'gallery') return posts.filter((p) => p.mediaType === 'gallery');
    return posts;
  }, [posts, mediaFilter]);

  // Post Actions
  const handleToggleSave = useCallback((post: RedditPost) => {
    const isNowSaved = savePost(post);
    setSavedPosts(getSavedPosts());
    showToast(isNowSaved ? 'Saved to collection' : 'Removed from saved');
  }, [showToast]);

  const handleToggleLike = useCallback((post: RedditPost) => {
    toggleLikePost(post.id);
    setLikedPostIds(new Set(getLikedPosts()));
  }, []);

  const handleShare = useCallback((post: RedditPost) => {
    navigator.clipboard.writeText(post.redditUrl).then(() => {
      showToast('Reddit thread link copied to clipboard');
    });
  }, [showToast]);

  const handleClearAllSaved = useCallback(() => {
    localStorage.removeItem('aetherscroll_saved_posts');
    setSavedPosts([]);
    showToast('Saved collection cleared');
  }, [showToast]);

  const handleUpdatePreferences = useCallback((newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
    storePreferences(newPrefs);
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === '?') {
        setIsShortcutsOpen((o) => !o);
      } else if (e.key === 'm' && !lightboxPost) {
        setPreferences((p) => {
          const updated = { ...p, muteVideos: !p.muteVideos };
          storePreferences(updated);
          return updated;
        });
      } else if (e.key === 'f' && !lightboxPost && displayedPosts[activePostIndex]) {
        setLightboxPost(displayedPosts[activePostIndex]);
      } else if ((e.key === 's' || e.key === 'l') && !lightboxPost && displayedPosts[activePostIndex]) {
        handleToggleSave(displayedPosts[activePostIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxPost, displayedPosts, activePostIndex, handleToggleSave]);

  // Lightbox Next / Previous handlers
  const handleLightboxNext = useCallback(() => {
    if (!lightboxPost) return;
    const currentIdx = displayedPosts.findIndex((p) => p.id === lightboxPost.id);
    if (currentIdx >= 0 && currentIdx < displayedPosts.length - 1) {
      setLightboxPost(displayedPosts[currentIdx + 1]);
    }
  }, [lightboxPost, displayedPosts]);

  const handleLightboxPrev = useCallback(() => {
    if (!lightboxPost) return;
    const currentIdx = displayedPosts.findIndex((p) => p.id === lightboxPost.id);
    if (currentIdx > 0) {
      setLightboxPost(displayedPosts[currentIdx - 1]);
    }
  }, [lightboxPost, displayedPosts]);

  return (
    <div className="min-h-screen bg-[#090a10] text-zinc-100 flex flex-col font-sans selection:bg-[#FF4500] selection:text-white">
      {/* Top Navigation Bar adhering to Top Bar Contract */}
      <TopBar
        currentView={currentView}
        onSelectView={setCurrentView}
        savedCount={savedPosts.length}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSubredditSearch={() => setIsSubredditModalOpen(true)}
        activeSubreddit={activeSubreddit}
      />

      {/* Secondary Subreddit Strip (hidden in cinema mode for pure zen immersion) */}
      {currentView !== 'cinema' && currentView !== 'saved' && (
        <SubredditBar
          activeSubreddit={activeSubreddit}
          onSelectSubreddit={setActiveSubreddit}
          sort={sort}
          onSelectSort={setSort}
          timeframe={timeframe}
          onSelectTimeframe={setTimeframe}
          mediaFilter={mediaFilter}
          onSelectMediaFilter={setMediaFilter}
          blurNsfw={preferences.blurNsfw}
          onToggleBlurNsfw={() =>
            handleUpdatePreferences({ ...preferences, blurNsfw: !preferences.blurNsfw })
          }
          onRefresh={() => loadPosts(activeSubreddit, sort, timeframe)}
          isLoading={isLoading}
          onOpenSubredditModal={() => setIsSubredditModalOpen(true)}
        />
      )}

      {/* Info Status Banner if fallback is active */}
      {statusMessage && currentView !== 'cinema' && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-300 flex items-center justify-between">
          <div className="max-w-5xl mx-auto w-full flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{statusMessage}</span>
          </div>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 flex flex-col">
        {isLoading && currentView !== 'saved' ? (
          <div className="flex-1 flex flex-col items-center justify-center py-32 text-zinc-400">
            <div className="w-8 h-8 border-2 border-[#FF4500] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-medium text-zinc-300">
              Loading media from r/{activeSubreddit}...
            </p>
          </div>
        ) : (
          <>
            {currentView === 'stream' && (
              <StreamView
                posts={displayedPosts}
                blurNsfw={preferences.blurNsfw}
                isMuted={preferences.muteVideos}
                onToggleMute={() =>
                  handleUpdatePreferences({ ...preferences, muteVideos: !preferences.muteVideos })
                }
                onOpenLightbox={setLightboxPost}
                savedPostIds={savedPostIds}
                onToggleSave={handleToggleSave}
                likedPostIds={likedPostIds}
                onToggleLike={handleToggleLike}
                onOpenComments={setLightboxPost}
                onLoadMore={handleLoadMore}
                hasMore={Boolean(after)}
                isLoadingMore={isLoadingMore}
                onShare={handleShare}
                activePostIndex={activePostIndex}
                setActivePostIndex={setActivePostIndex}
              />
            )}

            {currentView === 'masonry' && (
              <MasonryView
                posts={displayedPosts}
                blurNsfw={preferences.blurNsfw}
                onOpenLightbox={setLightboxPost}
                savedPostIds={savedPostIds}
                onToggleSave={handleToggleSave}
                onLoadMore={handleLoadMore}
                hasMore={Boolean(after)}
                isLoadingMore={isLoadingMore}
              />
            )}

            {currentView === 'grid' && (
              <GridView
                posts={displayedPosts}
                blurNsfw={preferences.blurNsfw}
                onOpenLightbox={setLightboxPost}
                savedPostIds={savedPostIds}
                onToggleSave={handleToggleSave}
                onLoadMore={handleLoadMore}
                hasMore={Boolean(after)}
                isLoadingMore={isLoadingMore}
              />
            )}

            {currentView === 'cinema' && (
              <CinemaView
                posts={displayedPosts}
                blurNsfw={preferences.blurNsfw}
                savedPostIds={savedPostIds}
                onToggleSave={handleToggleSave}
                speedSeconds={preferences.slideshowSpeed}
                onSetSpeed={(speed) =>
                  handleUpdatePreferences({ ...preferences, slideshowSpeed: speed })
                }
                onOpenLightbox={setLightboxPost}
              />
            )}

            {currentView === 'saved' && (
              <SavedPostsView
                posts={savedPosts}
                onOpenLightbox={setLightboxPost}
                onRemoveSaved={handleToggleSave}
                onClearAll={handleClearAllSaved}
              />
            )}
          </>
        )}
      </main>

      {/* Lightbox / Post Inspector Modal */}
      {lightboxPost && (
        <PostLightbox
          post={lightboxPost}
          onClose={() => setLightboxPost(null)}
          onPrevPost={handleLightboxPrev}
          onNextPost={handleLightboxNext}
          savedPostIds={savedPostIds}
          onToggleSave={handleToggleSave}
          likedPostIds={likedPostIds}
          onToggleLike={handleToggleLike}
          blurNsfw={preferences.blurNsfw}
        />
      )}

      {/* Subreddit Switcher & Category Modal */}
      <SubredditModal
        isOpen={isSubredditModalOpen}
        onClose={() => setIsSubredditModalOpen(false)}
        activeSubreddit={activeSubreddit}
        onSelectSubreddit={(sub) => {
          setActiveSubreddit(sub);
          if (currentView === 'saved') setCurrentView('stream');
        }}
        recentSubreddits={recentSubreddits}
      />

      {/* Keyboard Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        preferences={preferences}
        onUpdatePreferences={handleUpdatePreferences}
      />

      {/* Transient Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-white/15 text-xs text-zinc-100 rounded-xl shadow-2xl animate-fade-in backdrop-blur-md">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
