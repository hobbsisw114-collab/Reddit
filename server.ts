import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory cache for Reddit requests (TTL: 60s)
interface CacheEntry {
  data: any;
  timestamp: number;
}
const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 1000;

// Curated high-aesthetic fallback posts in case Reddit is unreachable or rate-limited
const FALLBACK_POSTS = [
  {
    id: "fb_1",
    title: "Sunrise breaking through the misty redwoods of Del Norte Coast",
    author: "wild_wanderer",
    subreddit: "EarthPorn",
    score: 18450,
    upvoteRatio: 0.98,
    numComments: 412,
    createdAt: Math.floor(Date.now() / 1000) - 7200,
    permalink: "/r/EarthPorn/comments/sunrise_redwoods",
    redditUrl: "https://reddit.com/r/EarthPorn",
    over18: false,
    mediaType: "image" as const,
    mediaUrl: "https://images.unsplash.com/photo-1511497584788-87676104235f?q=80&w=1600&auto=format&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1511497584788-87676104235f?q=80&w=400&auto=format&fit=crop",
    aspectRatio: 1.5,
    width: 1600,
    height: 1067,
    galleryItems: [],
  },
  {
    id: "fb_2",
    title: "The Pillars of Creation captured in near-infrared by deep space observatory",
    author: "astro_phile",
    subreddit: "spaceporn",
    score: 29810,
    upvoteRatio: 0.99,
    numComments: 890,
    createdAt: Math.floor(Date.now() / 1000) - 14400,
    permalink: "/r/spaceporn/comments/pillars_of_creation",
    redditUrl: "https://reddit.com/r/spaceporn",
    over18: false,
    mediaType: "image" as const,
    mediaUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400&auto=format&fit=crop",
    aspectRatio: 1.6,
    width: 1600,
    height: 1000,
    galleryItems: [],
  },
  {
    id: "fb_3",
    title: "Architectural minimalism in Copenhagen: Glass curves meeting Nordic slate",
    author: "nordic_forms",
    subreddit: "ArchitecturePorn",
    score: 11200,
    upvoteRatio: 0.96,
    numComments: 280,
    createdAt: Math.floor(Date.now() / 1000) - 21600,
    permalink: "/r/ArchitecturePorn/comments/copenhagen_curves",
    redditUrl: "https://reddit.com/r/ArchitecturePorn",
    over18: false,
    mediaType: "gallery" as const,
    mediaUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1600&auto=format&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=400&auto=format&fit=crop",
    aspectRatio: 1.33,
    width: 1600,
    height: 1200,
    galleryItems: [
      {
        url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1600&auto=format&fit=crop",
        caption: "Facade curve facing the waterfront canal",
        width: 1600,
        height: 1200
      },
      {
        url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600&auto=format&fit=crop",
        caption: "Vertical atrium looking up toward the skylight canopy",
        width: 1600,
        height: 1066
      },
      {
        url: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600&auto=format&fit=crop",
        caption: "Minimalist concrete corridors and acoustic wood paneling",
        width: 1600,
        height: 1067
      }
    ],
  },
  {
    id: "fb_4",
    title: "Rainy neon reflection in Shinjuku back-alley after an autumn shower",
    author: "cyber_walker",
    subreddit: "streetphotography",
    score: 16340,
    upvoteRatio: 0.97,
    numComments: 345,
    createdAt: Math.floor(Date.now() / 1000) - 28800,
    permalink: "/r/streetphotography/comments/shinjuku_reflections",
    redditUrl: "https://reddit.com/r/streetphotography",
    over18: false,
    mediaType: "image" as const,
    mediaUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1600&auto=format&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=400&auto=format&fit=crop",
    aspectRatio: 0.67,
    width: 1067,
    height: 1600,
    galleryItems: [],
  },
  {
    id: "fb_5",
    title: "Smooth fluid water cycle visualization in mountain pass (Cinemagraph)",
    author: "fluid_motion",
    subreddit: "gifs",
    score: 22100,
    upvoteRatio: 0.95,
    numComments: 512,
    createdAt: Math.floor(Date.now() / 1000) - 36000,
    permalink: "/r/gifs/comments/mountain_stream_cinemagraph",
    redditUrl: "https://reddit.com/r/gifs",
    over18: false,
    mediaType: "video" as const,
    mediaUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?q=80&w=400&auto=format&fit=crop",
    aspectRatio: 1.77,
    width: 1280,
    height: 720,
    galleryItems: [],
    videoSources: {
      mp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      isGif: true,
    }
  },
  {
    id: "fb_6",
    title: "My custom walnut & matte brass mechanical keyboard workstation build",
    author: "keeb_crafter",
    subreddit: "battlestations",
    score: 14780,
    upvoteRatio: 0.98,
    numComments: 430,
    createdAt: Math.floor(Date.now() / 1000) - 43200,
    permalink: "/r/battlestations/comments/walnut_brass_workspace",
    redditUrl: "https://reddit.com/r/battlestations",
    over18: false,
    mediaType: "image" as const,
    mediaUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1600&auto=format&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=400&auto=format&fit=crop",
    aspectRatio: 1.5,
    width: 1600,
    height: 1067,
    galleryItems: [],
  },
  {
    id: "fb_7",
    title: "Golden retriever pup experiencing fresh mountain snow for the first time",
    author: "alpine_tails",
    subreddit: "aww",
    score: 41200,
    upvoteRatio: 0.99,
    numComments: 780,
    createdAt: Math.floor(Date.now() / 1000) - 50400,
    permalink: "/r/aww/comments/snow_pup_first_time",
    redditUrl: "https://reddit.com/r/aww",
    over18: false,
    mediaType: "image" as const,
    mediaUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1600&auto=format&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=400&auto=format&fit=crop",
    aspectRatio: 1.4,
    width: 1600,
    height: 1142,
    galleryItems: [],
  },
  {
    id: "fb_8",
    title: "Highland mist rolling across the Isle of Skye beneath sunset clouds",
    author: "celtic_horizons",
    subreddit: "EarthPorn",
    score: 25400,
    upvoteRatio: 0.98,
    numComments: 360,
    createdAt: Math.floor(Date.now() / 1000) - 57600,
    permalink: "/r/EarthPorn/comments/skye_mist_sunset",
    redditUrl: "https://reddit.com/r/EarthPorn",
    over18: false,
    mediaType: "image" as const,
    mediaUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1600&auto=format&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=400&auto=format&fit=crop",
    aspectRatio: 1.5,
    width: 1600,
    height: 1067,
    galleryItems: [],
  }
];

function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

function parseRedditPost(post: any) {
  const d = post.data;
  if (!d) return null;

  // Filter out text-only self posts without previews
  const isSelf = d.is_self;
  const isVideo = d.is_video;
  const isGallery = d.is_gallery;
  const url = d.url || '';
  const postHint = d.post_hint || '';

  let mediaType: 'image' | 'video' | 'gallery' | 'gif' = 'image';
  let mediaUrl = '';
  let thumbnailUrl = '';
  let width = 1200;
  let height = 800;
  const galleryItems: Array<{ url: string; caption?: string; width?: number; height?: number }> = [];
  let videoSources: { mp4?: string; hls?: string; isGif?: boolean } | undefined = undefined;

  // 1. Reddit Video (v.redd.it)
  if (isVideo && d.media?.reddit_video) {
    mediaType = 'video';
    mediaUrl = d.media.reddit_video.fallback_url;
    width = d.media.reddit_video.width || 1280;
    height = d.media.reddit_video.height || 720;
    videoSources = {
      mp4: d.media.reddit_video.fallback_url,
      hls: d.media.reddit_video.hls_url,
      isGif: d.media.reddit_video.is_gif || false,
    };
  } else if (d.preview?.reddit_video_preview) {
    mediaType = 'video';
    mediaUrl = d.preview.reddit_video_preview.fallback_url;
    width = d.preview.reddit_video_preview.width || 1280;
    height = d.preview.reddit_video_preview.height || 720;
    videoSources = {
      mp4: d.preview.reddit_video_preview.fallback_url,
      hls: d.preview.reddit_video_preview.hls_url,
      isGif: d.preview.reddit_video_preview.is_gif || false,
    };
  }
  // 2. Reddit Gallery
  else if (isGallery && d.gallery_data?.items && d.media_metadata) {
    mediaType = 'gallery';
    for (const item of d.gallery_data.items) {
      const meta = d.media_metadata[item.media_id];
      if (meta && meta.status === 'valid') {
        const itemUrl = meta.s?.u || meta.s?.gif;
        if (itemUrl) {
          const decoded = decodeHtmlEntities(itemUrl);
          galleryItems.push({
            url: decoded,
            caption: item.caption,
            width: meta.s?.x,
            height: meta.s?.y,
          });
        }
      }
    }
    if (galleryItems.length > 0) {
      mediaUrl = galleryItems[0].url;
      width = galleryItems[0].width || 1200;
      height = galleryItems[0].height || 800;
    } else {
      return null;
    }
  }
  // 3. GIF / Animated Variants
  else if (d.preview?.images?.[0]?.variants?.mp4) {
    mediaType = 'video';
    const mp4Url = decodeHtmlEntities(d.preview.images[0].variants.mp4.source.url);
    mediaUrl = mp4Url;
    width = d.preview.images[0].variants.mp4.source.width || 1200;
    height = d.preview.images[0].variants.mp4.source.height || 800;
    videoSources = {
      mp4: mp4Url,
      isGif: true,
    };
  } else if (d.preview?.images?.[0]?.variants?.gif) {
    mediaType = 'gif';
    mediaUrl = decodeHtmlEntities(d.preview.images[0].variants.gif.source.url);
    width = d.preview.images[0].variants.gif.source.width || 1200;
    height = d.preview.images[0].variants.gif.source.height || 800;
  }
  // 4. Direct Image or Imgur
  else if (/\.(jpg|jpeg|png|webp|gif)$/i.test(url)) {
    mediaType = url.toLowerCase().endsWith('.gif') ? 'gif' : 'image';
    mediaUrl = url;
    if (d.preview?.images?.[0]?.source) {
      width = d.preview.images[0].source.width;
      height = d.preview.images[0].source.height;
    }
  }
  // 5. Imgur gifv or mp4
  else if (url.includes('imgur.com') && (url.endsWith('.gifv') || url.endsWith('.mp4'))) {
    mediaType = 'video';
    mediaUrl = url.replace('.gifv', '.mp4');
    videoSources = { mp4: mediaUrl, isGif: true };
  }
  // 6. Generic preview image if hint is image or preview exists
  else if (d.preview?.images?.[0]?.source?.url) {
    mediaType = 'image';
    mediaUrl = decodeHtmlEntities(d.preview.images[0].source.url);
    width = d.preview.images[0].source.width;
    height = d.preview.images[0].source.height;
  } else if (isSelf) {
    return null; // Skip pure text posts without media
  } else {
    return null;
  }

  // Derive thumbnail
  if (d.preview?.images?.[0]?.resolutions?.length) {
    const res = d.preview.images[0].resolutions;
    // pick ~300-600px width
    const chosen = res.find((r: any) => r.width >= 300) || res[res.length - 1];
    thumbnailUrl = decodeHtmlEntities(chosen.url);
  } else if (d.thumbnail && d.thumbnail.startsWith('http')) {
    thumbnailUrl = d.thumbnail;
  } else {
    thumbnailUrl = mediaUrl;
  }

  const aspectRatio = width && height ? width / height : 1.33;

  return {
    id: d.id,
    title: decodeHtmlEntities(d.title),
    author: d.author,
    subreddit: d.subreddit,
    score: d.score,
    upvoteRatio: d.upvote_ratio || 0.95,
    numComments: d.num_comments,
    createdAt: d.created_utc,
    permalink: d.permalink,
    redditUrl: `https://www.reddit.com${d.permalink}`,
    over18: d.over_18 || false,
    mediaType,
    mediaUrl,
    thumbnailUrl,
    aspectRatio,
    width,
    height,
    galleryItems,
    videoSources,
  };
}

// API: Fetch Subreddit Posts
app.get('/api/reddit', async (req: Request, res: Response) => {
  const subreddit = (req.query.subreddit as string) || 'EarthPorn';
  const sort = (req.query.sort as string) || 'hot';
  const timeframe = (req.query.timeframe as string) || 'all';
  const after = (req.query.after as string) || '';
  const query = (req.query.q as string) || '';
  const limit = Math.min(Number(req.query.limit) || 25, 50);

  const cacheKey = `${subreddit}:${sort}:${timeframe}:${after}:${query}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    res.json(cached.data);
    return;
  }

  let redditUrl = '';
  if (query) {
    redditUrl = `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/search.json?q=${encodeURIComponent(query)}&restrict_sr=1&sort=${sort}&limit=${limit}&after=${after}`;
  } else if (sort === 'top') {
    redditUrl = `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/top.json?t=${timeframe}&limit=${limit}&after=${after}`;
  } else {
    redditUrl = `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/${sort}.json?limit=${limit}&after=${after}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(redditUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 AetherScroll/1.0',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Reddit API returned status ${response.status} for ${redditUrl}`);
      // If Reddit rate limits (429) or 403, deliver graceful fallback
      const fallbackResult = {
        posts: FALLBACK_POSTS,
        after: null,
        subreddit,
        isFallback: true,
        message: `Reddit returned ${response.status}. Showing curated showcase media.`,
      };
      res.json(fallbackResult);
      return;
    }

    const data = await response.json();
    const children = data?.data?.children || [];
    const nextAfter = data?.data?.after || null;

    const posts = children
      .map((c: any) => parseRedditPost(c))
      .filter((p: any) => p !== null && p.mediaUrl);

    const result = {
      posts,
      after: nextAfter,
      subreddit,
      isFallback: false,
    };

    cache.set(cacheKey, { data: result, timestamp: Date.now() });
    res.json(result);
  } catch (error: any) {
    console.error('Reddit fetch error:', error?.message);
    const fallbackResult = {
      posts: FALLBACK_POSTS,
      after: null,
      subreddit,
      isFallback: true,
      message: 'Network issue contacting Reddit. Displaying curated showcase media.',
    };
    res.json(fallbackResult);
  }
});

// API: Fetch Post Comments
app.get('/api/reddit/comments', async (req: Request, res: Response) => {
  const permalink = req.query.permalink as string;
  if (!permalink) {
    res.status(400).json({ error: 'Permalink required' });
    return;
  }

  const cleanPermalink = permalink.startsWith('/') ? permalink : `/${permalink}`;
  const cacheKey = `comments:${cleanPermalink}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    res.json(cached.data);
    return;
  }

  try {
    const commentsUrl = `https://www.reddit.com${cleanPermalink}.json?limit=20&depth=2`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(commentsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 AetherScroll/1.0',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      res.json({ comments: [] });
      return;
    }

    const json = await response.json();
    const commentList: any[] = [];
    const rawComments = json?.[1]?.data?.children || [];

    for (const c of rawComments) {
      if (c.kind === 't1' && c.data) {
        commentList.push({
          id: c.data.id,
          author: c.data.author,
          body: decodeHtmlEntities(c.data.body),
          score: c.data.score,
          createdAt: c.data.created_utc,
          repliesCount: c.data.replies?.data?.children?.length || 0,
        });
      }
    }

    const result = { comments: commentList };
    cache.set(cacheKey, { data: result, timestamp: Date.now() });
    res.json(result);
  } catch (err: any) {
    res.json({ comments: [] });
  }
});

// API: Check Subreddit Suggestions / Popular List
app.get('/api/reddit/categories', (_req: Request, res: Response) => {
  res.json({
    categories: [
      {
        name: 'Photography & Scenery',
        subreddits: ['EarthPorn', 'spaceporn', 'CityPorn', 'ArchitecturePorn', 'ITAP', 'streetphotography', 'astrophotography']
      },
      {
        name: 'Art & Design',
        subreddits: ['Art', 'DesignPorn', 'cozyplaces', 'battlestations', 'mechanicalkeyboards', 'PixelArt', 'ImaginaryLandscapes']
      },
      {
        name: 'Wildlife & Pets',
        subreddits: ['aww', 'NatureIsFuckingLit', 'Eyebleach', 'wildlifephotography', 'cats', 'dogs']
      },
      {
        name: 'Curiosities & Science',
        subreddits: ['mildlyinteresting', 'interestingasfuck', 'Damnthatsinteresting', 'educationalgifs']
      },
      {
        name: 'Motion & Clips',
        subreddits: ['gifs', 'Cinemagraphs', 'oddlysatisfying', 'BetterEveryLoop']
      }
    ]
  });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
