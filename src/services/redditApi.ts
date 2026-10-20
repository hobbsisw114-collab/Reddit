import { RedditPost, RedditComment, SortOption, TimeFrame, UserPreferences } from '../types';

export const POPULAR_SUBREDDITS = [
  { name: 'EarthPorn', category: 'Photography', label: 'Landscapes' },
  { name: 'spaceporn', category: 'Photography', label: 'Cosmos' },
  { name: 'Art', category: 'Art & Design', label: 'Visual Art' },
  { name: 'ArchitecturePorn', category: 'Photography', label: 'Architecture' },
  { name: 'streetphotography', category: 'Photography', label: 'Street' },
  { name: 'battlestations', category: 'Art & Design', label: 'Desks & Tech' },
  { name: 'cozyplaces', category: 'Art & Design', label: 'Cozy Interiors' },
  { name: 'aww', category: 'Nature', label: 'Animals' },
  { name: 'NatureIsFuckingLit', category: 'Nature', label: 'Wild Nature' },
  { name: 'mildlyinteresting', category: 'Discovery', label: 'Curiosities' },
  { name: 'gifs', category: 'Motion', label: 'Short Clips' },
  { name: 'Cinemagraphs', category: 'Motion', label: 'Cinemagraphs' },
];

export const DEFAULT_PREFERENCES: UserPreferences = {
  blurNsfw: true,
  autoplayVideos: true,
  muteVideos: true,
  slideshowSpeed: 5,
  ambientGlow: true,
};

export async function fetchRedditPosts(params: {
  subreddit: string;
  sort: SortOption;
  timeframe?: TimeFrame;
  after?: string | null;
  q?: string;
  limit?: number;
}): Promise<{ posts: RedditPost[]; after: string | null; isFallback?: boolean; message?: string }> {
  const queryParams = new URLSearchParams();
  queryParams.set('subreddit', params.subreddit.replace(/^r\//, '').trim());
  queryParams.set('sort', params.sort);
  if (params.timeframe) queryParams.set('timeframe', params.timeframe);
  if (params.after) queryParams.set('after', params.after);
  if (params.q) queryParams.set('q', params.q);
  if (params.limit) queryParams.set('limit', String(params.limit));

  try {
    const res = await fetch(`/api/reddit?${queryParams.toString()}`);
    if (res.ok) {
      const data = await res.json();
      return {
        posts: data.posts || [],
        after: data.after || null,
        isFallback: !!data.isFallback,
        message: data.message,
      };
    }
  } catch (err) {
    console.warn('Backend proxy fetch failed, attempting client fallback or cached data', err);
  }

  // Direct client fallback to Reddit public JSON if server proxy failed
  try {
    const cleanSub = params.subreddit.replace(/^r\//, '').trim();
    const directUrl = params.q
      ? `https://www.reddit.com/r/${encodeURIComponent(cleanSub)}/search.json?q=${encodeURIComponent(params.q)}&restrict_sr=1&sort=${params.sort}&limit=${params.limit || 25}&after=${params.after || ''}`
      : `https://www.reddit.com/r/${encodeURIComponent(cleanSub)}/${params.sort}.json?limit=${params.limit || 25}&after=${params.after || ''}`;

    const directRes = await fetch(directUrl);
    if (directRes.ok) {
      const data = await directRes.json();
      const children = data?.data?.children || [];
      const posts: RedditPost[] = [];

      for (const c of children) {
        const d = c.data;
        if (!d) continue;
        const url = d.url || '';
        let mediaUrl = '';
        let mediaType: RedditPost['mediaType'] = 'image';

        if (d.is_video && d.media?.reddit_video?.fallback_url) {
          mediaType = 'video';
          mediaUrl = d.media.reddit_video.fallback_url;
        } else if (/\.(jpg|jpeg|png|webp|gif)$/i.test(url)) {
          mediaType = url.toLowerCase().endsWith('.gif') ? 'gif' : 'image';
          mediaUrl = url;
        } else if (d.preview?.images?.[0]?.source?.url) {
          mediaType = 'image';
          mediaUrl = d.preview.images[0].source.url.replace(/&amp;/g, '&');
        }

        if (mediaUrl) {
          posts.push({
            id: d.id,
            title: d.title,
            author: d.author,
            subreddit: d.subreddit,
            score: d.score,
            upvoteRatio: d.upvote_ratio || 0.95,
            numComments: d.num_comments,
            createdAt: d.created_utc,
            permalink: d.permalink,
            redditUrl: `https://reddit.com${d.permalink}`,
            over18: !!d.over_18,
            mediaType,
            mediaUrl,
            thumbnailUrl: d.thumbnail && d.thumbnail.startsWith('http') ? d.thumbnail : mediaUrl,
            aspectRatio: 1.33,
            width: 1200,
            height: 800,
            galleryItems: [],
          });
        }
      }

      return {
        posts,
        after: data?.data?.after || null,
        isFallback: false,
      };
    }
  } catch (directErr) {
    console.error('Direct Reddit fetch failed:', directErr);
  }

  return { posts: [], after: null, isFallback: true, message: 'Could not fetch posts' };
}

export async function fetchComments(permalink: string): Promise<RedditComment[]> {
  try {
    const res = await fetch(`/api/reddit/comments?permalink=${encodeURIComponent(permalink)}`);
    if (res.ok) {
      const data = await res.json();
      return data.comments || [];
    }
  } catch (err) {
    console.error('Failed to fetch comments via proxy', err);
  }

  // Fallback direct
  try {
    const res = await fetch(`https://www.reddit.com${permalink}.json?limit=15`);
    if (res.ok) {
      const json = await res.json();
      const raw = json?.[1]?.data?.children || [];
      return raw
        .filter((c: any) => c.kind === 't1' && c.data?.body)
        .map((c: any) => ({
          id: c.data.id,
          author: c.data.author,
          body: c.data.body,
          score: c.data.score,
          createdAt: c.data.created_utc,
          repliesCount: c.data.replies?.data?.children?.length || 0,
        }));
    }
  } catch (directErr) {
    console.error('Direct comments fetch failed', directErr);
  }

  return [];
}

// LocalStorage helpers
const SAVED_POSTS_KEY = 'aetherscroll_saved_posts';
const LIKED_POSTS_KEY = 'aetherscroll_liked_posts';
const RECENT_SUBS_KEY = 'aetherscroll_recent_subs';
const PREFS_KEY = 'aetherscroll_preferences';

export function getSavedPosts(): RedditPost[] {
  try {
    const raw = localStorage.getItem(SAVED_POSTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePost(post: RedditPost): boolean {
  try {
    const existing = getSavedPosts();
    const index = existing.findIndex((p) => p.id === post.id);
    let updated: RedditPost[];
    let isSaved = false;
    if (index >= 0) {
      updated = existing.filter((p) => p.id !== post.id);
      isSaved = false;
    } else {
      updated = [post, ...existing];
      isSaved = true;
    }
    localStorage.setItem(SAVED_POSTS_KEY, JSON.stringify(updated));
    return isSaved;
  } catch {
    return false;
  }
}

export function isPostSaved(postId: string): boolean {
  const existing = getSavedPosts();
  return existing.some((p) => p.id === postId);
}

export function getLikedPosts(): string[] {
  try {
    const raw = localStorage.getItem(LIKED_POSTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleLikePost(postId: string): boolean {
  try {
    const liked = getLikedPosts();
    let updated: string[];
    let isLiked = false;
    if (liked.includes(postId)) {
      updated = liked.filter((id) => id !== postId);
      isLiked = false;
    } else {
      updated = [...liked, postId];
      isLiked = true;
    }
    localStorage.setItem(LIKED_POSTS_KEY, JSON.stringify(updated));
    return isLiked;
  } catch {
    return false;
  }
}

export function getRecentSubreddits(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SUBS_KEY);
    return raw ? JSON.parse(raw) : ['EarthPorn', 'spaceporn', 'battlestations', 'aww'];
  } catch {
    return ['EarthPorn', 'spaceporn', 'battlestations', 'aww'];
  }
}

export function addRecentSubreddit(sub: string) {
  try {
    const clean = sub.replace(/^r\//, '').trim();
    if (!clean) return;
    const current = getRecentSubreddits().filter((s) => s.toLowerCase() !== clean.toLowerCase());
    const updated = [clean, ...current].slice(0, 10);
    localStorage.setItem(RECENT_SUBS_KEY, JSON.stringify(updated));
  } catch {}
}

export function getStoredPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) } : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function storePreferences(prefs: UserPreferences) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {}
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

export function formatTimeAgo(timestampSeconds: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = Math.max(1, now - timestampSeconds);
  if (diff < 60) return `${diff}s`;
  const minutes = Math.floor(diff / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}
