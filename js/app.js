/* ============================================================
   CatWatch — Main Application Controller
   ============================================================ */

const App = {
    currentPage: null,

    init() {
        // Check for API key
        if (!CONFIG.hasApiKey()) {
            this._showSetupModal();
            return;
        }

        // Listen for route changes - add listener BEFORE router init
        if (!this._routeListenerAdded) {
            window.addEventListener('routeChange', (e) => this._handleRoute(e.detail));
            this._routeListenerAdded = true;
        }

        this._initNavbar();
        this._initSearch();
        this._initMobileMenu();
        Router.init();
    },

    // --- Setup Modal ---
    _showSetupModal() {
        const modal = document.getElementById('setup-modal');
        modal.classList.remove('hidden');

        const input = document.getElementById('api-key-input');
        const submitBtn = document.getElementById('api-key-submit');
        const errorEl = document.getElementById('api-key-error');

        const handleSubmit = async () => {
            const key = input.value.trim();
            if (!key) {
                errorEl.classList.remove('hidden');
                errorEl.textContent = 'Please enter an API key or Read Access Token.';
                return;
            }

            // Show loading
            submitBtn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px"></div> <span>Validating...</span>';
            submitBtn.disabled = true;
            errorEl.classList.add('hidden');

            const result = await API.validateKey(key);

            if (result.valid) {
                if (result.isBearer) {
                    CONFIG.setBearerToken(key);
                } else {
                    CONFIG.setApiKey(key);
                }
                modal.classList.add('hidden');
                // Remove old listeners
                submitBtn.replaceWith(submitBtn.cloneNode(true));
                input.replaceWith(input.cloneNode(true));
                this.init();
            } else {
                errorEl.classList.remove('hidden');
                if (result.error && result.error.includes('timed out')) {
                    errorEl.textContent = 'Connection timed out. TMDB may be slow — please try again in a moment.';
                } else {
                    errorEl.textContent = 'Invalid key. Make sure you copied the full API Key or Read Access Token.';
                }
                submitBtn.innerHTML = '<span>Get Started</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
                submitBtn.disabled = false;
            }
        };

        submitBtn.addEventListener('click', handleSubmit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleSubmit();
        });

        input.focus();
    },

    _hideSetupModal() {
        const modal = document.getElementById('setup-modal');
        if (modal) modal.classList.add('hidden');
    },

    // Reset API key and show setup again
    resetApiKey() {
        CONFIG.clearAuth();
        location.reload();
    },

    // --- Navigation ---
    _initNavbar() {
        let lastScroll = 0;
        const navbar = document.getElementById('navbar');

        window.addEventListener('scroll', () => {
            const currentScroll = window.scrollY;

            if (currentScroll > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }

            lastScroll = currentScroll;
        }, { passive: true });
    },

    // --- Search ---
    _initSearch() {
        const searchToggle = document.getElementById('search-toggle');
        const searchBar = document.getElementById('search-bar');
        const searchInput = document.getElementById('search-input');
        const searchClose = document.getElementById('search-close');

        let searchTimeout = null;

        searchToggle.addEventListener('click', () => {
            searchToggle.classList.add('hidden');
            searchBar.classList.remove('hidden');
            searchInput.focus();
        });

        searchClose.addEventListener('click', () => {
            searchBar.classList.add('hidden');
            searchToggle.classList.remove('hidden');
            searchInput.value = '';
        });

        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            const query = searchInput.value.trim();
            if (query.length >= 2) {
                searchTimeout = setTimeout(() => {
                    Router.navigate(`/search/${encodeURIComponent(query)}`);
                }, CONFIG.SEARCH_DEBOUNCE_MS);
            }
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                clearTimeout(searchTimeout);
                const query = searchInput.value.trim();
                if (query.length >= 1) {
                    Router.navigate(`/search/${encodeURIComponent(query)}`);
                }
            }
            if (e.key === 'Escape') {
                searchClose.click();
            }
        });

        // Keyboard shortcut: Ctrl+K or / to search
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName))) {
                e.preventDefault();
                searchToggle.click();
            }
        });
    },

    // --- Mobile Menu ---
    _initMobileMenu() {
        const toggle = document.getElementById('mobile-toggle');
        const menu = document.getElementById('mobile-menu');

        if (!toggle || !menu) return;

        toggle.addEventListener('click', () => {
            menu.classList.toggle('hidden');
        });

        // Close on link click
        menu.querySelectorAll('.mobile-menu__link').forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.add('hidden');
            });
        });

        // Close on route change
        window.addEventListener('routeChange', () => {
            menu.classList.add('hidden');
        });
    },

    // --- Route Handler ---
    async _handleRoute({ handler, params }) {
        // Destroy previous page if it has a destroy method
        if (this.currentPage && this.currentPage.destroy) {
            this.currentPage.destroy();
        }

        // Reset page title
        document.title = 'CatWatch — Stream Movies & TV Shows';

        console.info(`Router Match: [${handler}]`, params);

        switch (handler) {
            case 'home':
                this.currentPage = HomePage;
                await HomePage.render();
                break;

            case 'movieDetail':
                this.currentPage = DetailPage;
                await DetailPage.render('movie', params.id);
                break;

            case 'tvDetail':
                this.currentPage = DetailPage;
                await DetailPage.render('tv', params.id);
                break;

            case 'watchMovie':
                this.currentPage = WatchPage;
                await WatchPage.render('movie', params.id);
                break;

            case 'watchTV':
                this.currentPage = WatchPage;
                await WatchPage.render('tv', params.id, params.season, params.episode);
                break;

            case 'browse':
                this.currentPage = BrowsePage;
                await BrowsePage.render(params.type || 'movie');
                break;

            case 'genre':
                this.currentPage = BrowsePage;
                await BrowsePage.render('movie', params.id);
                break;

            case 'search':
                this.currentPage = SearchPage;
                await SearchPage.render(params.query);
                break;

            case 'watchlist':
                try {
                    this.currentPage = WatchlistPage;
                    await WatchlistPage.render();
                } catch (e) {
                    console.error('Watchlist render error:', e);
                    Router.navigate('/');
                }
                break;

            case 'bollywood':
                this.currentPage = BrowsePage;
                await BrowsePage.render('bollywood');
                break;

            case 'hollywood':
                this.currentPage = BrowsePage;
                await BrowsePage.render('hollywood');
                break;

            default:
                console.warn('Unknown route handler:', handler);
                Router.navigate('/');
        }
    },

    // --- Navigation Helpers (called from components) ---
    navigateToDetail(id, type = 'movie') {
        Router.navigate(`/${type}/${id}`);
    },

    navigateToWatch(id, type = 'movie', season = null, episode = null) {
        if (type === 'tv' && season && episode) {
            Router.navigate(`/watch/tv/${id}/${season}/${episode}`);
        } else if (type === 'tv') {
            // Navigate to detail for TV to pick episode
            Router.navigate(`/tv/${id}`);
        } else {
            Router.navigate(`/watch/movie/${id}`);
        }
    },

    filterByGenre(genreId) {
        if (BrowsePage && typeof BrowsePage.selectGenre === 'function') {
            BrowsePage.selectGenre(genreId);
        } else {
            Router.navigate(`/genre/${genreId}`);
        }
    },
};

// --- Initialize on DOM ready ---
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
