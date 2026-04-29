/* ============================================================
   CatWatch — Reusable UI Components
   ============================================================ */

const Components = {

    // --- SVG Icons ---
    icons: {
        play: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
        plus: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>',
        check: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
        info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
        star: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
        chevronLeft: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
        chevronRight: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
        search: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
        bookmark: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>',
        bookmarkFilled: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>',
        back: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>',
        film: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M3 7.5h4"/><path d="M3 12h18"/><path d="M3 16.5h4"/><path d="M17 3v18"/><path d="M17 7.5h4"/><path d="M17 16.5h4"/></svg>',
        clock: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
        calendar: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>',
        trash: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>',
    },

    // --- Movie Card ---
    createMovieCard(item, wide = false) {
        const title = API.getTitle(item);
        const year = API.getYear(API.getReleaseDate(item));
        const rating = API.formatRating(item.vote_average);
        const posterUrl = item.poster_path
            ? CONFIG.getImageUrl(item.poster_path, wide ? 'backdrop_sm' : 'poster_md')
            : '';
        const backdropUrl = wide && item.backdrop_path
            ? CONFIG.getImageUrl(item.backdrop_path, 'backdrop_sm')
            : '';
        const mediaType = API.getMediaType(item);
        const imgSrc = wide ? (backdropUrl || posterUrl) : posterUrl;
        const wideClass = wide ? 'movie-card--wide' : '';

        return `
            <div class="movie-card ${wideClass}" data-id="${item.id}" data-type="${mediaType}" onclick="App.navigateToDetail(${item.id}, '${mediaType}')" onmouseenter="Components.handleCardHover(this, ${item.id}, '${mediaType}')" onmouseleave="Components.handleCardLeave(this)">
                <div class="movie-card__poster-wrap">
                    ${imgSrc
                        ? `<img class="movie-card__poster" src="${imgSrc}" alt="${title}" loading="lazy" onerror="this.style.display='none'">`
                        : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--text-tertiary)">${this.icons.film}</div>`
                    }
                    <div class="movie-card__trailer-container"></div>
                    <div class="movie-card__overlay"></div>
                    <div class="movie-card__play">${this.icons.play}</div>
                    ${item.vote_average ? `
                        <div class="movie-card__rating">
                            ${this.icons.star}
                            <span>${rating}</span>
                        </div>
                    ` : ''}
                    <div class="movie-card__quality">HD</div>
                </div>
                <div class="movie-card__title" title="${title}">${title}</div>
                <div class="movie-card__year">${year}${mediaType === 'tv' ? ' • TV' : ''}</div>
            </div>
        `;
    },

    handleCardHover(cardEl, id, type) {
        // Clear pending leave
        if (cardEl.dataset.leaveTimeout) {
            clearTimeout(cardEl.dataset.leaveTimeout);
        }

        cardEl.dataset.isHovered = 'true';

        // 800ms hover delay
        const timeout = setTimeout(async () => {
            const container = cardEl.querySelector('.movie-card__trailer-container');
            if (!container || container.innerHTML !== '') {
                if (container && container.innerHTML !== '') container.classList.add('visible');
                return;
            }

            try {
                const details = type === 'tv' ? await API.getTVDetails(id) : await API.getMovieDetails(id);
                const trailerKey = API.getTrailerKey(details.videos);

                if (trailerKey && cardEl.dataset.isHovered === 'true') {
                    container.innerHTML = `
                        <iframe 
                            class="movie-card__trailer-iframe"
                            src="https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&loop=1&playlist=${trailerKey}" 
                            frameborder="0" 
                            allow="autoplay; encrypted-media" 
                            allowfullscreen>
                        </iframe>
                    `;
                    container.classList.add('visible');
                }
            } catch (e) {
                console.error("Trailer load error", e);
            }
        }, 800);
        
        cardEl.dataset.hoverTimeout = timeout;
    },

    handleCardLeave(cardEl) {
        cardEl.dataset.isHovered = 'false';
        
        if (cardEl.dataset.hoverTimeout) {
            clearTimeout(cardEl.dataset.hoverTimeout);
        }

        const container = cardEl.querySelector('.movie-card__trailer-container');
        if (container) {
            container.classList.remove('visible');
            cardEl.dataset.leaveTimeout = setTimeout(() => {
                container.innerHTML = '';
            }, 300);
        }
    },

    // --- Content Row (horizontal scroll) ---
    createContentRow(id, title, items, seeAllLink = '', wide = false) {
        const cardsHtml = items.map(item => this.createMovieCard(item, wide)).join('');

        return `
            <section class="content-section reveal" id="section-${id}">
                <div class="section-header">
                    <h2 class="section-title">${title}</h2>
                    ${seeAllLink ? `<a href="${seeAllLink}" class="section-see-all">See All →</a>` : ''}
                </div>
                <div class="content-row">
                    <button class="content-row__arrow content-row__arrow--left" onclick="Components.scrollRow('${id}', -1)">
                        ${this.icons.chevronLeft}
                    </button>
                    <div class="content-row__scroll" id="row-${id}">
                        ${cardsHtml}
                    </div>
                    <button class="content-row__arrow content-row__arrow--right" onclick="Components.scrollRow('${id}', 1)">
                        ${this.icons.chevronRight}
                    </button>
                </div>
            </section>
        `;
    },

    // Scroll a row left/right
    scrollRow(id, direction) {
        const row = document.getElementById(`row-${id}`);
        if (!row) return;
        const scrollAmount = row.clientWidth * 0.8;
        row.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    },

    // --- Hero Banner ---
    createHeroBanner(movies) {
        const slidesHtml = movies.slice(0, CONFIG.HERO_SLIDE_COUNT).map((movie, i) => {
            const title = API.getTitle(movie);
            const backdropUrl = CONFIG.getImageUrl(movie.backdrop_path, 'backdrop_original');
            const rating = API.formatRating(movie.vote_average);
            const year = API.getYear(API.getReleaseDate(movie));
            const mediaType = API.getMediaType(movie);
            
            // Split title for artistic layout (e.g., "The Witcher" -> "THE" and "WITCHER")
            const titleParts = title.toUpperCase().split(' ');
            const topText = titleParts[0] || '';
            const bottomText = titleParts.slice(1).join(' ') || '';

            // Get some thumbnails for the pills
            const pillMovies = movies.slice(1, 4).map(m => ({
                id: m.id,
                type: API.getMediaType(m),
                img: CONFIG.getImageUrl(m.backdrop_path, 'backdrop_sm'),
                title: API.getTitle(m)
            }));

            return `
                <div class="hero__slide ${i === 0 ? 'active' : ''}" data-index="${i}" data-backdrop="${backdropUrl}" onclick="App.navigateToWatch(${movie.id}, '${mediaType}')">
                    <div class="hero__art-container">
                        <img class="hero__art-image" src="${backdropUrl}" alt="${title}" loading="${i === 0 ? 'eager' : 'lazy'}">
                        <div class="hero__brush-mask"></div>
                    </div>
                    
                    <div class="hero__content-artistic">
                        <div class="hero__headline">
                            <span class="hero__headline-top">${topText}</span>
                            ${bottomText ? `
                                <span class="hero__headline-bottom">
                                    <span class="hero__headline-rest">${bottomText}</span>
                                </span>
                            ` : ''}
                        </div>

                        <div class="hero__watch-circle" onclick="App.navigateToWatch(${movie.id}, '${mediaType}')">
                            <div class="hero__watch-ring"></div>
                            <div class="hero__watch-main">
                                <span class="hero__watch-label">NEW SEASON</span>
                                <h2 class="hero__watch-title">WATCH<br>NOW</h2>
                                <span class="hero__watch-extra">ON HICAT MOVIES</span>
                            </div>
                        </div>
                    </div>

                    <div class="hero__pills">
                        ${pillMovies.map((pm, idx) => `
                            <div class="hero__pill hero__pill--${idx + 1}" onclick="App.navigateToDetail(${pm.id}, '${pm.type}')">
                                <img src="${pm.img}" class="hero__pill-img" alt="${pm.title}">
                                <span>${pm.title.length > 15 ? pm.title.slice(0, 15) + '...' : pm.title}</span>
                            </div>
                        `).join('')}
                    </div>

                    <div class="hero__scroll-indicator">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m7 13 5 5 5-5M7 6l5 5 5-5"/></svg>
                        <div class="hero__scroll-line"></div>
                    </div>

                    <div class="hero__info-footer">
                        <div class="hero__info-item">
                            <h4>Released</h4>
                            <p>${year}</p>
                        </div>
                        <div class="hero__info-item">
                            <h4>Rating</h4>
                            <p>${rating} / 10</p>
                        </div>
                        <div class="hero__info-item">
                            <h4>Cast</h4>
                            <p>Featured Stars</p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        const dotsHtml = movies.slice(0, CONFIG.HERO_SLIDE_COUNT).map((_, i) => `
            <div class="hero__dot ${i === 0 ? 'active' : ''}" data-index="${i}" onclick="Components.setHeroSlide(${i})"></div>
        `).join('');

        return `
            <div class="hero hero--artistic" id="hero-banner">
                ${slidesHtml}
                <div class="hero__dots" style="bottom: 20px; left: 50%; transform: translateX(-50%);">
                    ${dotsHtml}
                </div>
            </div>
        `;
    },

    // Hero slide management
    _heroInterval: null,

    startHeroRotation() {
        this.stopHeroRotation();
        this._heroInterval = setInterval(() => {
            const slides = document.querySelectorAll('.hero__slide');
            const current = document.querySelector('.hero__slide.active');
            if (!current || slides.length <= 1) return;
            const currentIdx = parseInt(current.dataset.index);
            const nextIdx = (currentIdx + 1) % slides.length;
            this.setHeroSlide(nextIdx);
        }, CONFIG.HERO_ROTATE_INTERVAL);
    },

    stopHeroRotation() {
        if (this._heroInterval) {
            clearInterval(this._heroInterval);
            this._heroInterval = null;
        }
    },

    setHeroSlide(index) {
        document.querySelectorAll('.hero__slide').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.hero__dot').forEach(d => d.classList.remove('active'));
        const slide = document.querySelector(`.hero__slide[data-index="${index}"]`);
        const dot = document.querySelector(`.hero__dot[data-index="${index}"]`);
        if (slide) {
            slide.classList.add('active');
            // Trigger dynamic color update
            const backdrop = slide.dataset.backdrop;
            if (backdrop) App.updateDynamicTheme(backdrop);
        }
        if (dot) dot.classList.add('active');
    },

    // --- Skeleton Loading ---
    createSkeletonRow(count = 7) {
        const cards = Array(count).fill('').map(() => `
            <div class="skeleton-card">
                <div class="skeleton skeleton-poster"></div>
                <div class="skeleton skeleton-text" style="width:80%"></div>
                <div class="skeleton skeleton-text skeleton-text--short"></div>
            </div>
        `).join('');

        return `
            <section class="content-section">
                <div class="section-header">
                    <div class="skeleton skeleton-text" style="width:200px;height:24px"></div>
                </div>
                <div class="content-row">
                    <div class="content-row__scroll">${cards}</div>
                </div>
            </section>
        `;
    },

    createSkeletonHero() {
        return '<div class="skeleton skeleton-hero"></div>';
    },

    createSkeletonGrid(count = 12) {
        return Array(count).fill('').map(() => `
            <div>
                <div class="skeleton skeleton-poster" style="aspect-ratio:2/3;border-radius:var(--radius-lg);margin-bottom:10px"></div>
                <div class="skeleton skeleton-text" style="width:80%"></div>
                <div class="skeleton skeleton-text skeleton-text--short"></div>
            </div>
        `).join('');
    },

    // --- Cast Card ---
    createCastCard(person) {
        const imgUrl = person.profile_path
            ? CONFIG.getImageUrl(person.profile_path, 'profile_sm')
            : '';

        return `
            <div class="cast-card">
                <div class="cast-card__image-wrap">
                    ${imgUrl
                        ? `<img class="cast-card__image" src="${imgUrl}" alt="${person.name}" loading="lazy">`
                        : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--bg-tertiary);color:var(--text-tertiary);font-size:2rem">${person.name ? person.name[0] : '?'}</div>`
                    }
                </div>
                <div class="cast-card__name">${person.name}</div>
                <div class="cast-card__character">${person.character || person.job || ''}</div>
            </div>
        `;
    },

    // --- Genre Pill ---
    createGenrePill(genre, active = false) {
        return `
            <button class="genre-pill ${active ? 'active' : ''}" data-genre-id="${genre.id}" onclick="App.filterByGenre(${genre.id})">
                ${genre.name}
            </button>
        `;
    },

    // --- Toast Notification ---
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.innerHTML = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // --- Empty State ---
    createEmptyState(title, text, buttonText = '', buttonLink = '') {
        return `
            <div class="empty-state">
                <div class="empty-state__icon">${this.icons.film}</div>
                <h3 class="empty-state__title">${title}</h3>
                <p class="empty-state__text">${text}</p>
                ${buttonText ? `<a href="${buttonLink}" class="btn btn-accent">${buttonText}</a>` : ''}
            </div>
        `;
    },

    // --- Trailer Modal ---
    showTrailer(videoKey) {
        const modal = document.createElement('div');
        modal.className = 'trailer-modal';
        modal.innerHTML = `
            <div class="trailer-modal__backdrop" onclick="this.parentElement.remove()"></div>
            <div class="trailer-modal__content">
                <button class="trailer-modal__close" onclick="this.closest('.trailer-modal').remove()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
                <iframe src="https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
            </div>
        `;
        document.body.appendChild(modal);

        // Close on Escape
        const closeOnEsc = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', closeOnEsc);
            }
        };
        document.addEventListener('keydown', closeOnEsc);
    },

    // --- Scroll Reveal Observer ---
    initScrollReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    },
    // --- Search Item ---
    createSearchItem(item) {
        const title = API.getTitle(item);
        const year = API.getYear(API.getReleaseDate(item));
        const type = API.getMediaType(item);
        const imgUrl = item.poster_path || item.profile_path
            ? CONFIG.getImageUrl(item.poster_path || item.profile_path, 'poster_sm')
            : '';

        return `
            <div class="search-item" onclick="App.navigateToDetail(${item.id}, '${type}')">
                <img class="search-item__poster" src="${imgUrl}" alt="${title}" onerror="this.src='https://via.placeholder.com/40x60?text=?'">
                <div class="search-item__info">
                    <div class="search-item__title">${title}</div>
                    <div class="search-item__meta">${year} • ${type.toUpperCase()}</div>
                </div>
            </div>
        `;
    },
};

// Genre ID to Name map (TMDB standard IDs)
const GenreMap = {
    28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
    99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
    27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance',
    878: 'Sci-Fi', 10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
    // TV genres
    10759: 'Action & Adventure', 10762: 'Kids', 10763: 'News', 10764: 'Reality',
    10765: 'Sci-Fi & Fantasy', 10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics',
};
