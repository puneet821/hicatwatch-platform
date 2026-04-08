/* ============================================================
   CatWatch — API Wrapper
   ============================================================ */

const API = {
    // Fetch with timeout
    async _fetchWithTimeout(url, options = {}, timeoutMs = CONFIG.REQUEST_TIMEOUT) {
        // Fallback for older Smart TVs (like LG WebOS 3.0) that lack 'fetch'
        if (typeof fetch === 'undefined') {
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open(options.method || 'GET', url, true);
                
                if (options.headers) {
                    Object.keys(options.headers).forEach(k => {
                        xhr.setRequestHeader(k, options.headers[k]);
                    });
                }

                xhr.timeout = timeoutMs;
                
                xhr.onload = function () {
                    resolve({
                        ok: xhr.status >= 200 && xhr.status < 300,
                        status: xhr.status,
                        json: () => Promise.resolve(JSON.parse(xhr.responseText)),
                        text: () => Promise.resolve(xhr.responseText)
                    });
                };
                
                xhr.onerror = function () {
                    reject(new Error('Network Error'));
                };
                
                xhr.ontimeout = function () {
                    reject(new Error('Request timed out. Please check your internet connection.'));
                };

                xhr.send(options.body || null);
            });
        }

        // Environment supports fetch but lacks AbortController
        if (typeof AbortController === 'undefined') {
            return new Promise((resolve, reject) => {
                const timeoutId = setTimeout(() => {
                    reject(new Error('Request timed out. Please check your internet connection.'));
                }, timeoutMs);
                try {
                    fetch(url, options).then(res => {
                        clearTimeout(timeoutId);
                        resolve(res);
                    }).catch(err => {
                        clearTimeout(timeoutId);
                        reject(err);
                    });
                } catch(e) {
                    clearTimeout(timeoutId);
                    reject(e);
                }
            });
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Request timed out. Please check your internet connection.');
            }
            throw error;
        }
    },

    // Generic fetch with auth, timeout, and retry
    async _fetch(endpoint, params = {}, retries = CONFIG.MAX_RETRIES) {
        let urlStr = `${CONFIG.TMDB_BASE_URL}${endpoint}`;
        const queryParams = [];

        // Add query params
        const authType = CONFIG.getAuthType();
        if (authType === 'apikey') {
            queryParams.push(`api_key=${encodeURIComponent(CONFIG.TMDB_API_KEY)}`);
        }
        
        // Avoid Object.entries for older browser compatibility
        if (params) {
            Object.keys(params).forEach(key => {
                const val = params[key];
                if (val !== undefined && val !== null && val !== '') {
                    queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`);
                }
            });
        }

        if (queryParams.length > 0) {
            urlStr += (urlStr.includes('?') ? '&' : '?') + queryParams.join('&');
        }

        // Build headers
        const headers = {};
        if (authType === 'bearer') {
            headers['Authorization'] = `Bearer ${CONFIG.TMDB_BEARER_TOKEN}`;
        }
        headers['Content-Type'] = 'application/json';

        let lastError;
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const response = await this._fetchWithTimeout(urlStr, { headers });
                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    throw new Error(errData.status_message || `API Error: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                lastError = error;
                console.warn(`TMDB API attempt ${attempt + 1} failed [${endpoint}]:`, error.message);
                if (attempt < retries) {
                    // Wait before retry (exponential backoff)
                    await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
                }
            }
        }

        console.error(`TMDB API failed after ${retries + 1} attempts [${endpoint}]:`, lastError);
        throw lastError;
    },

    // Validate an API key or bearer token
    async validateKey(key) {
        try {
            // Detect if it's a bearer token (long) or API key (short)
            const isBearer = key.length > 100;
            let url, options;

            if (isBearer) {
                url = `${CONFIG.TMDB_BASE_URL}/configuration`;
                options = {
                    headers: {
                        'Authorization': `Bearer ${key}`,
                        'Content-Type': 'application/json',
                    }
                };
            } else {
                url = `${CONFIG.TMDB_BASE_URL}/configuration?api_key=${key}`;
                options = {};
            }

            const response = await this._fetchWithTimeout(url, options, 8000);
            return { valid: response.ok, isBearer };
        } catch (error) {
            console.error('Key validation error:', error);
            return { valid: false, isBearer: false, error: error.message };
        }
    },

    // --- Trending ---
    async getTrending(mediaType = 'movie', timeWindow = 'day', page = 1) {
        return this._fetch(`/trending/${mediaType}/${timeWindow}`, { page });
    },

    // --- Popular ---
    async getPopular(mediaType = 'movie', page = 1) {
        return this._fetch(`/${mediaType}/popular`, { page });
    },

    // --- Top Rated ---
    async getTopRated(mediaType = 'movie', page = 1) {
        return this._fetch(`/${mediaType}/top_rated`, { page });
    },

    // --- Upcoming Movies ---
    async getUpcoming(page = 1) {
        return this._fetch('/movie/upcoming', { page });
    },

    // --- Now Playing ---
    async getNowPlaying(page = 1) {
        return this._fetch('/movie/now_playing', { page });
    },

    // --- Movie Details ---
    async getMovieDetails(id) {
        return this._fetch(`/movie/${id}`, {
            append_to_response: 'credits,videos,similar,recommendations'
        });
    },

    // --- TV Details ---
    async getTVDetails(id) {
        return this._fetch(`/tv/${id}`, {
            append_to_response: 'credits,videos,similar,recommendations'
        });
    },

    // --- TV Season Details ---
    async getTVSeason(tvId, seasonNumber) {
        return this._fetch(`/tv/${tvId}/season/${seasonNumber}`);
    },

    // --- Search ---
    async searchMulti(query, page = 1) {
        return this._fetch('/search/multi', { query, page });
    },

    async searchMovies(query, page = 1) {
        return this._fetch('/search/movie', { query, page });
    },

    async searchTV(query, page = 1) {
        return this._fetch('/search/tv', { query, page });
    },

    // --- Genres ---
    async getGenres(mediaType = 'movie') {
        return this._fetch(`/genre/${mediaType}/list`);
    },

    // --- Discover ---
    async discover(mediaType = 'movie', params = {}) {
        return this._fetch(`/discover/${mediaType}`, params);
    },

    // --- Bollywood Movies (Hindi language, India region) ---
    async getBollywoodMovies(page = 1) {
        return this._fetch('/discover/movie', {
            with_original_language: 'hi',
            region: 'IN',
            sort_by: 'popularity.desc',
            page,
        });
    },

    // --- Hollywood Movies (English language, US region) ---
    async getHollywoodMovies(page = 1) {
        return this._fetch('/discover/movie', {
            with_original_language: 'en',
            region: 'US',
            sort_by: 'popularity.desc',
            page,
        });
    },

    // --- Helpers ---
    getTrailerKey(videos) {
        if (!videos || !videos.results) return null;
        const trailer = videos.results.find(
            v => v.type === 'Trailer' && v.site === 'YouTube'
        ) || videos.results.find(
            v => v.site === 'YouTube'
        );
        return trailer ? trailer.key : null;
    },

    getYear(dateStr) {
        if (!dateStr) return 'N/A';
        return dateStr.split('-')[0];
    },

    formatRuntime(minutes) {
        if (!minutes) return '';
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    },

    formatRating(rating) {
        if (!rating) return 'N/A';
        return parseFloat(rating).toFixed(1);
    },

    getMediaType(item) {
        return item.media_type || (item.first_air_date ? 'tv' : 'movie');
    },

    getTitle(item) {
        return item.title || item.name || 'Untitled';
    },

    getReleaseDate(item) {
        return item.release_date || item.first_air_date || '';
    },
};
