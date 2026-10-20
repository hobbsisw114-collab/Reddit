export type MediaType = 'image' | 'video' | 'gallery' | 'gif';

export interface GalleryItem {
  url: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface VideoSources {
  mp4?: string;
  hls?: string;
  isGif?: boolean;
}

export interface RedditPost {
  id: string;
  title: string;
  author: string;
  subreddit: string;
  score: number;
  upvoteRatio: number;
  numComments: number;
  createdAt: number;
  permalink: string;
  redditUrl: string;
  over18: boolean;
  mediaType: MediaType;
  mediaUrl: string;
  thumbnailUrl: string;
  aspectRatio: number;
  width: number;
  height: number;
  galleryItems: GalleryItem[];
  videoSources?: VideoSources;
}

export interface RedditComment {
  id: string;
  author: string;
  body: string;
  score: number;
  createdAt: number;
  repliesCount: number;
}

export type ViewMode = 'stream' | 'masonry' | 'grid' | 'cinema' | 'saved';

export type SortOption = 'hot' | 'top' | 'new' | 'rising';

export type TimeFrame = 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';

export type MediaTypeFilter = 'all' | 'image' | 'video' | 'gallery';

export interface UserPreferences {
  blurNsfw: boolean;
  autoplayVideos: boolean;
  muteVideos: boolean;
  slideshowSpeed: number; // in seconds
  ambientGlow: boolean;
}
