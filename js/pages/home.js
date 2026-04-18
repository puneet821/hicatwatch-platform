/* ============================================================
   FlixStream — Home Page
   ============================================================ */

const HomePage = {
    async render() {
        const app = document.getElementById('app');

        // Show loading skeletons immediately
        app.innerHTML = `
            <div class="page-enter">
                ${Components.createSkeletonHero()}
                ${Components.createSkeletonRow()}
                ${Components.createSkeletonRow()}
                ${Components.createSkeletonRow()}
            </div>
        `;

        try {
            // Fetch all data in parallel with individual error catching
            const promises = [
                API.getTrending('all', 'day'),
                API.getPopular('movie'),
                API.getTopRated('movie'),
                API.getPopular('tv'),
                API.getBollywoodMovies(),
                API.getHollywoodMovies(),
            ];

            const results = await Promise.all(
                promises.map(p => p.then(
                    value => ({ status: 'fulfilled', value }),
                    reason => ({ status: 'rejected', reason })
                ))
            );

            const [trending, popular, topRated, popularTV, bollywood, hollywood] = results.map(r =>
                r.status === 'fulfilled' ? r.value : { results: [] }
            );

            // Check if all requests failed
            const allFailed = results.every(r => r.status === 'rejected');
            if (allFailed) {
                throw new Error('All API requests failed');
            }

            // Build the page
            let html = '<div class="page-enter">';

            // Hero banner with trending
            if (trending.results && trending.results.length > 0) {
                html += Components.createHeroBanner(trending.results);
                // Trigger initial dynamic color from first hero slide
                const firstBackdrop = CONFIG.getImageUrl(trending.results[0].backdrop_path, 'backdrop_original');
                App.updateDynamicTheme(firstBackdrop);
            }

            // Trending Today (wide cards)
            if (trending.results && trending.results.length > 0) {
                html += Components.createContentRow(
                    'trending',
                    '🔥 Trending Today',
                    trending.results.slice(0, 15),
                    '#/browse/movie',
                    true
                );
            }

            // Popular Movies
            if (popular.results && popular.results.length > 0) {
                html += Components.createContentRow(
                    'popular',
                    '🎬 Popular Movies',
                    popular.results,
                    '#/browse/movie'
                );
            }

            // Popular TV Shows
            if (popularTV.results && popularTV.results.length > 0) {
                html += Components.createContentRow(
                    'popular-tv',
                    '📺 Popular TV Shows',
                    popularTV.results.map(s => ({ ...s, media_type: 'tv' })),
                    '#/browse/tv'
                );
            }

            // Top Rated
            if (topRated.results && topRated.results.length > 0) {
                html += Components.createContentRow(
                    'top-rated',
                    '⭐ Top Rated',
                    topRated.results,
                    '#/browse/movie'
                );
            }

            // Hollywood
            if (hollywood.results && hollywood.results.length > 0) {
                html += Components.createContentRow(
                    'hollywood',
                    '🎥 Hollywood',
                    hollywood.results,
                    '#/hollywood'
                );
            }

            // Bollywood
            if (bollywood.results && bollywood.results.length > 0) {
                html += Components.createContentRow(
                    'bollywood',
                    '🪷 Bollywood',
                    bollywood.results,
                    '#/bollywood'
                );
            }

            html += '</div>';
            app.innerHTML = html;

            // Start hero rotation
            Components.startHeroRotation();

            // Init scroll reveal
            setTimeout(() => Components.initScrollReveal(), 100);

        } catch (error) {
            console.error('Home page error:', error);
            app.innerHTML = `
                <div class="empty-state" style="min-height:80vh">
                    <div class="empty-state__icon">${Components.icons.film}</div>
                    <h3 class="empty-state__title">Couldn't Load Content</h3>
                    <p class="empty-state__text">
                        ${error.message && error.message.includes('timed out')
                            ? 'The TMDB API is not responding. This might be a network issue. Please check your internet and try again.'
                            : 'Could not load content. Your API key might be invalid or TMDB might be down.'
                        }
                    </p>
                    <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center">
                        <button class="btn btn-accent" onclick="location.reload()">
                            Retry
                        </button>
                        <button class="btn btn-secondary" onclick="App.resetApiKey()">
                            Change API Key
                        </button>
                    </div>
                    <p style="margin-top:24px;font-size:0.8rem;color:var(--text-tertiary)">
                        Error: ${error.message || 'Unknown error'}
                    </p>
                </div>
            `;
        }
    },

    destroy() {
        Components.stopHeroRotation();
    },
};
