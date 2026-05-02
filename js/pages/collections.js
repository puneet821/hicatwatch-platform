/* ============================================================
   CatWatch — Library & Collections Page
   ============================================================ */

const CollectionsPage = {
    collections: [
        { id: 'laugh', title: 'Have a Laugh (Comedy)', query: { with_genres: '35', sort_by: 'popularity.desc' } },
        { id: 'cry', title: 'Tearjerkers (Emotional/Drama)', query: { with_genres: '18', sort_by: 'popularity.desc', with_keywords: 'tragedy|sadness' } },
        { id: 'romance', title: 'Heart Fluttering (Romantic)', query: { with_genres: '10749', sort_by: 'popularity.desc' } },
        { id: 'action', title: 'Adrenaline Rush (Action)', query: { with_genres: '28', sort_by: 'popularity.desc' } },
        { id: 'scifi', title: 'Out of this World (Sci-Fi)', query: { with_genres: '878', sort_by: 'popularity.desc' } },
        { id: 'horror', title: 'Keep the Lights On (Horror)', query: { with_genres: '27', sort_by: 'popularity.desc' } }
    ],

    async render() {
        const app = document.getElementById('app');

        // Fetch User Data from Storage
        const downloads = Storage.getDownloads() || [];
        const watchlist = Storage.getWatchlist() || [];
        const history = Storage.getHistory() || [];

        // Show loading state for collections
        app.innerHTML = `
            <div class="watchlist-page page-enter">
                <div class="watchlist__header">
                    <div>
                        <h1 class="watchlist__title">My Library & Collections</h1>
                        <span class="watchlist__count">Your personal space and curated moods.</span>
                    </div>
                </div>
                ${Array(3).fill(0).map(() => `
                    <div style="margin-bottom: 40px">
                        <div class="skeleton skeleton-text skeleton-text--short" style="width: 200px; height: 24px; margin-bottom: 16px;"></div>
                        <div style="display:flex; gap:14px; overflow-x:hidden;">
                            ${Array(6).fill(0).map(() => `
                                <div class="skeleton skeleton-card">
                                    <div class="skeleton-poster"></div>
                                    <div class="skeleton-text"></div>
                                    <div class="skeleton-text skeleton-text--short"></div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        try {
            // Fetch everything in parallel
            const fetchPromises = this.collections.map(async col => {
                const data = await API.getDiscover('movie', col.query);
                return { ...col, results: data.results || [] };
            });

            const collectionResults = await Promise.all(fetchPromises);

            let contentHtml = '';

            // User Library Rows
            if (downloads.length > 0) {
                contentHtml += Components.createContentRow('my-downloads', 'Downloaded for Offline', downloads, null);
            }
            if (watchlist.length > 0) {
                contentHtml += Components.createContentRow('my-watchlist', 'My Watchlist', watchlist, null);
            }
            if (history.length > 0) {
                contentHtml += Components.createContentRow('my-history', 'Continue Watching', history, null);
            }

            // Separator if we have library items
            if (downloads.length > 0 || watchlist.length > 0 || history.length > 0) {
                contentHtml += '<hr style="border: none; border-top: 1px solid var(--glass-border); margin: 40px var(--content-padding);">';
            }

            // Collection Rows
            collectionResults.forEach((col, index) => {
                if (col.results.length > 0) {
                    contentHtml += Components.createContentRow(col.id, col.title, col.results.slice(0, 15), `#/genre/${col.query.with_genres}`);
                }
            });

            app.innerHTML = `
                <div class="watchlist-page page-enter">
                    <div class="watchlist__header">
                        <div>
                            <h1 class="watchlist__title">My Library & Collections</h1>
                            <span class="watchlist__count">Your downloads, watchlist, and curated categories.</span>
                        </div>
                    </div>
                    
                    <div class="collections-grid">
                        ${contentHtml}
                    </div>
                </div>
            `;

            // Init components slider if needed
            setTimeout(() => Components.initScrollReveal(), 100);

        } catch (error) {
            console.error('Collections load error:', error);
            app.innerHTML = `
                <div class="watchlist-page">
                    <div class="empty-state">
                        <div class="empty-state__icon">
                            ${Components.icons.info}
                        </div>
                        <h2 class="empty-state__title">Oops!</h2>
                        <p class="empty-state__text">We couldn't load the collections right now. Please check your connection.</p>
                        <button class="btn btn-primary" onclick="CollectionsPage.render()">Try Again</button>
                    </div>
                </div>
            `;
        }
    }
};
