/* ============================================================
   FlixStream — Watchlist Page
   ============================================================ */

const WatchlistPage = {
    render() {
        const app = document.getElementById('app');
        const watchlist = Storage.getWatchlist();

        if (watchlist.length === 0) {
            app.innerHTML = `
                <div class="watchlist-page page-enter">
                    <div class="watchlist__header">
                        <h1 class="watchlist__title">My Watchlist</h1>
                    </div>
                    ${Components.createEmptyState(
                        'Your watchlist is empty',
                        'Start adding movies and TV shows to keep track of what you want to watch.',
                        'Browse Movies',
                        '#/browse/movie'
                    )}
                </div>
            `;
            return;
        }

        const cardsHtml = watchlist.map(item => `
            <div style="position:relative">
                ${Components.createMovieCard(item)}
                <button class="btn-icon" style="position:absolute;top:8px;right:8px;z-index:5;width:32px;height:32px;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px)"
                    onclick="event.stopPropagation(); WatchlistPage.removeItem(${item.id}, '${item.media_type}')"
                    title="Remove from watchlist">
                    ${Components.icons.trash}
                </button>
            </div>
        `).join('');

        app.innerHTML = `
            <div class="watchlist-page page-enter">
                <div class="watchlist__header">
                    <h1 class="watchlist__title">My Watchlist <span class="watchlist__count">(${watchlist.length})</span></h1>
                </div>
                <div class="content-grid" id="watchlist-grid">
                    ${cardsHtml}
                </div>
            </div>
        `;
    },

    removeItem(id, mediaType) {
        Storage.removeFromWatchlist(id, mediaType);
        Components.showToast('Removed from watchlist', 'info');
        // Re-render
        this.render();
    },
};
