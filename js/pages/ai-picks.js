/* ============================================================
   CatWatch — AI Picks & Surprise Me
   ============================================================ */

const AiPicksPage = {
    isLoading: false,

    async render() {
        const app = document.getElementById('app');

        app.innerHTML = `
            <div class="ai-picks-page page-enter">
                <!-- Surprise Me Section -->
                <section class="ai-section surprise-section">
                    <div class="ai-section__inner">
                        <div class="surprise-card glass">
                            <div class="surprise-card__icon">🎲</div>
                            <h2>Surprise Me</h2>
                            <p>Can't decide what to watch? Let fate choose for you!</p>
                            <button class="btn btn-accent btn-lg" id="surprise-btn" onclick="AiPicksPage.surpriseMe()">
                                <span>Pick a Random Movie</span>
                            </button>
                        </div>
                    </div>
                </section>

                <!-- AI Recommendations Section -->
                <section class="ai-section ai-rec-section">
                    <div class="ai-section__inner">
                        <div class="ai-header">
                            <div class="ai-header__icon">✨</div>
                            <h2>AI Movie Advisor</h2>
                            <p>Describe what you're in the mood for, and our AI will find the perfect movies.</p>
                        </div>
                        <div class="ai-prompt-box glass">
                            <div class="ai-prompt-examples">
                                <span onclick="AiPicksPage.fillPrompt(this)">Something like Inception but funnier</span>
                                <span onclick="AiPicksPage.fillPrompt(this)">A feel-good movie for a rainy day</span>
                                <span onclick="AiPicksPage.fillPrompt(this)">Sci-fi thriller with a twist ending</span>
                                <span onclick="AiPicksPage.fillPrompt(this)">Best Bollywood romance for crying</span>
                                <span onclick="AiPicksPage.fillPrompt(this)">Dark psychological horror</span>
                                <span onclick="AiPicksPage.fillPrompt(this)">Anime with incredible fight scenes</span>
                            </div>
                            <div class="ai-input-group">
                                <input type="text" id="ai-prompt-input" class="ai-input" placeholder="e.g. A mind-bending thriller like Interstellar..." autocomplete="off" spellcheck="false" onkeypress="if(event.key==='Enter') AiPicksPage.getAiPicks()">
                                <button class="btn btn-accent ai-submit-btn" id="ai-submit-btn" onclick="AiPicksPage.getAiPicks()">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="M22 2 11 13"/></svg>
                                </button>
                            </div>
                        </div>
                        <div id="ai-results"></div>
                    </div>
                </section>
            </div>
        `;
    },

    // --- SURPRISE ME ---
    async surpriseMe() {
        const btn = document.getElementById('surprise-btn');
        btn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px"></div> <span>Rolling the dice...</span>';
        btn.disabled = true;

        try {
            // Pick a random page (1-20) of popular movies
            const randomPage = Math.floor(Math.random() * 20) + 1;
            const data = await API.getPopular('movie', randomPage);

            if (data.results && data.results.length > 0) {
                const randomIndex = Math.floor(Math.random() * data.results.length);
                const movie = data.results[randomIndex];
                
                // Navigate to the movie detail
                Components.showToast(`🎲 You got: ${API.getTitle(movie)}!`, 'success');
                setTimeout(() => {
                    App.navigateToDetail(movie.id, 'movie');
                }, 800);
            } else {
                Components.showToast('No movies found. Try again!', 'error');
            }
        } catch (error) {
            console.error('Surprise me error:', error);
            Components.showToast('Something went wrong. Try again!', 'error');
        }

        btn.innerHTML = '<span>Pick a Random Movie</span>';
        btn.disabled = false;
    },

    // --- FILL PROMPT ---
    fillPrompt(el) {
        document.getElementById('ai-prompt-input').value = el.textContent;
        document.getElementById('ai-prompt-input').focus();
    },

    // --- AI RECOMMENDATIONS ---
    async getAiPicks() {
        const input = document.getElementById('ai-prompt-input');
        const query = input.value.trim();
        if (!query || this.isLoading) return;

        this.isLoading = true;
        const resultsContainer = document.getElementById('ai-results');
        const submitBtn = document.getElementById('ai-submit-btn');

        submitBtn.disabled = true;
        resultsContainer.innerHTML = `
            <div class="ai-loading">
                <div class="ai-loading__dots">
                    <span></span><span></span><span></span>
                </div>
                <p>AI is thinking about "${query}"...</p>
            </div>
        `;

        try {
            // Step 1: Ask the AI for movie titles
            const aiPrompt = `You are a movie recommendation expert. The user says: "${query}". Suggest exactly 8 real movie titles that match this description. Return ONLY a JSON array of movie title strings, nothing else. Example: ["Movie 1","Movie 2","Movie 3"]. No explanations, no markdown, just valid JSON.`;

            const aiResponse = await fetch(`https://text.pollinations.ai/${encodeURIComponent(aiPrompt)}`, {
                method: 'GET',
            });

            let aiText = await aiResponse.text();
            
            // Clean up possible markdown wrapping
            aiText = aiText.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();

            let movieTitles = [];
            try {
                movieTitles = JSON.parse(aiText);
            } catch (e) {
                // Try to extract titles using regex as fallback
                const matches = aiText.match(/"([^"]+)"/g);
                if (matches) {
                    movieTitles = matches.map(m => m.replace(/"/g, ''));
                }
            }

            if (!Array.isArray(movieTitles) || movieTitles.length === 0) {
                throw new Error('AI could not parse movie recommendations.');
            }

            // Step 2: Search each title on TMDB to get real movie data
            const searchPromises = movieTitles.slice(0, 8).map(async (title) => {
                try {
                    const data = await API.searchMulti(title);
                    // Get the first movie/tv result
                    const match = (data.results || []).find(r => r.media_type === 'movie' || r.media_type === 'tv');
                    return match || null;
                } catch {
                    return null;
                }
            });

            const movieResults = (await Promise.all(searchPromises)).filter(Boolean);

            if (movieResults.length === 0) {
                throw new Error('Could not find any of the recommended movies on TMDB.');
            }

            // Step 3: Render the results as cards
            const cardsHtml = movieResults.map(item => Components.createMovieCard(item)).join('');

            resultsContainer.innerHTML = `
                <div class="ai-results-header">
                    <h3>✨ AI Recommends for: <em>"${query}"</em></h3>
                    <p>${movieResults.length} movies found</p>
                </div>
                <div class="ai-results-grid">
                    ${cardsHtml}
                </div>
            `;

        } catch (error) {
            console.error('AI Picks error:', error);
            resultsContainer.innerHTML = `
                <div class="ai-error glass">
                    <p>😅 AI couldn't process that request. Try rephrasing!</p>
                    <button class="btn btn-secondary btn-sm" onclick="AiPicksPage.getAiPicks()">Retry</button>
                </div>
            `;
        }

        submitBtn.disabled = false;
        this.isLoading = false;
    }
};
