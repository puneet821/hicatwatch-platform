/* ============================================================
   FlixStream — Browse / Discover Page
   ============================================================ */

const BrowsePage = {
    currentType: 'movie',
    currentGenre: null,
    currentSort: 'popularity.desc',
    currentPage: 1,
    totalPages: 1,
    isLoading: false,
    genres: [],

    async render(type = 'movie', genreId = null) {
        const app = document.getElementById('app');
        this.currentType = type;
        this.currentGenre = genreId ? parseInt(genreId) : null;
        this.currentPage = 1;
        this.currentSort = 'popularity.desc';

        // Categorize special types
        const isSpecialCategory = ['bollywood', 'hollywood'].includes(type);

        // Show skeleton
        app.innerHTML = `
            <div class="browse-page page-enter">
                <div class="browse__header">
                    <div class="skeleton skeleton-text" style="width:250px;height:32px;margin-bottom:20px"></div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap">
                        ${Array(8).fill('<div class="skeleton" style="width:80px;height:32px;border-radius:var(--radius-full)"></div>').join('')}
                    </div>
                </div>
                <div class="content-grid">${Components.createSkeletonGrid(18)}</div>
            </div>
        `;

        try {
            // Fetch genres - special categories use standard movie genres
            const genreFetchType = isSpecialCategory ? 'movie' : type;
            const genreData = await API.getGenres(genreFetchType);
            this.genres = genreData.genres || [];

            // Render page structure
            this._renderStructure();

            // Load content
            await this._loadContent();

            // Setup infinite scroll
            this._setupInfiniteScroll();

        } catch (error) {
            console.error('Browse page error:', error);
            app.innerHTML = Components.createEmptyState(
                'Error Loading Content',
                'Could not load the browse page. Please try again.',
                'Retry',
                `#/browse/${type}`
            );
        }
    },

    _renderStructure() {
        const app = document.getElementById('app');
        let titleText;

        if (this.currentType === 'bollywood') {
            titleText = '🪷 Bollywood Movies';
        } else if (this.currentType === 'hollywood') {
            titleText = '🎥 Hollywood Movies';
        } else {
            titleText = this.currentGenre
                ? `${GenreMap[this.currentGenre] || 'Genre'} ${this.currentType === 'tv' ? 'TV Shows' : 'Movies'}`
                : `Browse ${this.currentType === 'tv' ? 'TV Shows' : 'Movies'}`;
        }

        const isSpecialCategory = ['bollywood', 'hollywood'].includes(this.currentType);

        const genrePills = this.genres.map(g =>
            `<button class="genre-pill ${this.currentGenre === g.id ? 'active' : ''}"
                data-genre-id="${g.id}"
                onclick="BrowsePage.selectGenre(${g.id})">
                ${g.name}
            </button>`
        ).join('');

        app.innerHTML = `
            <div class="browse-page page-enter">
                <div class="browse__header">
                    <h1 class="browse__title">${titleText}</h1>
                    ${!isSpecialCategory ? `
                        <div class="browse__filters">
                            <div class="browse__type-toggle">
                                <button class="browse__type-btn ${this.currentType === 'movie' ? 'active' : ''}"
                                    onclick="BrowsePage.switchType('movie')">Movies</button>
                                <button class="browse__type-btn ${this.currentType === 'tv' ? 'active' : ''}"
                                    onclick="BrowsePage.switchType('tv')">TV Shows</button>
                            </div>
                            <select class="browse__sort-select" onchange="BrowsePage.changeSort(this.value)">
                                <option value="popularity.desc" ${this.currentSort === 'popularity.desc' ? 'selected' : ''}>Most Popular</option>
                                <option value="vote_average.desc" ${this.currentSort === 'vote_average.desc' ? 'selected' : ''}>Highest Rated</option>
                                <option value="primary_release_date.desc" ${this.currentSort === 'primary_release_date.desc' ? 'selected' : ''}>Newest</option>
                                <option value="revenue.desc" ${this.currentSort === 'revenue.desc' ? 'selected' : ''}>Highest Revenue</option>
                            </select>
                        </div>
                        <div class="genre-filters">
                            <button class="genre-pill ${!this.currentGenre ? 'active' : ''}"
                                onclick="BrowsePage.selectGenre(null)">All</button>
                            ${genrePills}
                        </div>
                    ` : ''}
                </div>
                <div class="content-grid" id="browse-grid">
                    ${Components.createSkeletonGrid(18)}
                </div>
                <div class="load-more-wrap" id="load-more-sentinel">
                    <div class="spinner" id="load-more-spinner" style="display:none"></div>
                </div>
            </div>
        `;
    },

    async _loadContent(append = false) {
        if (this.isLoading) return;
        this.isLoading = true;

        const spinner = document.getElementById('load-more-spinner');
        if (spinner) spinner.style.display = 'block';

        try {
            let data;
            if (this.currentType === 'bollywood') {
                data = await API.getBollywoodMovies(this.currentPage);
            } else if (this.currentType === 'hollywood') {
                data = await API.getHollywoodMovies(this.currentPage);
            } else {
                const params = {
                    sort_by: this.currentSort,
                    page: this.currentPage,
                    'vote_count.gte': this.currentSort === 'vote_average.desc' ? 200 : undefined,
                };

                if (this.currentGenre) {
                    params.with_genres = this.currentGenre;
                }
                data = await API.discover(this.currentType, params);
            }
            this.totalPages = data.total_pages || 1;

            const grid = document.getElementById('browse-grid');
            if (!grid) return;

            const cardsHtml = (data.results || []).map(item => {
                const mediaItem = { ...item, media_type: ['bollywood', 'hollywood'].includes(this.currentType) ? 'movie' : this.currentType };
                return Components.createMovieCard(mediaItem);
            }).join('');

            if (append) {
                grid.insertAdjacentHTML('beforeend', cardsHtml);
            } else {
                grid.innerHTML = cardsHtml;
            }

        } catch (error) {
            console.error('Load content error:', error);
        } finally {
            this.isLoading = false;
            if (spinner) spinner.style.display = 'none';
        }
    },

    _setupInfiniteScroll() {
        const sentinel = document.getElementById('load-more-sentinel');
        if (!sentinel) return;

        this._observer = new IntersectionObserver(async (entries) => {
            if (entries[0].isIntersecting && !this.isLoading && this.currentPage < this.totalPages) {
                this.currentPage++;
                await this._loadContent(true);
            }
        }, { threshold: 0.1 });

        this._observer.observe(sentinel);
    },

    selectGenre(genreId) {
        this.currentGenre = genreId;
        this.currentPage = 1;

        // Update active pill
        document.querySelectorAll('.genre-pill').forEach(p => {
            const pillGenreId = p.dataset.genreId ? parseInt(p.dataset.genreId) : null;
            p.classList.toggle('active', pillGenreId === genreId || (!genreId && !p.dataset.genreId));
        });

        // Update title
        const titleEl = document.querySelector('.browse__title');
        if (titleEl) {
            titleEl.textContent = genreId
                ? `${GenreMap[genreId] || 'Genre'} ${this.currentType === 'tv' ? 'TV Shows' : 'Movies'}`
                : `Browse ${this.currentType === 'tv' ? 'TV Shows' : 'Movies'}`;
        }

        this._loadContent(false);
    },

    switchType(type) {
        if (type === this.currentType) return;
        Router.navigate(`/browse/${type}`);
    },

    async changeSort(sortBy) {
        this.currentSort = sortBy;
        this.currentPage = 1;
        await this._loadContent(false);
    },

    destroy() {
        if (this._observer) {
            this._observer.disconnect();
            this._observer = null;
        }
    },
};
