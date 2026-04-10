/* ============================================================
   CatWatch — Collections & Moods Page
   ============================================================ */

const CollectionsPage = {
    collections: [
        { id: 'laugh', title: '😂 Have a Laugh (Comedy)', query: { with_genres: '35', sort_by: 'popularity.desc' } },
        { id: 'cry', title: '😭 Tearjerkers (Emotional/Drama)', query: { with_genres: '18', sort_by: 'popularity.desc', with_keywords: 'tragedy|sadness' } },
        { id: 'romance', title: '❤️ Heart Fluttering (Romantic)', query: { with_genres: '10749', sort_by: 'popularity.desc' } },
        { id: 'action', title: '🔥 Adrenaline Rush (Action)', query: { with_genres: '28', sort_by: 'popularity.desc' } },
        { id: 'scifi', title: '🛸 Out of this World (Sci-Fi)', query: { with_genres: '878', sort_by: 'popularity.desc' } },
        { id: 'horror', title: '☠️ Keep the Lights On (Horror)', query: { with_genres: '27', sort_by: 'popularity.desc' } }
    ],

    async render() {
        const app = document.getElementById('app');
        
        // Show loading state
        app.innerHTML = `
            <div class="watchlist-page page-enter">
                <div class="watchlist__header">
                    <div>
                        <h1 class="watchlist__title">Moods & Collections</h1>
                        <span class="watchlist__count">Finding the perfect vibe for you...</span>
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
            
            collectionResults.forEach((col, index) => {
                if (col.results.length > 0) {
                    contentHtml += Components.createContentRow(col.id, col.title, col.results.slice(0, 15), `#/genre/${col.query.with_genres}`);
                }
            });

            app.innerHTML = `
                <div class="watchlist-page page-enter">
                    <div class="watchlist__header">
                        <div>
                            <h1 class="watchlist__title">Moods & Collections</h1>
                            <span class="watchlist__count">Curated categories for whatever you're feeling right now.</span>
                        </div>
                    </div>
                    
                    <div class="collections-grid">
                        ${contentHtml}
                    </div>
                </div>
            `;
            
            // Re-run intersection observer for reveals if needed
            if (typeof triggerReveal === 'function') {
                triggerReveal();
            } else {
                document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
            }

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
