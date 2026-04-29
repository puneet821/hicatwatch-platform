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
        this._initDynamicTheme(); // Initialize theme variables
        Router.init();
    },

    // --- Dynamic Theme ---
    _initDynamicTheme() {
        // Set initial dynamic colors
        document.documentElement.style.setProperty('--dynamic-bg', 'var(--bg-primary)');
        document.documentElement.style.setProperty('--dynamic-accent', 'var(--accent-primary)');
        document.documentElement.style.setProperty('--dynamic-accent-rgb', '229, 9, 20');
    },

    async updateDynamicTheme(imageUrl) {
        if (!imageUrl) {
            this._resetDynamicTheme();
            return;
        }

        try {
            const color = await this._extractDominantColor(imageUrl);
            if (color) {
                const { r, g, b } = color;
                console.log(`%c Theme Update: rgb(${r}, ${g}, ${b}) `, `background: rgb(${r}, ${g}, ${b}); color: white; border-radius: 4px; padding: 2px 5px;`);
                // Create a slightly darkened version for background
                const darken = 0.4;
                const bgR = Math.floor(r * darken);
                const bgG = Math.floor(g * darken);
                const bgB = Math.floor(b * darken);

                document.documentElement.style.setProperty('--dynamic-bg', `rgb(${bgR}, ${bgG}, ${bgB})`);
                document.body.style.backgroundImage = `radial-gradient(circle at 50% -20%, rgba(${r}, ${g}, ${b}, 0.15), transparent 80%)`;
                document.documentElement.style.setProperty('--dynamic-accent', `rgb(${r}, ${g}, ${b})`);
                document.documentElement.style.setProperty('--dynamic-accent-rgb', `${r}, ${g}, ${b}`);
            }
        } catch (e) {
            console.warn('Failed to extract color:', e);
            this._resetDynamicTheme();
        }
    },

    _resetDynamicTheme() {
        document.documentElement.style.setProperty('--dynamic-bg', 'var(--bg-primary)');
        document.body.style.backgroundImage = 'none';
        document.documentElement.style.setProperty('--dynamic-accent', 'var(--accent-primary)');
        document.documentElement.style.setProperty('--dynamic-accent-rgb', '229, 9, 20');
    },

    _extractDominantColor(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.src = url;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = 50; // Resizing for performance
                canvas.height = 50;
                ctx.drawImage(img, 0, 0, 50, 50);
                
                const imageData = ctx.getImageData(0, 0, 50, 50).data;
                let r = 0, g = 0, b = 0, count = 0;

                for (let i = 0; i < imageData.length; i += 4) {
                    // Skip too dark or too white pixels
                    const ir = imageData[i];
                    const ig = imageData[i+1];
                    const ib = imageData[i+2];
                    const brightness = (ir + ig + ib) / 3;
                    
                    if (brightness > 30 && brightness < 220) {
                        r += ir;
                        g += ig;
                        b += ib;
                        count++;
                    }
                }

                if (count === 0) return resolve({ r: 229, g: 9, b: 20 }); // Fallback red

                resolve({
                    r: Math.floor(r / count),
                    g: Math.floor(g / count),
                    b: Math.floor(b / count)
                });
            };
            img.onerror = reject;
        });
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
        const navSearch = document.getElementById('nav-search');
        const searchToggle = document.getElementById('search-toggle');
        const searchBar = document.getElementById('search-bar');
        const searchInput = document.getElementById('search-input');
        const searchClose = document.getElementById('search-close');
        const searchResultsInstant = document.getElementById('search-results-instant');

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
            this._hideInstantSearch();
        });

        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            const query = searchInput.value.trim();
            
            if (query.length === 0) {
                this._hideInstantSearch();
                return;
            }

            if (query.length >= 2) {
                searchTimeout = setTimeout(() => {
                    this._handleLiveSearch(query);
                }, 300);
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

        // Close search results on click outside
        document.addEventListener('click', (e) => {
            if (!navSearch.contains(e.target)) {
                this._hideInstantSearch();
            }
        });
    },

    async _handleLiveSearch(query) {
        const resultsEl = document.getElementById('search-results-instant');
        if (!resultsEl) return;

        resultsEl.classList.remove('hidden');
        resultsEl.innerHTML = '<div style="padding:20px;text-align:center"><div class="spinner" style="width:24px;height:24px;border-width:2px"></div></div>';

        try {
            const data = await API.searchMulti(query);
            const results = data.results.slice(0, 8); // Show top 8 results

            if (results.length === 0) {
                resultsEl.innerHTML = '<div style="padding:16px;text-align:center;color:var(--text-tertiary);font-size:0.9rem">No results found for "' + query + '"</div>';
                return;
            }

            // Group results (Movies, TV)
            const movies = results.filter(r => API.getMediaType(r) === 'movie');
            const tv = results.filter(r => API.getMediaType(r) === 'tv');

            let html = '';
            
            if (movies.length > 0) {
                html += `
                    <div class="search-results-instant__section">
                        <div class="search-results-instant__header">Movies</div>
                        ${movies.map(m => Components.createSearchItem(m)).join('')}
                    </div>
                `;
            }

            if (tv.length > 0) {
                html += `
                    <div class="search-results-instant__section">
                        <div class="search-results-instant__header">TV Shows</div>
                        ${tv.map(s => Components.createSearchItem(s)).join('')}
                    </div>
                `;
            }

            html += `
                <div style="padding:8px;border-top:1px solid var(--glass-border);text-align:center">
                    <a href="#/search/${encodeURIComponent(query)}" class="section-see-all" style="font-size:0.8rem">See all results</a>
                </div>
            `;

            resultsEl.innerHTML = html;
        } catch (e) {
            console.error('Live search error:', e);
            resultsEl.innerHTML = '<div style="padding:16px;text-align:center;color:var(--accent-primary)">Search failed</div>';
        }
    },

    _hideInstantSearch() {
        const resultsEl = document.getElementById('search-results-instant');
        if (resultsEl) resultsEl.classList.add('hidden');
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
        document.title = 'HiCat Movies — Stream Movies & TV Shows';

        console.info(`Router Match: [${handler}]`, params);

        switch (handler) {
            case 'home':
                document.body.classList.add('theme-artistic');
                this.currentPage = HomePage;
                await HomePage.render();
                break;
 
            case 'movieDetail':
            case 'tvDetail':
            case 'watchMovie':
            case 'watchTV':
            case 'browse':
            case 'genre':
            case 'search':
            case 'collections':
            case 'ai-picks':
            case 'bollywood':
            case 'hollywood':

                document.body.classList.remove('theme-artistic');
                // Use a helper to avoid duplication if possible, but keeping it simple for now
                if (handler === 'movieDetail') {
                    this.currentPage = DetailPage;
                    await DetailPage.render('movie', params.id);
                } else if (handler === 'tvDetail') {
                    this.currentPage = DetailPage;
                    await DetailPage.render('tv', params.id);
                } else if (handler === 'watchMovie') {
                    this.currentPage = WatchPage;
                    await WatchPage.render('movie', params.id);
                } else if (handler === 'watchTV') {
                    this.currentPage = WatchPage;
                    await WatchPage.render('tv', params.id, params.season, params.episode);
                } else if (handler === 'browse') {
                    this.currentPage = BrowsePage;
                    await BrowsePage.render(params.type || 'movie');
                } else if (handler === 'genre') {
                    this.currentPage = BrowsePage;
                    await BrowsePage.render('movie', params.id);
                } else if (handler === 'search') {
                    this.currentPage = SearchPage;
                    await SearchPage.render(params.query);
                } else if (handler === 'collections') {
                    try {
                        this.currentPage = CollectionsPage;
                        await CollectionsPage.render();
                    } catch (e) {
                        console.error('Collections render error:', e);
                        Router.navigate('/');
                    }
                } else if (handler === 'ai-picks') {
                    this.currentPage = AiPicksPage;
                    await AiPicksPage.render();
                } else if (handler === 'bollywood') {
                    this.currentPage = BrowsePage;
                    await BrowsePage.render('bollywood');
                } else if (handler === 'hollywood') {
                    this.currentPage = BrowsePage;
                    await BrowsePage.render('hollywood');
                }
                
                // Reset dynamic theme for generic pages
                if (['browse', 'search', 'genre', 'collections', 'ai-picks'].includes(handler)) {
                    this.updateDynamicTheme(null);
                }
                break;
 
            default:
                document.body.classList.remove('theme-artistic');
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
