/* ============================================================
   FlixStream — Watch / Player Page
   ============================================================ */

const WatchPage = {
    currentSource: 0,

    async render(type, id, season = null, episode = null) {
        const app = document.getElementById('app');
        this.currentSource = Storage.getPreferences().defaultServer || 0;

        // Build embed URL
        let embedUrl;
        if (type === 'tv' && season && episode) {
            embedUrl = CONFIG.getTVEmbedUrl(id, season, episode, this.currentSource);
        } else {
            embedUrl = CONFIG.getMovieEmbedUrl(id, this.currentSource);
        }

        // Show loading state first
        app.innerHTML = `
            <div class="watch-page page-enter">
                <div class="watch__player-wrap">
                    <div class="watch__player-loading">
                        <div class="spinner"></div>
                        <p>Loading player...</p>
                    </div>
                </div>
                <div class="watch__info">
                    <div class="skeleton skeleton-text" style="width:300px;height:24px;margin-bottom:12px"></div>
                    <div class="skeleton skeleton-text" style="width:200px;height:16px"></div>
                </div>
            </div>
        `;

        try {
            // Fetch details in parallel with showing the player
            const data = type === 'tv'
                ? await API.getTVDetails(id)
                : await API.getMovieDetails(id);

            const title = API.getTitle(data);
            const year = API.getYear(API.getReleaseDate(data));
            const rating = API.formatRating(data.vote_average);

            // Add to watch history
            Storage.addToHistory({
                ...data,
                media_type: type,
                season: season,
                episode: episode,
            });

            // TV specific data
            let seasonData = null;
            let episodeTitle = '';
            if (type === 'tv' && season && episode) {
                try {
                    seasonData = await API.getTVSeason(id, season);
                    const ep = seasonData.episodes ? seasonData.episodes.find(e => e.episode_number === parseInt(episode)) : null;
                    if (ep) episodeTitle = ep.name;
                } catch (e) {
                    console.warn('Could not load season data:', e);
                }
            }

            // Server buttons
            const serverBtns = CONFIG.EMBED_SOURCES.map((s, i) => `
                <button class="watch__server-btn ${i === this.currentSource ? 'active' : ''}"
                    data-index="${i}"
                    onclick="WatchPage.switchServer(${i}, '${type}', ${id}, ${season || 'null'}, ${episode || 'null'})">
                    ${s.name}
                </button>
            `).join('');

            // Episode navigation for TV
            let episodeNav = '';
            if (type === 'tv' && seasonData && seasonData.episodes) {
                const episodes = seasonData.episodes;
                const currentEp = parseInt(episode);
                const prevEp = currentEp > 1 ? currentEp - 1 : null;
                const nextEp = currentEp < episodes.length ? currentEp + 1 : null;
                const seasons = data.seasons ? data.seasons.filter(s => s.season_number > 0) : [];

                episodeNav = `
                    <div class="episode-selector">
                        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:16px">
                            <h3 class="section-title" style="font-size:1.1rem">Season ${season} • Episode ${episode}${episodeTitle ? `: ${episodeTitle}` : ''}</h3>
                            <div style="display:flex;gap:8px">
                                ${prevEp ? `<button class="btn btn-secondary btn-sm" onclick="App.navigateToWatch(${id}, 'tv', ${season}, ${prevEp})">← Prev</button>` : ''}
                                ${nextEp ? `<button class="btn btn-accent btn-sm" onclick="App.navigateToWatch(${id}, 'tv', ${season}, ${nextEp})">Next →</button>` : ''}
                            </div>
                        </div>
                        ${seasons.length > 1 ? `
                            <div class="season-tabs" style="margin-bottom:16px">
                                ${seasons.map(s => `
                                    <button class="season-tab ${s.season_number === parseInt(season) ? 'active' : ''}"
                                        onclick="WatchPage.loadSeasonEpisodes(${id}, ${s.season_number}, this)">
                                        S${s.season_number}
                                    </button>
                                `).join('')}
                            </div>
                        ` : ''}
                        <div id="watch-episodes-container">
                            <div class="episode-grid">
                                ${episodes.map(ep => {
                                    const stillUrl = ep.still_path ? CONFIG.getImageUrl(ep.still_path, 'backdrop_sm') : '';
                                    return `
                                        <div class="episode-card ${ep.episode_number === currentEp ? 'active' : ''}"
                                            onclick="App.navigateToWatch(${id}, 'tv', ${season}, ${ep.episode_number})">
                                            <div class="episode-card__image-container">
                                                ${stillUrl 
                                                    ? `<img class="episode-card__img" src="${stillUrl}" alt="${ep.name}" loading="lazy">` 
                                                    : `<div class="episode-card__img-placeholder">${Components.icons.film}</div>`}
                                                <div class="episode-card__play-btn">${Components.icons.play}</div>
                                                <div class="episode-card__number-badge">${ep.episode_number}</div>
                                            </div>
                                            <div class="episode-card__info">
                                                <div class="episode-card__title">${ep.name || `Episode ${ep.episode_number}`}</div>
                                                <div class="episode-card__meta">
                                                    ${ep.runtime ? `<span>${ep.runtime}m</span>` : ''}
                                                    ${ep.air_date ? `<span> • ${ep.air_date}</span>` : ''}
                                                    ${ep.vote_average ? `<span class="episode-card__vote"> • ⭐ ${API.formatRating(ep.vote_average)}</span>` : ''}
                                                </div>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    </div>
                `;
            }

            // Similar content
            const similar = data.recommendations && data.recommendations.results && data.recommendations.results.length > 0
                ? data.recommendations.results
                : (data.similar && data.similar.results ? data.similar.results : []);

            app.innerHTML = `
                <div class="watch-page page-enter">
                    <div class="watch__player-wrap">
                        <iframe
                            src="${embedUrl}"
                            allowfullscreen
                            allow="autoplay; encrypted-media; picture-in-picture"
                            referrerpolicy="origin"
                            loading="eager"
                        ></iframe>
                        ${Connect.roomId && Connect.isHost ? `
                            <div class="master-controls">
                                <div class="master-label">Master Sync</div>
                                <button class="master-btn ${!Connect.isPlaying ? 'paused' : ''}" 
                                    id="master-play-pause"
                                    onclick="Connect.togglePlayback()">
                                    ${Connect.isPlaying ? 
                                        '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>' : 
                                        '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'}
                                </button>
                                <button class="btn btn-secondary btn-xs" onclick="Connect.toggleChat()">Chat</button>
                            </div>
                        ` : ''}
                    </div>
                    <div class="watch__info">
                        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
                            <button class="btn btn-secondary btn-sm" onclick="Router.navigate('/${type}/${id}')">
                                ${Components.icons.back} Back to Details
                            </button>
                        </div>
                        <h1 class="watch__title">${title}</h1>
                        <div class="watch__meta">
                            <span class="hero__rating">${Components.icons.star} ${rating}</span>
                            <span>${year}</span>
                            ${type === 'tv' && season ? `<span>S${season} E${episode}</span>` : ''}
                        </div>
                        <p class="watch__overview">${data.overview || ''}</p>

                        <div class="watch__server-select" style="margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--glass-border);">
                            <div style="display:flex; flex-direction:column; gap:16px;">
                                <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
                                    <span class="watch__server-label" style="font-size:1.1rem; font-weight:700;">Server Selection</span>
                                    <button class="btn btn-accent btn-sm" onclick="WatchPage.tryNextServer('${type}', '${id}', ${season || 'null'}, ${episode || 'null'})">
                                        🚀 Try Next Server
                                    </button>
                                </div>
                                <div id="watch__server-grid" style="display:flex; gap:10px; flex-wrap:wrap;">
                                    ${CONFIG.EMBED_SOURCES.map((s, i) => `
                                        <div style="position:relative">
                                            <button class="watch__server-btn ${i === this.currentSource ? 'active' : ''}"
                                                data-index="${i}"
                                                id="server-btn-${i}"
                                                onclick="WatchPage.switchServer(${i}, '${type}', '${id}', ${season || 'null'}, ${episode || 'null'})">
                                                ${s.name}
                                            </button>
                                            <span id="server-status-${i}" style="position:absolute; top:-8px; right:-8px; font-size:0.6rem; padding:2px 6px; border-radius:10px; background:var(--bg-tertiary); color:var(--text-tertiary); border:1px solid var(--glass-border); pointer-events:none; white-space:nowrap;">
                                                Checking...
                                            </span>
                                        </div>
                                    `).join('')}
                                </div>
                                <div id="auto-status-note" style="font-size:0.75rem; color:var(--text-tertiary); margin-top:4px;">
                                    🔍 Auto-detecting the fastest servers for your region...
                                </div>
                            </div>
                        </div>

                        <div style="margin-top:20px; padding:20px; background:rgba(255,255,255,0.03); border-radius:12px; border-left:4px solid var(--accent-primary); display:flex; flex-direction:column; gap:12px;">
                            <div style="display:flex; align-items:center; gap:8px; color:var(--text-primary); font-weight:600;">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                                <span>Playback Issues? (Troubleshooting)</span>
                            </div>
                            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:16px; font-size:0.85rem; color:var(--text-secondary); line-height:1.6;">
                                <div style="background:rgba(229, 9, 20, 0.1); padding:10px; border-radius:8px; grid-column:span 2;">
                                    <div style="color:var(--accent-primary); font-weight:700; display:flex; align-items:center; gap:6px; margin-bottom:4px;">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10.27 2 3.84 7.73 8.59 1.25-6.21 6.05 1.47 8.56L10.27 21l-7.7 4.05 1.47-8.56-6.21-6.05 8.59-1.25L10.27 2Z"/></svg>
                                        <span>Pro Fix for "IP Address Not Found" Error:</span>
                                    </div>
                                    If you see a blank page or "Server IP address could not be found," your ISP is blocking the domain. 
                                    <strong>To fix this instantly:</strong> Change your device/router <strong>DNS to 8.8.8.8 (Google)</strong> or <strong>1.1.1.1 (Cloudflare)</strong>. 
                                    This almost always bypasses the block without needing a slow VPN!
                                </div>
                                <div>
                                    <strong>1. Switch Servers:</strong> If one server is slow or blocked, click the <strong>"Try Next Server"</strong> button above. <strong>Server 1 (Bypass)</strong> and <strong>Server 2 (Hub)</strong> are currently active.
                                </div>
                                <div>
                                    <strong>2. Cloud Options:</strong> Looking for <strong>UpCloud</strong>, <strong>AKCloud</strong>, or <strong>MegaCloud</strong>? These are all included in <strong>Server 3</strong> and <strong>Server 4</strong>. Just click the "Servers" icon <em>inside</em> the player.
                                </div>
                            </div>
                        </div>

                        <div style="margin-bottom:32px;"></div>
                        ${episodeNav}

                        ${similar.length > 0 ? `
                            <div style="margin-top:32px">
                                ${Components.createContentRow(
                                    'watch-similar',
                                    'You Might Also Like',
                                    similar.slice(0, 15).map(s => ({ ...s, media_type: s.media_type || type })),
                                    ''
                                )}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;

            // Update page title
            document.title = `${title} — FlixStream`;

            // Run auto-check in background
            setTimeout(() => this.autoCheckServers(type, id, season, episode), 500);

            // If streaming, attach it
            if (Connect.roomId) {
                // For Cineby style, we just ensure the overlay state is correct on load
                Connect.setPlaybackLocal(Connect.isPlaying);
                
                if (Connect.isHost) {
                    // Host sets the location for everyone
                    Connect.broadcast({ type: 'sync-nav', path: window.location.hash });
                }
            }

        } catch (error) {
            console.error('Watch page error:', error);
            // Still show the player even if metadata fails
            app.innerHTML = `
                <div class="watch-page page-enter">
                    <div class="watch__player-wrap">
                        <iframe
                            src="${embedUrl}"
                            allowfullscreen
                            allow="autoplay; encrypted-media; picture-in-picture"
                            referrerpolicy="origin"
                        ></iframe>
                    </div>
                    <div class="watch__info">
                        <button class="btn btn-secondary btn-sm" onclick="history.back()">
                            ${Components.icons.back} Go Back
                        </button>
                        <p style="margin-top:16px;color:var(--text-secondary)">Could not load details for this title.</p>
                    </div>
                </div>
            `;
        }
    },

    switchServer(index, type, id, season, episode) {
        this.currentSource = index;
        Storage.setPreference('defaultServer', index);

        let embedUrl;
        if (type === 'tv' && season && episode) {
            embedUrl = CONFIG.getTVEmbedUrl(id, season, episode, index);
        } else {
            embedUrl = CONFIG.getMovieEmbedUrl(id, index);
        }

        // Update iframe
        const iframe = document.querySelector('.watch__player-wrap iframe');
        if (iframe) {
            // Show loading overlay again
            const wrapper = document.querySelector('.watch__player-wrap');
            const placeholder = document.createElement('div');
            placeholder.className = 'watch__player-loading';
            placeholder.innerHTML = '<div class="spinner"></div><p>Switching server...</p>';
            
            const existingLoading = wrapper.querySelector('.watch__player-loading');
            if (!existingLoading) wrapper.appendChild(placeholder);
            
            iframe.src = embedUrl;
            
            // Remove loading when iframe loads (best effort)
            iframe.onload = () => {
                if (placeholder.parentNode) placeholder.remove();
            };
            // Safety timeout
            setTimeout(() => {
                if (placeholder.parentNode) placeholder.remove();
            }, 3000);
        }

        // Update active button
        document.querySelectorAll('.watch__server-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.index) === index);
        });

        Components.showToast(`Switched to ${CONFIG.EMBED_SOURCES[index].name}`, 'info');
    },

    tryNextServer(type, id, season, episode) {
        let nextIndex = this.currentSource + 1;
        if (nextIndex >= CONFIG.EMBED_SOURCES.length) {
            nextIndex = 0;
        }
        this.switchServer(nextIndex, type, id, season, episode);
    },

    async autoCheckServers(type, id, season, episode) {
        const statuses = await Promise.all(CONFIG.EMBED_SOURCES.map(async (s, i) => {
            const statusEl = document.getElementById(`server-status-${i}`);
            const btnEl = document.getElementById(`server-btn-${i}`);
            
            if (!statusEl || !btnEl) return { index: i, working: false };
            
            try {
                // Try to "ping" the domain
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 4000);
                
                // Use a no-cors fetch to an asset or the base URL to check reachability
                const testUrl = s.base.split('/embed')[0]; 
                await fetch(testUrl, { mode: 'no-cors', signal: controller.signal });
                
                clearTimeout(timeoutId);
                
                if (statusEl) {
                    statusEl.innerText = 'Online';
                    statusEl.style.background = 'rgba(76, 175, 80, 0.2)';
                    statusEl.style.color = '#81c784';
                    statusEl.style.borderColor = 'rgba(76, 175, 80, 0.3)';
                }
                return { index: i, working: true };
            } catch (e) {
                if (statusEl) {
                    statusEl.innerText = 'Blocked';
                    statusEl.style.background = 'rgba(244, 67, 54, 0.1)';
                    statusEl.style.color = '#e57373';
                    statusEl.style.borderColor = 'rgba(244, 67, 54, 0.2)';
                    btnEl.style.opacity = '0.6';
                }
                return { index: i, working: false };
            }
        }));

        const note = document.getElementById('auto-status-note');
        if (note) {
            const workingCount = statuses.filter(s => s.working).length;
            note.innerHTML = workingCount > 0 
                ? `✅ Found ${workingCount} working servers for your network.`
                : `⚠️ All servers might be blocked by your ISP. See DNS Fix below!`;
        }

        // If current server is blocked, auto-switch to first working one
        if (!statuses[this.currentSource].working) {
            const firstWorking = statuses.find(s => s.working);
            if (firstWorking && firstWorking.index !== this.currentSource) {
                Components.showToast(`Auto-switching to working server: ${CONFIG.EMBED_SOURCES[firstWorking.index].name}`, 'success');
                this.switchServer(firstWorking.index, type, id, season, episode);
            }
        }
    },

    async loadSeasonEpisodes(tvId, seasonNumber, btnEl) {
        // Update active tab
        document.querySelectorAll('.season-tab').forEach(t => t.classList.remove('active'));
        if (btnEl) btnEl.classList.add('active');

        const container = document.getElementById('watch-episodes-container');
        if (!container) return;
        container.innerHTML = '<div class="spinner" style="margin:24px auto"></div>';

        try {
            const season = await API.getTVSeason(tvId, seasonNumber);
            const episodes = season.episodes || [];

            container.innerHTML = `
                <div class="episode-grid">
                    ${episodes.map(ep => {
                        const stillUrl = ep.still_path ? CONFIG.getImageUrl(ep.still_path, 'backdrop_sm') : '';
                        return `
                        <div class="episode-card" onclick="App.navigateToWatch(${tvId}, 'tv', ${seasonNumber}, ${ep.episode_number})">
                            <div class="episode-card__image-container">
                                ${stillUrl 
                                    ? `<img class="episode-card__img" src="${stillUrl}" alt="${ep.name}" loading="lazy">` 
                                    : `<div class="episode-card__img-placeholder">${Components.icons.film}</div>`}
                                <div class="episode-card__play-btn">${Components.icons.play}</div>
                                <div class="episode-card__number-badge">${ep.episode_number}</div>
                            </div>
                            <div class="episode-card__info">
                                <div class="episode-card__title">${ep.name || `Episode ${ep.episode_number}`}</div>
                                <div class="episode-card__meta">
                                    ${ep.runtime ? `<span>${ep.runtime}m</span>` : ''}
                                    ${ep.vote_average ? `<span class="episode-card__vote"> • ⭐ ${API.formatRating(ep.vote_average)}</span>` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                    }).join('')}
                </div>
            `;
        } catch (error) {
            container.innerHTML = '<p style="color:var(--text-secondary);padding:20px">Could not load episodes.</p>';
        }
    },
};
