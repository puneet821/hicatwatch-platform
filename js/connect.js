/* ============================================================
   CatWatch Connect — Synchronized Theater Mode (Cineby Style)
   ============================================================ */

const Connect = {
    peer: null,
    connections: [],
    isHost: false,
    roomId: null,
    maxParticipants: 4,
    participants: [],
    
    // Sync State
    isPlaying: true,
    currentTime: 0,
    
    // UI Elements
    connectPanel: null,
    chatContainer: null,
    
    init() {
        console.log('Connect: Initializing Sync Mode...');
        this.setupEventListeners();
    },

    setupEventListeners() {
        const btn = document.getElementById('nav-connect-btn');
        if (btn) {
            btn.onclick = () => this.toggleConnectPanel();
        }
    },

    toggleConnectPanel() {
        if (this.connectPanel) {
            this.connectPanel.remove();
            this.connectPanel = null;
            return;
        }
        
        this.renderConnectPanel();
    },

    renderConnectPanel() {
        const panel = document.createElement('div');
        panel.className = 'connect-panel glass';
        panel.id = 'connect-panel';
        
        if (this.roomId) {
            panel.innerHTML = this.renderActiveSessionUI();
        } else {
            panel.innerHTML = this.renderSetupUI();
        }
        
        document.body.appendChild(panel);
        this.connectPanel = panel;
    },

    renderSetupUI() {
        return `
            <div class="connect-panel__header">
                <h3>CatWatch Sync</h3>
                <button onclick="Connect.toggleConnectPanel()">✕</button>
            </div>
            <div class="connect-panel__body">
                <div class="connect-option">
                    <h4>Create a Room</h4>
                    <p>High-quality HD sync for everyone. Only you control the playback.</p>
                    <div style="margin: 12px 0;">
                        <label style="font-size: 0.8rem; color: var(--text-tertiary);">Room Size: </label>
                        <select id="room-size-select" class="setup-modal__input" style="padding: 4px 8px; width: auto; margin-left: 8px;">
                            <option value="2">2 People</option>
                            <option value="3">3 People</option>
                            <option value="4">4 People</option>
                        </select>
                    </div>
                    <button class="btn btn-accent btn-full" onclick="Connect.createRoom()">Create Room</button>
                </div>
                <div class="divider"><span>OR</span></div>
                <div class="connect-option">
                    <h4>Join a Room</h4>
                    <p>Enter the code to sync with your friend's player.</p>
                    <input type="text" id="join-room-id" class="setup-modal__input" placeholder="Enter Room Code..." style="margin: 12px 0;">
                    <button class="btn btn-secondary btn-full" onclick="Connect.joinRoom()">Join Room</button>
                </div>
            </div>
        `;
    },

    renderActiveSessionUI() {
        return `
            <div class="connect-panel__header">
                <div style="display:flex; align-items:center; gap:8px">
                    <span class="status-indicator online"></span>
                    <h3>${this.isHost ? 'Host Controls' : 'Synced Theater'}</h3>
                </div>
                <button onclick="Connect.toggleConnectPanel()">✕</button>
            </div>
            <div class="connect-panel__body">
                <div class="room-code-info">
                    <span style="font-size: 0.8rem; color: var(--text-tertiary);">Room Code:</span>
                    <div class="code-box">
                        <code id="current-room-id">${this.roomId}</code>
                        <button onclick="Connect.copyRoomCode()" title="Copy Code">📋</button>
                    </div>
                </div>
                
                <div class="participants-list">
                    <span style="font-size: 0.8rem; color: var(--text-tertiary);">Room (${this.participants.length + 1}/${this.maxParticipants})</span>
                    <div id="participants-grid">
                        <div class="participant-item">
                            <div class="participant-avatar host">ME</div>
                            <span>You ${this.isHost ? '(Admin)' : ''}</span>
                        </div>
                        ${this.participants.map(p => `
                            <div class="participant-item">
                                <div class="participant-avatar">?</div>
                                <span>Friend</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="theater-controls">
                    ${this.isHost ? `
                        <p style="font-size:0.75rem; color:var(--text-tertiary); margin-bottom:10px;">🎥 Controlling playback for all users.</p>
                        <button class="btn btn-accent btn-full" onclick="Connect.toggleChat()">💬 Open Sidebar Chat</button>
                    ` : `
                        <div class="waiting-msg" style="border:none; padding:10px;">
                            ${this.isPlaying ? '🍿 Movie is playing...' : '⏸️ Paused by Host.'}
                        </div>
                    `}
                </div>

                <button class="btn btn-secondary btn-sm" style="margin-top: 16px; width: 100%; opacity: 0.6;" onclick="Connect.leaveRoom()">Leave Sync</button>
            </div>
        `;
    },

    async createRoom() {
        const sizeSelect = document.getElementById('room-size-select');
        this.maxParticipants = parseInt(sizeSelect.value);
        this.isHost = true;
        await this.initPeer();
    },

    async joinRoom() {
        const code = document.getElementById('join-room-id').value.trim();
        if (!code) return;
        this.isHost = false;
        this.roomId = code;
        await this.initPeer();
        
        this.peer.on('open', () => {
            const conn = this.peer.connect(this.roomId, { metadata: { role: 'guest' } });
            this.handleConnection(conn);
        });
    },

    async initPeer() {
        if (this.peer) return;
        this.peer = new Peer(this.isHost ? null : undefined, { debug: 2 });
        
        this.peer.on('open', (id) => {
            if (this.isHost) this.roomId = id;
            this.updateNavStatus(true);
            if (this.connectPanel) this.renderConnectPanel();
            Components.showToast('Sync Initialized!', 'success');
        });

        this.peer.on('connection', (conn) => this.handleConnection(conn));

        this.peer.on('error', (err) => {
            console.error('PeerJS error:', err);
            Components.showToast(`Error: ${err.type}`, 'error');
        });
    },

    handleConnection(conn) {
        this.connections.push(conn);
        conn.on('open', () => {
            if (this.isHost) {
                this.participants.push(conn.peer);
                if (this.connectPanel) this.renderConnectPanel();
                conn.send({ type: 'init', maxParticipants: this.maxParticipants, path: window.location.hash });
            }
        });
        conn.on('data', (data) => this.handleIncomingData(data, conn));
        conn.on('close', () => {
            this.participants = this.participants.filter(p => p !== conn.peer);
            if (this.connectPanel) this.renderConnectPanel();
        });
    },

    handleIncomingData(data, conn) {
        switch (data.type) {
            case 'init':
                this.maxParticipants = data.maxParticipants;
                if (window.location.hash !== data.path) Router.navigate(data.path);
                if (this.connectPanel) this.renderConnectPanel();
                break;
            case 'chat':
                this.addChatMessage(data.sender, data.text);
                break;
            case 'play':
                this.setPlaybackLocal(true);
                break;
            case 'pause':
                this.setPlaybackLocal(false);
                break;
            case 'sync-nav':
                if (window.location.hash !== data.path) Router.navigate(data.path);
                break;
        }
    },

    // Master Controls (Host only)
    togglePlayback() {
        if (!this.isHost) return;
        this.setPlaybackLocal(!this.isPlaying);
        this.broadcast({ type: this.isPlaying ? 'play' : 'pause' });
    },

    setPlaybackLocal(playing) {
        this.isPlaying = playing;
        const overlay = document.getElementById('sync-overlay');
        const watchWrap = document.querySelector('.watch__player-wrap');
        
        if (playing) {
            if (overlay) overlay.remove();
            if (watchWrap) watchWrap.classList.remove('host-paused');
        } else {
            console.log('Connect: Pausing UI for participants...');
            if (watchWrap && !document.getElementById('sync-overlay')) {
                watchWrap.classList.add('host-paused');
                const overlayEl = document.createElement('div');
                overlayEl.id = 'sync-overlay';
                overlayEl.className = 'sync-overlay';
                overlayEl.innerHTML = `
                    <div class="sync-overlay__content">
                        <div class="sync-overlay__icon">⏸️</div>
                        <h3>Paused by Host</h3>
                        <p>Waiting for current session to resume...</p>
                    </div>
                `;
                watchWrap.appendChild(overlayEl);
            }
        }
    },

    broadcast(data) {
        this.connections.forEach(conn => conn.send(data));
    },

    updateNavStatus(online) {
        const dot = document.getElementById('connect-status-dot');
        if (dot) dot.style.background = online ? 'var(--accent-primary)' : 'rgba(255,255,255,0.4)';
    },

    copyRoomCode() {
        navigator.clipboard.writeText(this.roomId);
        Components.showToast('Room code copied!', 'success');
    },

    leaveRoom() {
        if (this.peer) this.peer.destroy();
        location.reload();
    },

    // Chat
    toggleChat(forceOpen = false) {
        let chat = document.getElementById('theater-chat');
        if (chat) {
            chat.classList.toggle('hidden');
        } else {
            this.renderChat();
        }
    },

    renderChat() {
        const chat = document.createElement('div');
        chat.id = 'theater-chat';
        chat.className = 'theater-chat glass';
        chat.innerHTML = `
            <div class="theater-chat__header">
                <h4>Theater Chat</h4>
                <button onclick="Connect.toggleChat()">✕</button>
            </div>
            <div id="chat-messages" class="theater-chat__messages">
                <div class="chat-msg system">Connected to Theater Chat!</div>
            </div>
            <div class="theater-chat__input-group">
                <input type="text" id="chat-input" placeholder="Say something..." onkeypress="if(event.key==='Enter') Connect.sendChat()">
                <button onclick="Connect.sendChat()">Send</button>
            </div>
        `;
        document.body.appendChild(chat);
        this.chatContainer = chat;
    },

    sendChat() {
        const text = document.getElementById('chat-input').value.trim();
        if (!text) return;
        this.addChatMessage('Me', text);
        this.broadcast({ type: 'chat', sender: 'Friend', text: text });
        document.getElementById('chat-input').value = '';
    },

    addChatMessage(sender, text) {
        const msgContainer = document.getElementById('chat-messages');
        if (!msgContainer) return;
        const msg = document.createElement('div');
        msg.className = `chat-msg ${sender === 'Me' ? 'self' : ''}`;
        msg.innerHTML = `<span class="sender">${sender}:</span> <span class="text">${text}</span>`;
        msgContainer.appendChild(msg);
        msgContainer.scrollTop = msgContainer.scrollHeight;
    }
};

document.addEventListener('DOMContentLoaded', () => Connect.init());
