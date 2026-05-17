/* ============================================================
   CatWatch — Live Sports & Cricket
   ============================================================ */

const SportsPage = {
    hls: null,
    matches: [],
    currentMatchIndex: 0,
    currentServerIndex: 0,

    async render(type) {
        if (this.hls) {
            this.hls.destroy();
            this.hls = null;
        }

        const app = document.getElementById('app');
        
        if (type === 'cricket' || type === 'football' || type === 'tennis') {
            app.innerHTML = `
                <div style="display:flex; justify-content:center; align-items:center; min-height:50vh; color:var(--text-secondary);">
                    <div style="border: 4px solid rgba(255,255,255,0.1); border-top-color: var(--accent-color); border-radius:50%; width:40px; height:40px; animation: spin 1s linear infinite;"></div>
                </div>
            `;
            await this.loadMatches(type);
            this.renderSportType(app, type);
        } else {
            this.renderSportsHome(app);
        }
    },

    async loadMatches(type) {
        try {
            const res = await fetch('data/sports_matches.json');
            const data = await res.json();
            this.matches = (data.matches || []).filter(m => m.category === type);
        } catch (e) {
            console.error("Failed to load live sports matches", e);
            this.matches = [];
        }
    },

    renderSportsHome(app) {
        app.innerHTML = `
            <div class="sports-page page-enter">
                <section class="sports-hero">
                    <div class="sports-hero__content">
                        <h1 class="sports-title">Live Sports</h1>
                        <p class="sports-subtitle">Stream your favorite matches live in high definition.</p>
                    </div>
                </section>

                <section class="sports-grid-section">
                    <div class="sports-grid">
                        <div class="sports-card cricket-card" onclick="Router.navigate('/sports/cricket')">
                            <div class="sports-card__image">
                                <img src="images/cricket.png" alt="Cricket">
                                <div class="sports-card__overlay"></div>
                            </div>
                            <div class="sports-card__content">
                                <div class="sports-card__live-tag">LIVE</div>
                                <h3 class="sports-card__title">Cricket</h3>
                                <p class="sports-card__desc">Watch Live Cricket & IPL</p>
                                <div class="sports-card__action">
                                    <span>Watch Now</span>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
                                </div>
                            </div>
                        </div>

                        <div class="sports-card football-card" onclick="Router.navigate('/sports/football')">
                            <div class="sports-card__image">
                                <img src="images/football.png" alt="Football">
                                <div class="sports-card__overlay"></div>
                            </div>
                            <div class="sports-card__content">
                                <div class="sports-card__live-tag">LIVE</div>
                                <h3 class="sports-card__title">Football</h3>
                                <p class="sports-card__desc">Watch Live Football Matches</p>
                                <div class="sports-card__action">
                                    <span>Watch Now</span>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
                                </div>
                            </div>
                        </div>

                        <div class="sports-card tennis-card" onclick="Router.navigate('/sports/tennis')">
                            <div class="sports-card__image">
                                <img src="images/tennis.png" alt="Tennis">
                                <div class="sports-card__overlay"></div>
                            </div>
                            <div class="sports-card__content">
                                <div class="sports-card__live-tag">LIVE</div>
                                <h3 class="sports-card__title">Tennis</h3>
                                <p class="sports-card__desc">Watch Live Tennis Slams</p>
                                <div class="sports-card__action">
                                    <span>Watch Now</span>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        `;
    },

    renderSportType(app, type) {
        const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
        
        if (this.matches.length === 0) {
            app.innerHTML = `
                <div class="cricket-page page-enter">
                    <div class="stream-container">
                        <div class="stream-header">
                            <button class="back-btn" onclick="Router.navigate('/sports')">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
                                <span>Back to Sports</span>
                            </button>
                            <div class="stream-info">
                                <h1 class="stream-title">Live ${capitalizedType}</h1>
                            </div>
                        </div>
                        <div class="glass" style="padding: 60px; text-align: center; border-radius: 16px; margin-top: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; border: 1px solid rgba(255,255,255,0.05);">
                            <div style="background: rgba(255,255,255,0.03); padding: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.05);">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            </div>
                            <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--text-secondary);">No Live Matches</h2>
                            <p style="color: var(--text-tertiary); max-width: 400px; line-height: 1.6;">There are no live ${type} matches scheduled at the moment. Please check back during live tournament hours!</p>
                            <button class="btn btn-secondary btn-sm" onclick="Router.navigate('/sports')" style="margin-top: 12px;">
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            `;
            return;
        }

        const match = this.matches[this.currentMatchIndex];

        app.innerHTML = `
            <div class="cricket-page page-enter">
                <div class="stream-container" style="max-width: 1200px; margin: 0 auto;">
                    <div class="stream-header">
                        <button class="back-btn" onclick="Router.navigate('/sports')">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
                            <span>Back to Sports</span>
                        </button>
                        <div class="stream-info">
                            <div class="live-indicator">
                                <span class="live-dot"></span>
                                LIVE
                            </div>
                            <h1 class="stream-title">${capitalizedType} Live Stream</h1>
                        </div>
                        <div class="stream-actions">
                            <button class="btn-refresh" onclick="SportsPage.refreshMatches('${type}')">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
                            </button>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 320px; gap: 24px; margin-top: 20px;" class="sports-layout-grid">
                        
                        <!-- Left Side: Player -->
                        <div class="sports-left-column">
                            <div id="sports-media-container" class="video-player-wrapper glass" style="background:#000; aspect-ratio: 16/9; display:flex; align-items:center; justify-content:center; border-radius:12px; overflow:hidden; position:relative; border: 1px solid rgba(255,255,255,0.05);">
                                <!-- Loaded dynamically -->
                            </div>

                            <div class="stream-details" style="display: grid; grid-template-columns: 1fr; gap: 16px; margin-top: 20px;">
                                <div class="detail-card glass" style="padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                                    <h3 style="margin-bottom: 12px; font-size: 1rem; font-weight: 600; color: var(--text-secondary);">Select Stream Server</h3>
                                    <div class="sports-servers-list" style="display:flex; flex-wrap:wrap; gap:10px;">
                                        ${match.servers.map((srv, idx) => `
                                            <button class="server-btn ${idx === this.currentServerIndex ? 'active' : ''}" onclick="SportsPage.switchServer(${idx})" style="padding: 10px 16px; border-radius: 8px; border: 1px solid ${idx === this.currentServerIndex ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)'}; background: ${idx === this.currentServerIndex ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)'}; color: #fff; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: inherit;">
                                                ${srv.name}
                                            </button>
                                        `).join('')}
                                    </div>
                                </div>
                                
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                                    <div class="detail-card glass" style="padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                                        <h3 style="margin-bottom: 8px; font-size: 1rem; font-weight: 600; color: var(--text-secondary);">Current Event</h3>
                                        <p style="color: var(--text-tertiary); font-size: 0.9rem;">${match.title}</p>
                                    </div>
                                    <div class="detail-card glass" style="padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                                        <h3 style="margin-bottom: 8px; font-size: 1rem; font-weight: 600; color: var(--text-secondary);">Info</h3>
                                        <p style="color: var(--text-tertiary); font-size: 0.9rem;">${match.info || 'Live Coverage'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Right Side: Sidebar Live Matches List -->
                        <div class="sports-sidebar-column">
                            <div class="glass" style="padding: 20px; border-radius: 12px; height: 100%; border: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; gap: 16px;">
                                <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 4px;">Live Matches</h3>
                                <div style="display: flex; flex-direction: column; gap: 12px; overflow-y: auto; max-height: 480px; padding-right: 4px;">
                                    ${this.matches.map((m, idx) => `
                                        <div class="match-sidebar-card ${idx === this.currentMatchIndex ? 'active' : ''}" onclick="SportsPage.switchMatch(${idx})" style="padding: 14px; border-radius: 8px; border: 1px solid ${idx === this.currentMatchIndex ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)'}; background: ${idx === this.currentMatchIndex ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.01)'}; cursor: pointer; transition: all 0.2s;">
                                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                                                <span style="width: 8px; height: 8px; background: #ff4757; border-radius: 50%; box-shadow: 0 0 8px #ff4757; display: inline-block;"></span>
                                                <span style="font-size: 0.75rem; font-weight: 700; color: var(--accent-color); text-transform: uppercase;">Live</span>
                                            </div>
                                            <h4 style="font-size: 0.95rem; font-weight: 600; color: #fff; line-height: 1.4; margin-bottom: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${m.title}</h4>
                                            <p style="font-size: 0.8rem; color: var(--text-tertiary); margin: 0;">${m.info || 'HD Stream'}</p>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        `;

        this.loadMedia();
    },

    async refreshMatches(type) {
        await this.loadMatches(type);
        const app = document.getElementById('app');
        this.renderSportType(app, type);
    },

    switchMatch(index) {
        this.currentMatchIndex = index;
        this.currentServerIndex = 0;
        
        const app = document.getElementById('app');
        const match = this.matches[this.currentMatchIndex];
        this.renderSportType(app, match.category);
    },

    switchServer(index) {
        this.currentServerIndex = index;
        
        const buttons = document.querySelectorAll('.server-btn');
        buttons.forEach((btn, idx) => {
            if (idx === index) {
                btn.classList.add('active');
                btn.style.background = 'var(--accent-color)';
                btn.style.borderColor = 'var(--accent-color)';
            } else {
                btn.classList.remove('active');
                btn.style.background = 'rgba(255,255,255,0.05)';
                btn.style.borderColor = 'rgba(255,255,255,0.1)';
            }
        });

        this.loadMedia();
    },

    loadMedia() {
        if (this.hls) {
            this.hls.destroy();
            this.hls = null;
        }

        const container = document.getElementById('sports-media-container');
        if (!container) return;

        const match = this.matches[this.currentMatchIndex];
        if (!match) return;

        const server = match.servers[this.currentServerIndex];
        if (!server) return;

        if (server.type === 'iframe') {
            container.innerHTML = `
                <iframe 
                    src="${server.url}" 
                    class="sports-iframe"
                    allowfullscreen="true" 
                    frameborder="0" 
                    scrolling="no"
                    allow="autoplay; encrypted-media; picture-in-picture; clipboard-write"
                    referrerpolicy="no-referrer"
                    style="width:100%; height:100%; border:none; border-radius:12px;"
                ></iframe>
            `;
        } else {
            container.innerHTML = `
                <video id="sports-player" class="sports-video-element" controls playsinline webkit-playsinline preload="auto" style="width:100%; height:100%; object-fit:contain; border-radius:12px;"></video>
            `;
            
            setTimeout(() => {
                const video = document.getElementById('sports-player');
                if (!video) return;

                if (Hls.isSupported()) {
                    this.hls = new Hls({
                        enableWorker: false,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    this.hls.loadSource(server.url);
                    this.hls.attachMedia(video);
                    this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
                        video.play().catch(err => {
                            console.log("Autoplay blocked on Android, waiting for user interaction...");
                            const playOnTap = () => {
                                video.play().catch(e => console.log(e));
                                document.removeEventListener('click', playOnTap);
                                document.removeEventListener('touchstart', playOnTap);
                            };
                            document.addEventListener('click', playOnTap);
                            document.addEventListener('touchstart', playOnTap);
                        });
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = server.url;
                    video.addEventListener('loadedmetadata', () => {
                        video.play().catch(err => {
                            console.log("Native Autoplay blocked on Android, waiting for user interaction...");
                            const playOnTap = () => {
                                video.play().catch(e => console.log(e));
                                document.removeEventListener('click', playOnTap);
                                document.removeEventListener('touchstart', playOnTap);
                            };
                            document.addEventListener('click', playOnTap);
                            document.addEventListener('touchstart', playOnTap);
                        });
                    });
                }
            }, 100);
        }
    }
};
