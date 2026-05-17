/* ============================================================
   HiCat Movies — Tata Sky Edition (100+ Channels)
   ============================================================ */

window.LiveTvPage = {
    channels: [
        // --- 100s: GENERAL ENTERTAINMENT ---
        { id: '101', name: 'DD National', category: 'Entertainment', logo: 'https://ltsk-cdn.s3.eu-west-1.amazonaws.com/jumpstart/Temp_Live/cdn/HLS/Channel/transparentImages/DD%20National.png', url: 'https://d3qs3d2rkhfqrt.cloudfront.net/out/v1/40492a64c1db4a1385ba1a397d357d3a/index.m3u8' },
        { id: '103', name: 'Shemaroo TV', category: 'Entertainment', logo: 'https://jiotvimages.cdn.jio.com/dare_images/images/Shemaroo_TV.png', url: 'https://cdn-3.pishow.tv/live/230/master.m3u8' },
        { id: '105', name: 'Oscar Movies', category: 'Movies', logo: 'https://jiotvimages.cdn.jio.com/dare_images/images/Osar_Movies.png', url: 'https://cdn-4.pishow.tv/live/233/master.m3u8' },
        { id: '107', name: 'Sangeet Bangla', category: 'Music', logo: 'https://ltsk-cdn.s3.eu-west-1.amazonaws.com/jumpstart/Temp_Live/cdn/HLS/Channel/transparentImages/Sangeet%20Bangla.png', url: 'https://cdn-4.pishow.tv/live/1143/master.m3u8' },

        // --- 400s: SPORTS ---
        { id: '401', name: 'Red Bull TV', category: 'Sports', logo: 'https://jiotvimages.cdn.jio.com/dare_images/images/Red_Bull_TV.png', url: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8' },
        { id: '403', name: 'DD Sports', category: 'Sports', logo: 'https://ltsk-cdn.s3.eu-west-1.amazonaws.com/jumpstart/Temp_Live/cdn/HLS/Channel/transparentImages/DD%20Sports.png', url: 'https://d3qs3d2rkhfqrt.cloudfront.net/out/v1/b17adfe543354fdd8d189b110617cddd/index.m3u8' },
        { id: '405', name: 'Willow Sports', category: 'Sports', logo: 'https://i.imgur.com/v7nSm7M.png', url: 'https://embedsports.top/embed/admin/admin-willow-cricket/1' },
        
        // --- 500s: NEWS ---
        { id: '501', name: 'Aaj Tak', category: 'News', logo: 'https://ltsk-cdn.s3.eu-west-1.amazonaws.com/jumpstart/Temp_Live/cdn/HLS/Channel/transparentImages/Aaj%20Tak%20HD.png', url: 'https://feeds.intoday.in/aajtak/api/aajtakhd/master.m3u8' },
        { id: '502', name: 'NDTV India', category: 'News', logo: 'https://jiotvimages.cdn.jio.com/dare_images/images/NDTV_India.png', url: 'https://ndtvindiaelemarchana.akamaized.net/hls/live/2003679/ndtvindia/master.m3u8' },
        { id: '503', name: 'India TV', category: 'News', logo: 'https://jiotvimages.cdn.jio.com/dare_images/images/India_TV.png', url: 'https://pl-indiatvnews.akamaized.net/out/v1/db79179b608641ceaa5a4d0dd0dca8da/index.m3u8' },
        { id: '504', name: 'NDTV 24x7', category: 'News', logo: 'https://jiotvimages.cdn.jio.com/dare_images/images/NDTV_24x7.png', url: 'https://ndtv24x7elemarchana.akamaized.net/hls/live/2003678/ndtv24x7/master.m3u8' },
        { id: '505', name: 'DD News', category: 'News', logo: 'https://ltsk-cdn.s3.eu-west-1.amazonaws.com/jumpstart/Temp_Live/cdn/HLS/Channel/transparentImages/DD%20News%20HD.png', url: 'https://d3qs3d2rkhfqrt.cloudfront.net/out/v1/0811cd8c37ca4c409d5385a6cd2fa18b/index.m3u8' },
        { id: '506', name: 'Al Jazeera', category: 'News', logo: 'https://jiotvimages.cdn.jio.com/dare_images/images/AL_Jazeera.png', url: 'https://live-hls-web-aja.getaj.net/AJA/index.m3u8' },
        
        // --- 600s: KIDS ---
        { id: '601', name: 'Mr. Bean Animated', category: 'Kids', logo: 'https://i.imgur.com/5RZ78WP.png', url: 'https://amg00627-amg00627c23-samsung-au-4110.playouts.now.amagi.tv/playlist.m3u8' },
        { id: '602', name: 'Chithiram TV', category: 'Kids', logo: 'https://dvdh7g0f0hwck.cloudfront.net/assets/images/channel/CHITHIRAM_Transparent_0a0a1cd6-cba5-4899-b22d-ce53fa1236dd.png', url: 'https://cdn-6.pishow.tv/live/1243/master.m3u8' },
        { id: '603', name: 'DW Global', category: 'Lifestyle', logo: 'https://jiotvimages.cdn.jio.com/dare_images/images/dw.png', url: 'https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8' },
    ],

    hls: null,

    async render() {
        const app = document.getElementById('app');
        
        app.innerHTML = `
            <div class="livetv-page page-enter">
                <div class="livetv-hero">
                    <div class="livetv-hero__content">
                        <span class="live-badge">TATA SKY EDITION</span>
                        <h1>HiCat Live TV</h1>
                        <p>Access 50+ premium Tata Sky channels organized by official numbers.</p>
                        
                        <div class="livetv-search">
                            <input type="text" id="livetv-search-input" placeholder="Search by name or channel number (e.g. 103, Zee TV)...">
                            <div class="livetv-search-icon">${Components.icons.search}</div>
                        </div>
                    </div>
                </div>

                <div class="livetv-container">
                    <div class="livetv-categories" id="livetv-cats">
                        <button class="livetv-cat active" data-cat="all">All</button>
                        <button class="livetv-cat" data-cat="Entertainment">Entertainment</button>
                        <button class="livetv-cat" data-cat="Movies">Movies</button>
                        <button class="livetv-cat" data-cat="Sports">Sports</button>
                        <button class="livetv-cat" data-cat="News">News</button>
                        <button class="livetv-cat" data-cat="Kids">Kids</button>
                        <button class="livetv-cat" data-cat="Regional">Regional</button>
                        <button class="livetv-cat" data-cat="Music">Music</button>
                    </div>

                    <div class="channel-grid" id="channel-grid">
                        ${this.renderChannels('all')}
                    </div>
                </div>
            </div>
        `;

        this.attachListeners();
        window.scrollTo(0, 0);
    },

    renderChannels(category, query = '') {
        let filtered = this.channels;
        
        if (category !== 'all') {
            filtered = filtered.filter(c => c.category === category);
        }
        
        if (query) {
            const q = query.toLowerCase();
            filtered = filtered.filter(c => c.name.toLowerCase().includes(q) || c.id.includes(q) || c.category.toLowerCase().includes(q));
        }

        if (filtered.length === 0) {
            return `
                <div style="grid-column: 1/-1; padding: 60px; text-align: center; color: var(--text-tertiary);">
                    <div style="font-size: 3rem; margin-bottom: 20px;">🔍</div>
                    <h3>No channels found</h3>
                    <p>Try searching for a different number or name</p>
                </div>
            `;
        }

        return filtered.map(c => `
            <div class="channel-card" onclick="window.LiveTvPage.playChannel('${c.id}')">
                <div class="channel-card__number">${c.id}</div>
                <div class="channel-card__logo-wrap">
                    ${this.getChannelLogoHtml(c)}
                </div>
                <div class="channel-card__info">
                    <div class="channel-card__name">${c.name}</div>
                    <div class="channel-card__meta">
                        <span class="live-dot"></span> ${c.category}
                    </div>
                </div>
                <div class="channel-card__play">
                    ${Components.icons.play}
                </div>
            </div>
        `).join('');
    },

    getChannelLogoHtml(c) {
        let initials = c.name.split(' ').map(n => n[0]).join('').substring(0, 3).toUpperCase();
        if (c.name.includes('Mr. Bean')) initials = 'MB';
        if (c.name.includes('Sangeet')) initials = 'SB';
        if (c.name.includes('Oscar')) initials = 'OM';
        if (c.name.includes('DW')) initials = 'DW';
        if (c.name.includes('Aaj Tak')) initials = 'AT';
        if (c.name.includes('Al Jazeera')) initials = 'AJ';
        
        let gradient, icon;
        switch(c.category) {
            case 'Entertainment':
                gradient = 'linear-gradient(135deg, #FF2E93 0%, #FF8E53 100%)';
                icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 6v6l4 2"/></svg>`;
                break;
            case 'Movies':
                gradient = 'linear-gradient(135deg, #7F00FF 0%, #FF007F 100%)';
                icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5"/></svg>`;
                break;
            case 'Sports':
                gradient = 'linear-gradient(135deg, #00F2FE 0%, #4FACFE 100%)';
                icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12a14.5 14.5 0 0 0 20 0 14.5 14.5 0 0 0-20 0"/></svg>`;
                break;
            case 'News':
                gradient = 'linear-gradient(135deg, #ED213A 0%, #93291E 100%)';
                icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10zM2 12h20"/></svg>`;
                break;
            case 'Music':
                gradient = 'linear-gradient(135deg, #00FF87 0%, #60EFFF 100%)';
                icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`;
                break;
            case 'Kids':
                gradient = 'linear-gradient(135deg, #FAD961 0%, #F76B1C 100%)';
                icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>`;
                break;
            default:
                gradient = 'linear-gradient(135deg, #3A1C71 0%, #D76D77 100%)';
                icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`;
        }

        return `
            <div class="channel-logo-container" style="background: ${gradient}">
                <div class="channel-logo-fallback">
                    <span class="channel-logo-icon">${icon}</span>
                    <span class="channel-logo-text">${initials}</span>
                </div>
                ${c.logo ? `<img src="${c.logo}" alt="${c.name}" class="channel-card__logo" onload="this.classList.add('loaded')" onerror="this.style.display='none'">` : ''}
            </div>
        `;
    },

    attachListeners() {
        const searchInput = document.getElementById('livetv-search-input');
        const grid = document.getElementById('channel-grid');
        const cats = document.getElementById('livetv-cats');

        if (!searchInput || !grid || !cats) return;

        searchInput.addEventListener('input', () => {
            const query = searchInput.value;
            const activeBtn = cats.querySelector('.livetv-cat.active');
            const activeCat = activeBtn ? activeBtn.dataset.cat : 'all';
            grid.innerHTML = this.renderChannels(activeCat, query);
        });

        cats.querySelectorAll('.livetv-cat').forEach(btn => {
            btn.addEventListener('click', () => {
                cats.querySelectorAll('.livetv-cat').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const cat = btn.dataset.cat;
                grid.innerHTML = this.renderChannels(cat, searchInput.value);
            });
        });
    },

    playChannel(id) {
        const channel = this.channels.find(c => c.id === id);
        if (!channel) return;

        const isIframe = channel.url.includes('/embed/') || !channel.url.includes('.m3u8');

        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="watch-page page-enter">
                <div class="watch__player-wrap" style="background:#000; display:flex; align-items:center; justify-content:center; aspect-ratio: 16/9; border-radius: 12px; overflow: hidden;">
                    ${isIframe ? `
                        <iframe 
                            src="${channel.url}" 
                            class="sports-iframe"
                            allowfullscreen="true" 
                            frameborder="0" 
                            scrolling="no"
                            allow="autoplay; encrypted-media; picture-in-picture; clipboard-write"
                            referrerpolicy="no-referrer"
                            style="width:100%; height:100%; border:none;"
                        ></iframe>
                    ` : `
                        <video id="live-player" controls playsinline webkit-playsinline preload="auto" style="width:100%; height:100%; object-fit: contain;"></video>
                    `}
                </div>
                <div class="watch__info">
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
                        <button class="btn btn-secondary btn-sm" onclick="window.LiveTvPage.render()">
                            ${Components.icons.back} Back to Channels
                        </button>
                    </div>
                    <div style="display:flex; align-items:center; gap:12px;">
                        <span class="live-badge">LIVE HD</span>
                        <span style="color:var(--text-tertiary); font-weight:700">Ch. ${channel.id}</span>
                        <h1 class="watch__title">${channel.name}</h1>
                    </div>
                    <p class="watch__overview" style="margin-top:12px">Premium digital live feed.</p>
                </div>
            </div>
        `;

        if (!isIframe) {
            this.initPlayer(channel.url);
        } else {
            if (this.hls) {
                this.hls.destroy();
                this.hls = null;
            }
        }
        window.scrollTo(0, 0);
    },

    initPlayer(url) {
        const video = document.getElementById('live-player');
        if (!video) return;

        if (this.hls) {
            this.hls.destroy();
        }

        if (Hls.isSupported()) {
            this.hls = new Hls({
                enableWorker: false,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            this.hls.loadSource(url);
            this.hls.attachMedia(video);
            this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(e => {
                    console.log("Autoplay blocked on Android Live TV, waiting for user tap...");
                    const playOnTap = () => {
                        video.play().catch(err => console.log(err));
                        document.removeEventListener('click', playOnTap);
                        document.removeEventListener('touchstart', playOnTap);
                    };
                    document.addEventListener('click', playOnTap);
                    document.addEventListener('touchstart', playOnTap);
                });
            });
            
            this.hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    console.log("Fatal Hls.js error in Live TV:", data.type);
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            this.hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            this.hls.recoverMediaError();
                            break;
                        default:
                            console.log("Hls.js failed in Live TV. Falling back to native HLS...");
                            this.hls.destroy();
                            this.hls = null;
                            video.src = url;
                            video.play().catch(err => {
                                const playOnTap = () => {
                                    video.play().catch(e => console.log(e));
                                    document.removeEventListener('click', playOnTap);
                                    document.removeEventListener('touchstart', playOnTap);
                                };
                                document.addEventListener('click', playOnTap);
                                document.addEventListener('touchstart', playOnTap);
                            });
                            break;
                    }
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            video.addEventListener('loadedmetadata', () => {
                video.play().catch(e => {
                    console.log("Native Autoplay blocked on Android Live TV, waiting for user tap...");
                    const playOnTap = () => {
                        video.play().catch(err => console.log(err));
                        document.removeEventListener('click', playOnTap);
                        document.removeEventListener('touchstart', playOnTap);
                    };
                    document.addEventListener('click', playOnTap);
                    document.addEventListener('touchstart', playOnTap);
                });
            });
        }
    }
};
