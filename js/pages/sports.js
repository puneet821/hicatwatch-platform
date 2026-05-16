/* ============================================================
   CatWatch — Live Sports & Cricket
   ============================================================ */

const SportsPage = {
    render(type) {
        const app = document.getElementById('app');
        
        if (type === 'cricket') {
            this.renderCricket(app);
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

                    <div class="video-player-wrapper glass">
                        <iframe 
                            src="https://embedsports.top/embed/admin/ppv-kolkata-knight-riders-vs-gujarat-titans/1" 
                            class="sports-iframe"
                            allowfullscreen="true" 
                            frameborder="0" 
                            scrolling="no"
                            allow="autoplay; encrypted-media; picture-in-picture; clipboard-write"
                            referrerpolicy="no-referrer"
                        ></iframe>
                    </div>

                    <div class="stream-details">
                        <div class="detail-card glass">
                            <h3>Match Info</h3>
                            <p>TATA IPL 2026 — Exclusive Live Coverage</p>
                        </div>
                        <div class="detail-card glass">
                            <h3>Quality</h3>
                            <p>Auto HD / 1080p</p>
                        </div>
                        <div class="detail-card glass">
                            <h3>Server</h3>
                            <p>Main Stream (EmbedSports)</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};
