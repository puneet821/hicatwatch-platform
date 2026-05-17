/* ============================================================
   CatWatch — Global Configuration
   ============================================================ */

const CONFIG = {
    // TMDB API - supports both v3 API Key and v4 Bearer Token
    TMDB_API_KEY: localStorage.getItem('catwatch_api_key') || '8378ef53cbfdb94d90908eac81b66966',
    TMDB_BEARER_TOKEN: localStorage.getItem('catwatch_bearer_token') || '',
    TMDB_BASE_URL: 'https://api.themoviedb.org/3',
    TMDB_IMAGE_BASE: 'https://image.tmdb.org/t/p/',

    // Request settings
    REQUEST_TIMEOUT: 10000, // 10 second timeout
    MAX_RETRIES: 2,

    // Image sizes
    IMAGE_SIZES: {
        poster_sm: 'w185',
        poster_md: 'w342',
        poster_lg: 'w500',
        backdrop_sm: 'w780',
        backdrop_lg: 'w1280',
        backdrop_original: 'original',
        profile_sm: 'w185',
        profile_lg: 'h632',
    },

    // Embed sources (fallback order)
    EMBED_SOURCES: [
        { name: 'Server 1 (VidEasy)', base: 'https://player.videasy.net' },
        { name: 'Server 2 (vidsrc.ru)', base: 'https://vidsrc-embed.ru' },
        { name: 'Server 3 (vsrc.su)', base: 'https://vsrc.su' },
        { name: 'Server 4 (vidsrc.pm)', base: 'https://vidsrc.pm/embed' },
        { name: 'Server 5 (Edge Cluster)', base: 'https://vidsrc.icu/embed' },
        { name: 'Server 6 (Legacy v3)', base: 'https://vidsrc.cc/v3/embed' },
        { name: 'Server 7 (MKV Stream)', base: 'https://vidsrc.pm/embed' },
        { name: 'Server 8 (UpCloud Relay)', base: 'https://vidsrc.to/embed' },
        { name: 'Server 9 (VidFast Pro)', base: 'https://vidfast.pro' },
        { name: 'Server 10 (VidKing Net)', base: 'https://www.vidking.net/embed' },
        { name: 'Server 11 (VidUp To)', base: 'https://vidup.to' },
        { name: 'Server 12 (MoviesAPI Club)', base: 'https://moviesapi.club' },
        { name: 'Server 13 (VidLink Pro)', base: 'https://vidlink.pro' },
        { name: 'Server 14 (VidSrc XYZ)', base: 'https://vidsrc.xyz/embed' },
        { name: 'Server 15 (VidSrc.to Backup)', base: 'https://vidsrc.to/embed' },
    ],

    // Default embed source index
    DEFAULT_EMBED: 0,

    // Pagination
    ITEMS_PER_PAGE: 20,

    // Hero banner
    HERO_SLIDE_COUNT: 5,
    HERO_ROTATE_INTERVAL: 8000,

    // Search
    SEARCH_DEBOUNCE_MS: 400,

    // Set API Key (v3)
    setApiKey(key) {
        this.TMDB_API_KEY = key;
        localStorage.setItem('catwatch_api_key', key);
    },

    // Set Bearer Token (v4 Read Access Token)
    setBearerToken(token) {
        this.TMDB_BEARER_TOKEN = token;
        localStorage.setItem('catwatch_bearer_token', token);
    },

    // Check if any auth is set
    hasApiKey() {
        return (this.TMDB_API_KEY && this.TMDB_API_KEY.length > 10) ||
               (this.TMDB_BEARER_TOKEN && this.TMDB_BEARER_TOKEN.length > 30);
    },

    // Get auth method type
    getAuthType() {
        if (this.TMDB_BEARER_TOKEN && this.TMDB_BEARER_TOKEN.length > 30) return 'bearer';
        if (this.TMDB_API_KEY && this.TMDB_API_KEY.length > 10) return 'apikey';
        return null;
    },

    // Clear all auth
    clearAuth() {
        this.TMDB_API_KEY = '';
        this.TMDB_BEARER_TOKEN = '';
        localStorage.removeItem('catwatch_api_key');
        localStorage.removeItem('catwatch_bearer_token');
    },

    // Get image URL
    getImageUrl(path, size = 'poster_lg') {
        if (!path) return '';
        const sizeValue = this.IMAGE_SIZES[size] || size;
        return `${this.TMDB_IMAGE_BASE}${sizeValue}${path}`;
    },

    // Get embed URL for movie
    getMovieEmbedUrl(tmdbId, sourceIndex = 0) {
        const source = this.EMBED_SOURCES[sourceIndex] || this.EMBED_SOURCES[0];
        // Handle specific provider formats
        if (source.base.includes('2embed')) {
            return `${source.base}/${tmdbId}`;
        }
        if (source.base.includes('vidlink.pro')) {
            return `${source.base}/movie/${tmdbId}?primaryColor=ce9fff&secondaryColor=ce9fff&iconColor=ce9fff`;
        }
        if (source.base.includes('vidsrc.xyz')) {
            return `${source.base}/movie?tmdb=${tmdbId}&ds_lang=en`;
        }
        return `${source.base}/movie/${tmdbId}`;
    },

    // Get embed URL for TV episode
    getTVEmbedUrl(tmdbId, season, episode, sourceIndex = 0) {
        const source = this.EMBED_SOURCES[sourceIndex] || this.EMBED_SOURCES[0];
        // Handle specific provider formats
        if (source.base.includes('2embed')) {
            return `${source.base}/tv?id=${tmdbId}&s=${season}&e=${episode}`;
        }
        if (source.base.includes('vidlink.pro')) {
            return `${source.base}/tv/${tmdbId}/${season}/${episode}?primaryColor=ce9fff&secondaryColor=ce9fff&iconColor=ce9fff`;
        }
        if (source.base.includes('vidsrc.xyz')) {
            return `${source.base}/tv?tmdb=${tmdbId}&s=${season}&e=${episode}&ds_lang=en`;
        }
        return `${source.base}/tv/${tmdbId}/${season}/${episode}`;
    },

};
