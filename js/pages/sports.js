/* ============================================================
   CatWatch — Live Sports & Cricket
   ============================================================ */

const SportsPage = {
    hls: null,
    currentServerIndex: 0,

    servers: [
        { name: 'Main Stream (EmbedSports)', type: 'iframe', url: 'https://embedsports.top/embed/admin/ppv-delhi-capitals-vs-rajasthan-royals/1' },
        { name: 'Backup Stream (Willow TV HD)', type: 'hls', url: 'https://d36r8jifhgsk5j.cloudfront.net/Willow_TV.m3u8' }
    ],

    render(type) {
        if (this.hls) {
            this.hls.destroy();
            this.hls = null;
        }

        const app = document.getElementById('app');
        
        if (type === 'cricket') {
            this.renderCricket(app);
            this.loadMedia();
        } else {
            this.renderSportsHome(app);
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
                                <p class="sports-card__desc">Watch IPL 2026 Live Stream</p>
                                <div class="sports-card__action">
                                    <span>Watch Now</span>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
                                </div>
                            </div>
                        </div>

                        <div class="sports-card football-card locked">
                            <div class="sports-card__image">
                                <img src="images/football.png" alt="Football">
                                <div class="sports-card__overlay"></div>
                            </div>
                            <div class="sports-card__content">
                                <h3 class="sports-card__title">Football</h3>
                                <p class="sports-card__desc">Upcoming Leagues</p>
                                <div class="sports-card__badge">Coming Soon</div>
                            </div>
                        </div>

                        <div class="sports-card tennis-card locked">
                            <div class="sports-card__image">
                                <img src="images/tennis.png" alt="Tennis">
                                <div class="sports-card__overlay"></div>
                            </div>
                            <div class="sports-card__content">
                                <h3 class="sports-card__title">Tennis</h3>
                                <p class="sports-card__desc">Grand Slams</p>
                                <div class="sports-card__badge">Coming Soon</div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        `;
    },

    renderCricket(app) {
        app.innerHTML = `
            <div class="cricket-page page-enter">
                <div class="stream-container">
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
                            <h1 class="stream-title">IPL 2026 — Live Stream</h1>
                        </div>
                        <div class="stream-actions">
                            <button class="btn-refresh" onclick="location.reload()">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
                            </button>
                        </div>
                    </div>

                    <div id="sports-media-container" class="video-player-wrapper glass" style="background:#000; aspect-ratio: 16/9; display:flex; align-items:center; justify-content:center; border-radius:12px; overflow:hidden; position:relative;">
                        <!-- Loaded dynamically -->
                    </div>

                    <div class="stream-details" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 24px;">
                        <div class="detail-card glass" style="grid-column: span 2;">
                            <h3 style="margin-bottom: 12px; font-size: 1rem; font-weight: 600; color: var(--text-secondary);">Select Stream Server</h3>
                            <div class="sports-servers-list" style="display:flex; flex-wrap:wrap; gap:10px;">
                                ${this.servers.map((srv, idx) => `
                                    <button class="server-btn ${idx === this.currentServerIndex ? 'active' : ''}" onclick="SportsPage.switchServer(${idx})" style="padding: 10px 16px; border-radius: 8px; border: 1px solid ${idx === this.currentServerIndex ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)'}; background: ${idx === this.currentServerIndex ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)'}; color: #fff; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: inherit;">
                                        ${srv.name}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                        <div class="detail-card glass" style="padding: 20px; border-radius: 12px;">
                            <h3 style="margin-bottom: 8px; font-size: 1rem; font-weight: 600; color: var(--text-secondary);">Match Info</h3>
                            <p style="color: var(--text-tertiary); font-size: 0.9rem;">DC vs RR — TATA IPL 2026 Live</p>
                        </div>
                        <div class="detail-card glass" style="padding: 20px; border-radius: 12px;">
                            <h3 style="margin-bottom: 8px; font-size: 1rem; font-weight: 600; color: var(--text-secondary);">Quality</h3>
                            <p style="color: var(--text-tertiary); font-size: 0.9rem;">Auto HD / 1080p</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
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

        const server = this.servers[this.currentServerIndex];

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
                <video id="sports-player" class="sports-video-element" controls style="width:100%; height:100%; object-fit:contain; border-radius:12px;"></video>
            `;
            
            setTimeout(() => {
                const video = document.getElementById('sports-player');
                if (!video) return;

                if (Hls.isSupported()) {
                    this.hls = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    this.hls.loadSource(server.url);
                    this.hls.attachMedia(video);
                    this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
                        video.play().catch(err => console.log("Autoplay blocked:", err));
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = server.url;
                    video.addEventListener('loadedmetadata', () => {
                        video.play().catch(err => console.log("Autoplay blocked:", err));
                    });
                }
            }, 100);
        }
    }
};
