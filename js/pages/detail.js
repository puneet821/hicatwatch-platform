/* ============================================================
   FlixStream — Movie/TV Detail Page
   ============================================================ */

const DetailPage = {
    async render(type, id) {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="page-enter detail-page">
                <div class="detail__backdrop-wrap">
                    <div class="skeleton" style="width:100%;height:100%"></div>
                </div>
            </div>
        `;

        try {
            const data = type === 'tv'
                ? await API.getTVDetails(id)
                : await API.getMovieDetails(id);

            const title = API.getTitle(data);
            const year = API.getYear(API.getReleaseDate(data));
            const rating = API.formatRating(data.vote_average);
            const runtime = type === 'movie'
                ? API.formatRuntime(data.runtime)
                : (data.episode_run_time && data.episode_run_time[0] ? API.formatRuntime(data.episode_run_time[0]) : '');
            const posterUrl = CONFIG.getImageUrl(data.poster_path, 'poster_lg');
            const backdropUrl = CONFIG.getImageUrl(data.backdrop_path, 'backdrop_original');
            const trailerKey = API.getTrailerKey(data.videos);
            const isInWatchlist = Storage.isInWatchlist(data.id, type);
            const mediaType = type;

            // Cast
            const cast = data.credits && data.credits.cast
                ? data.credits.cast.slice(0, 15)
                : [];

            // Similar / Recommendations
            const similar = data.recommendations && data.recommendations.results && data.recommendations.results.length > 0
                ? data.recommendations.results
                : (data.similar && data.similar.results ? data.similar.results : []);

            // Genres
            const genres = data.genres || [];

            // TV specific
            const seasons = type === 'tv' ? (data.seasons || []).filter(s => s.season_number > 0) : [];

            let html = `
                <div class="page-enter detail-page">
                    <div class="detail__backdrop-wrap">
                        ${backdropUrl
                            ? `<img class="detail__backdrop" src="${backdropUrl}" alt="${title}">`
                            : ''}
                        <div class="detail__backdrop-gradient"></div>
                    </div>
                    <div class="detail__content">
                        <div class="detail__grid">
                            <div>
                                ${posterUrl
                                    ? `<img class="detail__poster" src="${posterUrl}" alt="${title}">`
                                    : `<div class="detail__poster" style="background:var(--bg-tertiary);display:flex;align-items:center;justify-content:center">${Components.icons.film}</div>`
                                }
                            </div>
                            <div class="detail__info">
                                <div class="detail__genres">
                                    ${genres.map(g => `<span class="genre-pill" onclick="Router.navigate('/genre/${g.id}')">${g.name}</span>`).join('')}
                                </div>
                                <h1 class="detail__title">${title}</h1>
                                <div class="detail__meta">
                                    <span class="detail__meta-item hero__rating">${Components.icons.star} ${rating}</span>
                                    <span class="detail__meta-item">${Components.icons.calendar} ${year}</span>
                                    ${runtime ? `<span class="detail__meta-item">${Components.icons.clock} ${runtime}</span>` : ''}
                                    ${type === 'tv' && data.number_of_seasons ? `<span class="detail__meta-item">${data.number_of_seasons} Season${data.number_of_seasons > 1 ? 's' : ''}</span>` : ''}
                                    ${data.status ? `<span class="detail__meta-item">${data.status}</span>` : ''}
                                </div>
                                ${data.tagline ? `<p style="color:var(--text-tertiary);font-style:italic;margin-bottom:16px;font-size:0.95rem">"${data.tagline}"</p>` : ''}
                                <p class="detail__overview">${data.overview || 'No overview available.'}</p>
                                <div class="detail__actions">
                                    <button class="btn btn-accent" onclick="App.navigateToWatch('${data.id}', '${mediaType}'${type === 'tv' ? ', 1, 1' : ''})">
                                        ${Components.icons.play} Watch Now
                                    </button>
                                    ${trailerKey ? `
                                        <button class="btn btn-secondary" onclick="Components.showTrailer('${trailerKey}')">
                                            ${Components.icons.play} Trailer
                                        </button>
                                    ` : ''}
                                    <button class="btn-icon ${isInWatchlist ? 'active' : ''}" id="watchlist-btn" data-id="${data.id}" data-type="${mediaType}" onclick="DetailPage.toggleWatchlist(this)">
                                        ${isInWatchlist ? Components.icons.check : Components.icons.plus}
                                    </button>
                                </div>
                            </div>
                        </div>

                        ${type === 'tv' && seasons.length > 0 ? `
                            <div class="episode-selector" style="margin-top:48px">
                                <h2 class="section-title" style="margin-bottom:20px">Seasons & Episodes</h2>
                                <div class="season-tabs">
                                    ${seasons.map(s => `
                                        <button class="season-tab ${s.season_number === 1 ? 'active' : ''}"
                                            data-season="${s.season_number}"
                                            onclick="DetailPage.loadSeason(${data.id}, ${s.season_number}, this)">
                                            Season ${s.season_number}
                                        </button>
                                    `).join('')}
                                </div>
                                <div id="episodes-container">
                                    <div class="spinner" style="margin:24px auto"></div>
                                </div>
                            </div>
                        ` : ''}

                        ${cast.length > 0 ? `
                            <div class="cast-section">
                                <h2 class="section-title" style="margin-bottom:20px">Cast</h2>
                                <div class="cast-row">
                                    ${cast.map(p => Components.createCastCard(p)).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>

                    ${similar.length > 0 ? `
                        <div style="margin-top:48px">
                            ${Components.createContentRow(
                                'similar',
                                'You Might Also Like',
                                similar.slice(0, 15).map(s => ({ ...s, media_type: s.media_type || mediaType })),
                                ''
                            )}
                        </div>
                    ` : ''}
                </div>
            `;

            app.innerHTML = html;

            // Store current data for watchlist toggle
            this._currentData = { ...data, media_type: mediaType };

            // Load first season's episodes for TV
            if (type === 'tv' && seasons.length > 0) {
                this.loadSeason(id, 1);
            }

            // Init scroll reveal
            setTimeout(() => Components.initScrollReveal(), 100);

        } catch (error) {
            console.error('Detail page error:', error);
            app.innerHTML = Components.createEmptyState(
                'Content Not Found',
                'Could not load this title. It may not be available.',
                'Go Home',
                '#/'
            );
        }
    },

    async loadSeason(tvId, seasonNumber, btnEl) {
        // Update active tab
        if (btnEl) {
            document.querySelectorAll('.season-tab').forEach(t => t.classList.remove('active'));
            btnEl.classList.add('active');
        }

        const container = document.getElementById('episodes-container');
        if (!container) return;
        container.innerHTML = '<div class="spinner" style="margin:24px auto"></div>';

        try {
            const season = await API.getTVSeason(tvId, seasonNumber);
            const episodes = season.episodes || [];

            if (episodes.length === 0) {
                container.innerHTML = '<p style="color:var(--text-secondary);padding:20px">No episodes available.</p>';
                return;
            }

            container.innerHTML = `
                <div class="episode-grid">
                    ${episodes.map(ep => `
                        <div class="episode-card" onclick="App.navigateToWatch(${tvId}, 'tv', ${seasonNumber}, ${ep.episode_number})">
                            <div class="episode-card__number">${ep.episode_number}</div>
                            <div class="episode-card__info">
                                <div class="episode-card__title">${ep.name || `Episode ${ep.episode_number}`}</div>
                                <div class="episode-card__meta">
                                    ${ep.runtime ? `${ep.runtime}m` : ''}
                                    ${ep.air_date ? ` • ${ep.air_date}` : ''}
                                    ${ep.vote_average ? ` • ⭐ ${API.formatRating(ep.vote_average)}` : ''}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } catch (error) {
            container.innerHTML = '<p style="color:var(--text-secondary);padding:20px">Could not load episodes.</p>';
        }
    },

    toggleWatchlist(btn) {
        const id = parseInt(btn.dataset.id);
        const type = btn.dataset.type;

        if (Storage.isInWatchlist(id, type)) {
            Storage.removeFromWatchlist(id, type);
            btn.classList.remove('active');
            btn.innerHTML = Components.icons.plus;
            Components.showToast('Removed from watchlist', 'info');
        } else {
            if (this._currentData) {
                Storage.addToWatchlist(this._currentData);
                btn.classList.add('active');
                btn.innerHTML = Components.icons.check;
                Components.showToast('Added to watchlist ✓', 'success');
            }
        }
    },
};
