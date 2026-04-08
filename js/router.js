/* ============================================================
   CatWatch — Hash-based SPA Router
   ============================================================ */

const Router = {
    routes: {},
    currentRoute: null,

    // Define routes
    init() {
        this.routes = {
            '/': 'home',
            '/movie/:id': 'movieDetail',
            '/tv/:id': 'tvDetail',
            '/watch/movie/:id': 'watchMovie',
            '/watch/tv/:id/:season/:episode': 'watchTV',
            '/browse/:type': 'browse',
            '/genre/:id': 'genre',
            '/search/:query': 'search',
            '/watchlist': 'watchlist',
            '/bollywood': 'bollywood',
            '/hollywood': 'hollywood',
        };

        // Prevent multiple listeners if init is called twice
        window.removeEventListener('hashchange', this._boundHandleRoute);
        this._boundHandleRoute = () => this._handleRoute();
        window.addEventListener('hashchange', this._boundHandleRoute);

        // Handle initial route
        if (!window.location.hash) {
            window.location.hash = '#/';
        } else {
            this._handleRoute();
        }
    },

    // Navigate to a route
    navigate(path) {
        window.location.hash = `#${path}`;
    },

    // Get current hash path
    getPath() {
        return window.location.hash.slice(1) || '/';
    },

    // Parse route and extract params
    _matchRoute(path) {
        console.log(`Router: Matching path [${path}]`);
        const keys = Object.keys(this.routes);
        for (let i = 0; i < keys.length; i++) {
            const pattern = keys[i];
            const handler = this.routes[pattern];
            const params = this._extractParams(pattern, path);
            if (params !== null) {
                console.log(`Router: Match found! Handler: ${handler}`);
                return { handler, params };
            }
        }
        console.warn(`Router: No match found for [${path}]. Redirecting to home.`);
        return null;
    },

    // Extract params from URL
    _extractParams(pattern, path) {
        // Normalize: ensure leading slash, remove trailing
        const cleanPath = (path.startsWith('/') ? path : '/' + path).replace(/\/$/, '') || '/';
        const cleanPattern = (pattern.startsWith('/') ? pattern : '/' + pattern).replace(/\/$/, '') || '/';

        const patternParts = cleanPattern.split('/').filter(Boolean);
        const pathParts = cleanPath.split('/').filter(Boolean);

        if (cleanPattern === '/' && cleanPath === '/') return {};
        if (cleanPattern === '/' && pathParts.length > 0) return null;

        if (patternParts.length !== pathParts.length) return null;

        const params = {};
        for (let i = 0; i < patternParts.length; i++) {
            if (patternParts[i].startsWith(':')) {
                params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
            } else if (patternParts[i] !== pathParts[i]) {
                return null;
            }
        }
        return params;
    },

    // Handle route change
    async _handleRoute() {
        const path = this.getPath();
        const match = this._matchRoute(path);

        if (!match) {
            // Fallback to home
            this.navigate('/');
            return;
        }

        this.currentRoute = { path, ...match };

        // Update active nav links
        this._updateNavLinks(path);

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'instant' });

        // Dispatch route event
        const event = new CustomEvent('routeChange', {
            detail: {
                handler: match.handler,
                params: match.params,
                path,
            }
        });
        window.dispatchEvent(event);
    },

    // Update navigation link active states
    _updateNavLinks(path) {
        document.querySelectorAll('.navbar__link, .mobile-menu__link').forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href) {
                const linkPath = href.replace('#', '');
                if (path === linkPath || (linkPath !== '/' && path.startsWith(linkPath))) {
                    link.classList.add('active');
                } else if (linkPath === '/' && path === '/') {
                    link.classList.add('active');
                }
            }
        });
    },
};
