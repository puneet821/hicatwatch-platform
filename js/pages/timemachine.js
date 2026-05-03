/* ============================================================
   CatWatch — Time Machine Page
   ============================================================ */

const TimeMachinePage = {
    decades: {
        '1980': { name: '1980s', start: '1980-01-01', end: '1989-12-31', theme: 'theme-80s', icon: '🎸' },
        '1990': { name: '1990s', start: '1990-01-01', end: '1999-12-31', theme: 'theme-90s', icon: '📼' },
        '2000': { name: '2000s', start: '2000-01-01', end: '2009-12-31', theme: 'theme-2000s', icon: '💿' },
        '2010': { name: '2010s', start: '2010-01-01', end: '2019-12-31', theme: 'theme-2010s', icon: '📱' },
    },
    currentDecade: '1980',
    page: 1,
    isLoading: false,

    async render() {
        const app = document.getElementById('app');
        
        app.innerHTML = `
            <div class="time-machine">
                <div class="time-machine__header">
                    <h1 class="time-machine__title">⏳ Time Machine</h1>
                    <p class="time-machine__subtitle">Travel back in time and discover movies from your favorite era.</p>
                </div>
                
                <div class="time-machine__dial-container">
                    <div class="time-machine__dial">
                        ${Object.keys(this.decades).map(year => `
                            <button class="time-machine__dial-btn ${this.currentDecade === year ? 'active' : ''}" data-year="${year}">
                                ${this.decades[year].icon} ${this.decades[year].name}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div class="time-machine__content container">
                    <div id="tm-grid" class="media-grid"></div>
                    <div id="tm-loader" class="loader-container">
                        <div class="spinner"></div>
                    </div>
                </div>
            </div>
        `;

        this.applyTheme(this.currentDecade);
        this.bindEvents();
        this.page = 1;
        await this.loadDecadeContent();
    },

    bindEvents() {
        const dialBtns = document.querySelectorAll('.time-machine__dial-btn');
        dialBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const year = e.currentTarget.dataset.year;
                if (this.currentDecade !== year) {
                    dialBtns.forEach(b => b.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                    this.currentDecade = year;
                    this.applyTheme(year);
                    this.page = 1;
                    this.loadDecadeContent(true);
                }
            });
        });

        // Infinite scroll
        this._scrollHandler = () => {
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 800) {
                if (!this.isLoading) {
                    this.page++;
                    this.loadDecadeContent();
                }
            }
        };
        window.addEventListener('scroll', this._scrollHandler, { passive: true });
    },

    applyTheme(year) {
        // Remove old themes
        Object.values(this.decades).forEach(d => document.body.classList.remove(d.theme));
        // Apply new theme
        document.body.classList.add(this.decades[year].theme);
    },

    async loadDecadeContent(clear = false) {
        if (this.isLoading) return;
        this.isLoading = true;

        const grid = document.getElementById('tm-grid');
        const loader = document.getElementById('tm-loader');
        
        if (clear) {
            grid.innerHTML = '';
        }
        loader.classList.remove('hidden');

        try {
            const decadeInfo = this.decades[this.currentDecade];
            const url = `${CONFIG.BASE_URL}/discover/movie?api_key=${CONFIG.API_KEY}&language=en-US&sort_by=popularity.desc&primary_release_date.gte=${decadeInfo.start}&primary_release_date.lte=${decadeInfo.end}&page=${this.page}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                const html = data.results.map(movie => Components.createMovieCard(movie, 'movie')).join('');
                grid.insertAdjacentHTML('beforeend', html);
            } else if (clear) {
                grid.innerHTML = '<p class="empty-state">No movies found for this era.</p>';
            }
        } catch (error) {
            console.error('Error loading time machine content:', error);
            if (clear) {
                grid.innerHTML = '<p class="empty-state">Failed to load time machine content.</p>';
            }
        } finally {
            this.isLoading = false;
            loader.classList.add('hidden');
        }
    },

    destroy() {
        // Clean up themes
        Object.values(this.decades).forEach(d => document.body.classList.remove(d.theme));
        
        if (this._scrollHandler) {
            window.removeEventListener('scroll', this._scrollHandler);
        }
    }
};
