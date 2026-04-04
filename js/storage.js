/* ============================================================
   CatWatch — LocalStorage Manager
   ============================================================ */

const Storage = {
    KEYS: {
        WATCHLIST: 'catwatch_watchlist',
        HISTORY: 'catwatch_history',
        PREFERENCES: 'catwatch_preferences',
        SEARCH_HISTORY: 'catwatch_search_history',
    },

    // --- Generic helpers ---
    _get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    },

    _set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Storage error:', e);
        }
    },

    // --- Watchlist ---
    getWatchlist() {
        return this._get(this.KEYS.WATCHLIST) || [];
    },

    addToWatchlist(item) {
        const list = this.getWatchlist();
        if (list.some(i => i.id === item.id && i.media_type === item.media_type)) return false;

        list.unshift({
            id: item.id,
            title: API.getTitle(item),
            poster_path: item.poster_path,
            backdrop_path: item.backdrop_path,
            vote_average: item.vote_average,
            release_date: API.getReleaseDate(item),
            media_type: item.media_type || (item.first_air_date ? 'tv' : 'movie'),
            added_at: Date.now(),
        });
        this._set(this.KEYS.WATCHLIST, list);
        return true;
    },

    removeFromWatchlist(id, mediaType) {
        let list = this.getWatchlist();
        list = list.filter(i => !(i.id === id && i.media_type === mediaType));
        this._set(this.KEYS.WATCHLIST, list);
    },

    isInWatchlist(id, mediaType) {
        return this.getWatchlist().some(i => i.id === id && i.media_type === mediaType);
    },

    // --- Watch History ---
    getHistory() {
        return this._get(this.KEYS.HISTORY) || [];
    },

    addToHistory(item) {
        let history = this.getHistory();
        // Remove if already exists (to move to front)
        history = history.filter(i => !(i.id === item.id && i.media_type === item.media_type));

        history.unshift({
            id: item.id,
            title: API.getTitle(item),
            poster_path: item.poster_path,
            media_type: item.media_type || (item.first_air_date ? 'tv' : 'movie'),
            watched_at: Date.now(),
            season: item.season || null,
            episode: item.episode || null,
        });

        // Keep max 100 items
        history = history.slice(0, 100);
        this._set(this.KEYS.HISTORY, history);
    },

    // --- Search History ---
    getSearchHistory() {
        return this._get(this.KEYS.SEARCH_HISTORY) || [];
    },

    addSearchQuery(query) {
        let history = this.getSearchHistory();
        history = history.filter(q => q.toLowerCase() !== query.toLowerCase());
        history.unshift(query);
        history = history.slice(0, 10);
        this._set(this.KEYS.SEARCH_HISTORY, history);
    },

    clearSearchHistory() {
        this._set(this.KEYS.SEARCH_HISTORY, []);
    },

    // --- Preferences ---
    getPreferences() {
        return this._get(this.KEYS.PREFERENCES) || {
            defaultServer: 0,
            autoplay: true,
        };
    },

    setPreference(key, value) {
        const prefs = this.getPreferences();
        prefs[key] = value;
        this._set(this.KEYS.PREFERENCES, prefs);
    },
};
