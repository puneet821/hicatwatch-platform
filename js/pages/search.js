/* ============================================================
   FlixStream — Search Results Page
   ============================================================ */

const SearchPage = {
    currentQuery: '',
    currentPage: 1,
    totalPages: 1,
    isLoading: false,

    async render(query) {
        const app = document.getElementById('app');
        this.currentQuery = decodeURIComponent(query);
        this.currentPage = 1;

        // Save to search history
        if (this.currentQuery) {
            Storage.addSearchQuery(this.currentQuery);
        }

        app.innerHTML = `
            <div class="search-page page-enter">
                <div class="search__header">
                    <h1 class="search__query">Results for <span>"${this.currentQuery}"</span></h1>
                    <p class="search__count" id="search-count">Searching...</p>
                </div>
                <div class="content-grid" id="search-grid">
                    ${Components.createSkeletonGrid(12)}
                </div>
                <div class="load-more-wrap" id="search-load-more">
                    <div class="spinner" id="search-spinner" style="display:none"></div>
                </div>
            </div>
        `;

        await this._loadResults();
        this._setupInfiniteScroll();
    },

    async _loadResults(append = false) {
        if (this.isLoading) return;
        this.isLoading = true;

        const spinner = document.getElementById('search-spinner');
        if (spinner) spinner.style.display = 'block';

        try {
            const data = await API.searchMulti(this.currentQuery, this.currentPage);
            this.totalPages = data.total_pages || 1;

            // Filter to movies and TV only
            const results = (data.results || []).filter(
                r => r.media_type === 'movie' || r.media_type === 'tv'
            );

            const grid = document.getElementById('search-grid');
            const countEl = document.getElementById('search-count');

            if (!grid) return;

            if (!append && results.length === 0) {
                grid.innerHTML = Components.createEmptyState(
                    'No Results Found',
                    `We couldn't find anything matching "${this.currentQuery}". Try a different search term.`,
                    'Browse Movies',
                    '#/browse/movie'
                );
                if (countEl) countEl.textContent = '0 results';
                return;
            }

            const cardsHtml = results.map(item => Components.createMovieCard(item)).join('');

            if (append) {
                grid.insertAdjacentHTML('beforeend', cardsHtml);
            } else {
                grid.innerHTML = cardsHtml;
            }

            if (countEl) {
                countEl.textContent = `${data.total_results || 0} results found`;
            }

        } catch (error) {
            console.error('Search error:', error);
        } finally {
            this.isLoading = false;
            if (spinner) spinner.style.display = 'none';
        }
    },

    _setupInfiniteScroll() {
        const sentinel = document.getElementById('search-load-more');
        if (!sentinel) return;

        this._observer = new IntersectionObserver(async (entries) => {
            if (entries[0].isIntersecting && !this.isLoading && this.currentPage < this.totalPages) {
                this.currentPage++;
                await this._loadResults(true);
            }
        }, { threshold: 0.1 });

        this._observer.observe(sentinel);
    },

    destroy() {
        if (this._observer) {
            this._observer.disconnect();
            this._observer = null;
        }
    },
};
