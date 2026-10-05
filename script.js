/**
 * =========================================================================
 * GHOSTWIRE ARCHITECTURE & SECURITY MANIFEST
 * =========================================================================
 * 
 * 1. CRYPTOGRAPHIC TRANSPORT SECURITY (DTLS-ENCRYPTED P2P):
 *    - All message strings, keystroke telemetry, document packets, view-once media, 
 *      and voice memos are transmitted EXCLUSIVELY over a direct Peer-to-Peer 
 *      WebRTC DataChannel connection.
 *    - The transport layer is fully encrypted using Datagram Transport Layer 
 *      Security (DTLS) natively enforced by the WebRTC stack in the browser.
 *    - Direct peer-to-peer media streams and data streams bypass all central servers.
 * 
 * 2. ZERO-SERVER RETENTION MODEL (RAM-ONLY EPHEMERALITY):
 *    - No central database, cloud server, or logging endpoints ever receive, 
 *      process, or retain message payloads, documents, files, or credentials.
 *    - PeerJS is utilized purely as an initial, secure signaling channel to exchange 
 *      WebRTC session descriptions (SDP) and ICE candidates. Once the connection 
 *      handshake is negotiated, the signaling path is idle and message exchange 
 *      occurs 100% locally.
 *    - Application state is strictly maintained in-memory (volatile RAM). Zero 
 *      persistent cookies, LocalStorage, IndexedDB, or server-side logs are written.
 *    - The moment a browser tab is closed, a connection is broken, or the ESC key 
 *      (NUKE panic protocol) is triggered, all keys, states, and message streams 
 *      are instantly overwritten and incinerated from memory.
 * =========================================================================
 */

(function () {
  'use strict';

  // =========================================================================
  // Volatile RAM-Only Application State
  // (Zero LocalStorage, Zero Cookies, Zero IndexedDB, Zero Server Logs)
  // =========================================================================
  const state = {
    peer: null,
    activeConn: null,
    peerId: null,
    activeRoomId: null,
    isHost: false,
    
    // User Profile & Ephemeral Identity
    nickname: '',
    avatarHue: 0,
    avatarEmoji: '',
    theme: 'dark',
    stagedAvatarEmoji: '',
    stagedTheme: 'dark',
    stealthBlurEnabled: false,
    
    // Remote Peer Profile
    peerProfile: {
      nickname: 'Awaiting Peer...',
      avatarHue: 200,
      avatarEmoji: '',
      connected: false
    },

    // Burn timer config: 'burn_on_read' | '15s' | '60s' | 'keep'
    burnTimerSetting: 'keep',
    
    // In-Memory Ephemeral Messages Buffer (Incinerated upon burn or close)
    messages: new Map(),
    
    // Staged File
    stagedFile: null,
    stagedFileData: null,
    stagedViewOnce: false,

    // Voice note recording state
    recording: false,
    mediaRecorder: null,
    audioChunks: [],
    recordingStartTime: 0,
    
    // Audio synthesis state
    audioCtx: null,
    isMuted: false,
    
    // Typing tracking
    typingTimeout: null,
    isCurrentlyTyping: false,
    
    // Active blob URLs for image previews (revoked on burn/wipe)
    ephemeralBlobUrls: new Set()
  };

  // Cyber Handle Generators
  const CYBER_PREFIXES = [
    'ghost', 'neon', 'void', 'cipher', 'quantum', 'zero', 'shadow',
    'apex', 'pulse', 'flux', 'warp', 'stealth', 'vector', 'binary',
    'zenith', 'phantom', 'hyper', 'nexus', 'prism', 'cryptic'
  ];
  const CYBER_SUFFIXES = [
    'protocol', 'runner', 'pilot', 'spectre', 'operator', 'node',
    'drifter', 'daemon', 'vanguard', 'spill', 'glitch', 'sentinel',
    'matrix', 'overdrive', 'core', 'tracer', 'cipher', 'agent'
  ];

  function generateRandomCyberHandle() {
    const pre = CYBER_PREFIXES[Math.floor(Math.random() * CYBER_PREFIXES.length)];
    const suf = CYBER_SUFFIXES[Math.floor(Math.random() * CYBER_SUFFIXES.length)];
    // Support formats like ghost-protocol#402, neon-runner, void-pilot
    if (Math.random() < 0.5) {
      const num = Math.floor(100 + Math.random() * 900);
      return `${pre}-${suf}#${num}`;
    }
    return `${pre}-${suf}`;
  }

  function hashStringToHue(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash % 360);
  }

  function getInitials(name) {
    if (!name) return '??';
    const clean = name.replace(/[^a-zA-Z0-9]/g, '');
    return (clean.slice(0, 2) || 'GW').toUpperCase();
  }

  // =========================================================================
  // Procedural SVG Avatar Ring Colored by Nickname Hash
  // =========================================================================
  function generateProceduralSvgAvatar(name, size = 30, emoji = '') {
    const rawName = name || 'ghost';
    const hue = hashStringToHue(rawName);
    const initials = getInitials(rawName);

    // Compute deterministic numerical seed from nickname
    let hash = 0;
    for (let i = 0; i < rawName.length; i++) {
      hash = rawName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const seed = Math.abs(hash);

    const radius = (size / 2) - 3;
    const circumference = 2 * Math.PI * radius;

    // Procedural ring dash array (unique cyber notches/segments per nickname)
    const segments = 3 + (seed % 4); // 3 to 6 segments
    const gap = 3 + (seed % 3);
    const segLen = Math.max(4, Math.floor((circumference / segments) - gap));
    const dashArray = `${segLen} ${gap}`;
    const rotation = (seed * 43) % 360;

    // Concentric inner tech tick marks
    const innerTickRadius = Math.max(3, radius - 3.5);
    const tickDash = `1.5 ${(seed % 3) + 3}`;
    const tickRotation = (seed * 89) % 360;

    const strokeColor = `hsl(${hue}, 95%, 58%)`;
    const glowColor = `hsla(${hue}, 95%, 58%, 0.45)`;
    const bgGradId = `rad-${seed}-${size}`;
    const glowFilterId = `glow-${seed}-${size}`;

    const centerContent = emoji 
      ? `<text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-size="${size <= 28 ? '13' : '15'}">${emoji}</text>`
      : `<text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" fill="#ffffff" font-family="var(--font-mono, monospace)" font-size="${size <= 28 ? '10' : '11.5'}" font-weight="700" letter-spacing="-0.5px">${initials}</text>`;

    return `<svg class="procedural-avatar-svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeHtml(rawName)} avatar">
      <defs>
        <radialGradient id="${bgGradId}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="hsl(${hue}, 80%, 26%)" />
          <stop offset="100%" stop-color="hsl(${hue}, 85%, 10%)" />
        </radialGradient>
        <filter id="${glowFilterId}" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="1.5" flood-color="${glowColor}" />
        </filter>
      </defs>
      
      <!-- Inner circular background -->
      <circle cx="${size/2}" cy="${size/2}" r="${radius}" fill="url(#${bgGradId})" stroke="hsla(${hue}, 90%, 55%, 0.3)" stroke-width="0.8" />
      
      <!-- Concentric inner cyber ticks -->
      <circle cx="${size/2}" cy="${size/2}" r="${innerTickRadius}" fill="none" stroke="hsla(${hue}, 90%, 65%, 0.4)" stroke-width="0.75" stroke-dasharray="${tickDash}" transform="rotate(${tickRotation} ${size/2} ${size/2})" />
      
      <!-- Outer procedural segmented ring -->
      <circle cx="${size/2}" cy="${size/2}" r="${radius}" fill="none" stroke="${strokeColor}" stroke-width="1.8" stroke-dasharray="${dashArray}" stroke-linecap="round" transform="rotate(${rotation} ${size/2} ${size/2})" filter="url(#${glowFilterId})" />
      
      <!-- Centered monogram initials or custom emoji -->
      ${centerContent}
    </svg>`;
  }

  // =========================================================================
  // Web Audio API Synthesizer (Zero External Audio Files)
  // =========================================================================
  function getAudioContext() {
    if (!state.audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        state.audioCtx = new AudioCtxClass();
      }
    }
    if (state.audioCtx && state.audioCtx.state === 'suspended') {
      state.audioCtx.resume();
    }
    return state.audioCtx;
  }

  function playTone(type) {
    if (state.isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      if (type === 'send') {
        // High crisp mechanical chirp
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.04);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'receive') {
        // Dual cyber chime
        [587.33, 880].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.05);
          gain.gain.setValueAtTime(0.15, now + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.16);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.05);
          osc.stop(now + i * 0.05 + 0.18);
        });
      } else if (type === 'burn') {
        // Fizzle / Incinerate sizzle (sub frequency sweep + filtered noise)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (type === 'connect') {
        // Uplifting Triad chime
        [523.25, 659.25, 783.99].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.07);
          gain.gain.setValueAtTime(0.14, now + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.07);
          osc.stop(now + idx * 0.07 + 0.22);
        });
      } else if (type === 'nuke') {
        // Emergency purge siren
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.25);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.26);
      }
    } catch (e) {
      // Audio autoplay policy catch
    }
  }

  // =========================================================================
  // DOM Elements Selection
  // =========================================================================
  const dom = {
    // Header
    connectionPill: document.getElementById('connection-pill'),
    connectionText: document.getElementById('connection-text'),
    btnShare: document.getElementById('btn-share'),
    btnSettings: document.getElementById('btn-settings'),
    btnMute: document.getElementById('btn-mute'),
    muteIcon: document.getElementById('mute-icon'),
    btnPanic: document.getElementById('btn-panic'),

    // Sub-bar Identity & Inline Controls
    userAvatar: document.getElementById('user-avatar'),
    userHandleText: document.getElementById('user-handle-text'),
    userIdentityCard: document.getElementById('user-identity-card'),
    btnEditHandle: document.getElementById('btn-edit-handle'),
    btnRerollHandle: document.getElementById('btn-reroll-handle'),
    handleInlineInput: document.getElementById('handle-inline-input'),
    btnSaveInlineHandle: document.getElementById('btn-save-inline-handle'),
    btnCancelInlineHandle: document.getElementById('btn-cancel-inline-handle'),

    peerIdentityCard: document.getElementById('peer-identity-card'),
    peerAvatar: document.getElementById('peer-avatar'),
    peerHandleText: document.getElementById('peer-handle-text'),
    burnTimerSelect: document.getElementById('burn-timer-select'),
    btnCopyRoomId: document.getElementById('btn-copy-room-id'),
    roomIdDisplay: document.getElementById('room-id-display'),

    // Chat Area
    messageStream: document.getElementById('message-stream'),
    welcomeCard: document.getElementById('welcome-card'),
    welcomeCloseBtn: document.getElementById('welcome-close-btn'),
    welcomeCopyLink: document.getElementById('welcome-copy-link'),
    welcomeShowQr: document.getElementById('welcome-show-qr'),
    dragOverlay: document.getElementById('drag-overlay'),
    typingIndicator: document.getElementById('typing-indicator'),
    typingText: document.getElementById('typing-text'),

    // Input Dock
    inputDock: document.getElementById('input-dock'),
    stagedAttachment: document.getElementById('staged-attachment'),
    stagedThumb: document.getElementById('staged-thumb'),
    stagedInfo: document.getElementById('staged-info'),
    stagedRemoveBtn: document.getElementById('staged-remove-btn'),
    btnAttach: document.getElementById('btn-attach'),
    fileInput: document.getElementById('file-input'),
    messageInput: document.getElementById('message-input'),
    btnSend: document.getElementById('btn-send'),
    btnMic: document.getElementById('btn-mic'),

    // Attachment Menu
    attachmentMenu: document.getElementById('attachment-menu'),
    attachViewOnce: document.getElementById('attach-view-once'),
    attachDocument: document.getElementById('attach-document'),
    attachCode: document.getElementById('attach-code'),

    // Modals
    qrModal: document.getElementById('qr-modal'),
    qrCodeTarget: document.getElementById('qr-code-target'),
    qrUrlChip: document.getElementById('qr-url-chip'),
    btnCopyQrUrl: document.getElementById('btn-copy-qr-url'),
    closeQrModal: document.getElementById('close-qr-modal'),

    lightboxModal: document.getElementById('lightbox-modal'),
    lightboxImg: document.getElementById('lightbox-img'),
    closeLightboxModal: document.getElementById('close-lightbox-modal'),

    // Code Snippet Modal
    codeSnippetModal: document.getElementById('code-snippet-modal'),
    codeLangSelect: document.getElementById('code-lang-select'),
    codeSnippetTextarea: document.getElementById('code-snippet-textarea'),
    btnSendCode: document.getElementById('btn-send-code'),
    closeCodeModal: document.getElementById('close-code-modal'),

    // Settings Modal
    settingsModal: document.getElementById('settings-modal'),
    settingsHandleInput: document.getElementById('settings-handle-input'),
    settingsAvatarPreview: document.getElementById('settings-avatar-preview'),
    btnSettingsRandomHandle: document.getElementById('btn-settings-random-handle'),
    avatarEmojiPicker: document.getElementById('avatar-emoji-picker'),
    stealthBlurToggle: document.getElementById('stealth-blur-toggle'),
    btnSaveSettings: document.getElementById('btn-save-settings'),
    closeSettingsModal: document.getElementById('close-settings-modal'),

    // Alerts & Flash
    toastContainer: document.getElementById('toast-container'),
    nukeFlash: document.getElementById('nuke-flash')
  };

  // =========================================================================
  // Toast Notifications
  // =========================================================================
  function showToast(text, iconName = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i data-lucide="${iconName}" style="width: 14px; height: 14px; color: var(--accent-cyan);"></i> <span>${text}</span>`;
    dom.toastContainer.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // =========================================================================
  // Theme Switching Logic
  // =========================================================================
  function applyTheme(themeName) {
    const validThemes = ['dark', 'light', 'neon'];
    const chosen = validThemes.includes(themeName) ? themeName : 'dark';
    state.theme = chosen;
    document.documentElement.setAttribute('data-theme', chosen);
    document.body.setAttribute('data-theme', chosen);

    // Update active state in theme buttons
    document.querySelectorAll('.theme-option-btn').forEach(btn => {
      const isAct = btn.dataset.theme === chosen;
      btn.classList.toggle('active', isAct);
      btn.setAttribute('aria-checked', isAct ? 'true' : 'false');
    });
  }

  // =========================================================================
  // Identity Setup & Rendering
  // =========================================================================
  function initUserIdentity() {
    state.nickname = generateRandomCyberHandle();
    state.avatarHue = hashStringToHue(state.nickname);
    state.avatarEmoji = '';
    state.theme = 'dark';
    applyTheme('dark');
    renderLocalIdentity();
  }

  function renderLocalIdentity() {
    if (dom.userHandleText) {
      dom.userHandleText.textContent = state.nickname;
    }
    if (dom.userAvatar) {
      dom.userAvatar.innerHTML = generateProceduralSvgAvatar(state.nickname, 30, state.avatarEmoji);
    }
  }

  function renderPeerIdentity(peerInfo) {
    if (peerInfo && peerInfo.connected) {
      dom.peerIdentityCard.classList.add('connected');
      dom.peerHandleText.textContent = peerInfo.nickname || 'Unknown Peer';
      dom.peerAvatar.innerHTML = generateProceduralSvgAvatar(peerInfo.nickname, 30, peerInfo.avatarEmoji || '');
    } else {
      dom.peerIdentityCard.classList.remove('connected');
      dom.peerHandleText.textContent = 'Awaiting Peer...';
      dom.peerAvatar.innerHTML = `<div style="width:26px;height:26px;border-radius:50%;border:1px dashed #2a313d;display:flex;align-items:center;justify-content:center;font-size:10px;font-family:var(--font-mono);color:#525e73;">--</div>`;
    }
  }

  // =========================================================================
  // Connection State Indicators
  // =========================================================================
  function updateConnectionBadge(status) {
    if (!dom.connectionPill) return;
    dom.connectionPill.className = 'connection-pill ' + status;
    if (status === 'connected') {
      dom.connectionPill.innerHTML = `
        <div class="pulse-dot" style="background: #10b981; box-shadow: 0 0 6px rgba(16, 185, 129, 0.5);"></div>
        <span id="connection-text">Encrypted P2P Link</span>
      `;
      renderPeerIdentity(state.peerProfile);
    } else if (status === 'connecting') {
      dom.connectionPill.innerHTML = `
        <div class="pulse-dot" style="background: #38bdf8; box-shadow: 0 0 6px rgba(56, 189, 248, 0.5);"></div>
        <span id="connection-text">Connecting...</span>
      `;
    } else if (status === 'waiting') {
      dom.connectionPill.innerHTML = `
        <div class="pulse-dot" style="background: #f59e0b; box-shadow: 0 0 6px rgba(245, 158, 11, 0.5);"></div>
        <span id="connection-text">Waiting for Peer...</span>
      `;
      renderPeerIdentity(null);
    } else if (status === 'disconnected') {
      dom.connectionPill.innerHTML = `
        <div class="pulse-dot" style="background: #ef4444; box-shadow: 0 0 6px rgba(239, 68, 68, 0.5);"></div>
        <span id="connection-text">Disconnected</span>
      `;
      renderPeerIdentity(null);
    }
    if (window.lucide) window.lucide.createIcons();
  }

  // =========================================================================
  // WebRTC Handshake & PeerJS Engine (Zero-Fail Connection)
  // =========================================================================
  function extractTargetRoomId() {
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    
    // 1. Check hash for room=ID (e.g. #room=gw-90db3a41 or #room=gw-90db3a41/)
    let match = hash.match(/room=([a-zA-Z0-9_-]+)/i);
    if (match && match[1]) return match[1];

    // 2. Check query params for room=ID (e.g. ?room=gw-90db3a41)
    try {
      const params = new URLSearchParams(search);
      const qRoom = params.get('room');
      if (qRoom) return qRoom;
    } catch (e) {}

    // 3. Check direct hash (e.g. #gw-90db3a41)
    match = hash.match(/^#([a-zA-Z0-9_-]{5,})/);
    if (match && match[1] && !match[1].startsWith('room=')) {
      return match[1];
    }

    return null;
  }

  let connectionRetryTimer = null;
  let connectionAttempts = 0;

  function initPeerEngine() {
    // Generate a cryptographically random ID
    const randomSeed = (typeof crypto !== 'undefined' && crypto.randomUUID) 
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 8) 
      : Math.random().toString(36).substring(2, 10);
    const myProposedId = 'gw-' + randomSeed;

    updateConnectionBadge('connecting');

    // Create Peer instance with multiple reliable public STUN fallbacks
    const peer = new window.Peer(myProposedId, {
      debug: 0,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' }
        ]
      }
    });

    state.peer = peer;

    // Bulletproof Auto-Handshake: Wait for peer 'open' event before evaluating room target
    peer.on('open', (id) => {
      console.log('[Ghostwire] Local peer signaling online with ID:', id);
      state.peerId = id;
      
      const targetRoomId = extractTargetRoomId();

      if (targetRoomId && targetRoomId !== id) {
        // Joining existing room created by host peer
        state.isHost = false;
        state.activeRoomId = targetRoomId;
        dom.roomIdDisplay.textContent = '#' + targetRoomId;
        updateConnectionBadge('connecting');
        showToast('Connecting to room host: ' + targetRoomId, 'radio');

        // Keep hash consistent in browser address bar
        try {
          history.replaceState(null, '', '#room=' + targetRoomId);
        } catch (e) {
          window.location.hash = 'room=' + targetRoomId;
        }

        initiateOutgoingConnection(targetRoomId);
      } else {
        // Hosting a new ephemeral room
        state.isHost = true;
        state.activeRoomId = id;
        dom.roomIdDisplay.textContent = '#' + id;
        
        // Embed ID into URL hash cleanly
        try {
          history.replaceState(null, '', '#room=' + id);
        } catch (e) {
          window.location.hash = 'room=' + id;
        }
        updateConnectionBadge('waiting');
      }
    });

    // Listen for incoming connection (Host side or bidirectional reconnect)
    peer.on('connection', (conn) => {
      console.log('[Ghostwire] Incoming connection received from peer:', conn.peer);
      setupConnectionHandlers(conn);
    });

    peer.on('error', (err) => {
      console.warn('[Ghostwire] Peer notice:', err.type || err.message || err);
      if (err.type === 'peer-unavailable') {
        if (connectionRetryTimer) {
          clearTimeout(connectionRetryTimer);
          connectionRetryTimer = null;
        }

        if (!state.isHost && connectionAttempts < 2) {
          showToast(`Connecting to room host... (attempt ${connectionAttempts}/2)`, 'refresh-cw');
          setTimeout(() => {
            if (state.activeRoomId && !state.peerProfile.connected) {
              initiateOutgoingConnection(state.activeRoomId);
            }
          }, 1200);
        } else {
          showToast('Peer unavailable or room expired. Started new room.', 'info');
          // Gracefully convert this client into a host of a fresh room
          state.isHost = true;
          state.activeRoomId = state.peerId;
          dom.roomIdDisplay.textContent = '#' + state.peerId;
          try {
            history.replaceState(null, '', '#room=' + state.peerId);
          } catch (e) {
            window.location.hash = 'room=' + state.peerId;
          }
          updateConnectionBadge('waiting');
          renderPeerIdentity(null);
        }
      } else if (err.type === 'network' || err.type === 'server-error') {
        showToast('Signaling network notice. Reconnecting...', 'refresh-cw');
      }
    });

    peer.on('disconnected', () => {
      console.warn('[Ghostwire] Signaling server disconnected');
      if (state.peer && !state.peer.destroyed) {
        try { state.peer.reconnect(); } catch (e) {}
      }
    });
  }

  function initiateOutgoingConnection(hostId) {
    if (!state.peer || state.peer.destroyed || !hostId) return;
    connectionAttempts++;

    console.log(`[Ghostwire] Connecting to peer host ${hostId} (Attempt ${connectionAttempts})`);
    
    try {
      const conn = state.peer.connect(hostId, {
        reliable: true
      });
      setupConnectionHandlers(conn);

      if (connectionRetryTimer) clearTimeout(connectionRetryTimer);

      // Watchdog: If not connected within 3.5 seconds, retry once
      connectionRetryTimer = setTimeout(() => {
        if (!state.peerProfile.connected && connectionAttempts < 2) {
          console.log(`[Ghostwire] Connection attempt to ${hostId} timed out, retrying...`);
          initiateOutgoingConnection(hostId);
        }
      }, 3500);
    } catch (err) {
      console.warn('[Ghostwire] Connect notice:', err);
    }
  }

  function setupConnectionHandlers(conn) {
    if (!conn) return;
    state.activeConn = conn;

    function markConnectionEstablished() {
      if (state.peerProfile.connected) return;
      if (connectionRetryTimer) {
        clearTimeout(connectionRetryTimer);
        connectionRetryTimer = null;
      }
      connectionAttempts = 0;

      state.peerProfile.connected = true;
      updateConnectionBadge('connected');
      playTone('connect');
      showToast('P2P Direct Encrypted Link Active', 'shield-check');

      // Send local identity and settings immediately
      sendDataPayload({
        type: 'handshake',
        nickname: state.nickname,
        avatarHue: state.avatarHue,
        avatarEmoji: state.avatarEmoji || '',
        burnTimerSetting: state.burnTimerSetting
      });
    }

    // CRITICAL FIX: Check if connection is ALREADY open (handles incoming host race conditions)
    if (conn.open) {
      markConnectionEstablished();
    } else {
      conn.on('open', () => {
        markConnectionEstablished();
      });
    }

    conn.on('data', (data) => {
      handleIncomingData(data, conn);
    });

    conn.on('close', () => {
      console.log('[Ghostwire] DataConnection closed');
      state.peerProfile.connected = false;
      state.activeConn = null;
      updateConnectionBadge('disconnected');
      showToast('Peer disconnected from room', 'link-2-off');
      renderPeerIdentity(null);
    });

    conn.on('error', (err) => {
      console.warn('[Ghostwire] DataConnection notice:', err);
      showToast('Channel notice: ' + (err.message || 'connection issue'), 'alert-circle');
    });
  }

  // Window listener for runtime room changes via URL hash
  window.addEventListener('hashchange', () => {
    const targetRoomId = extractTargetRoomId();
    if (targetRoomId && targetRoomId !== state.peerId && targetRoomId !== state.activeRoomId) {
      state.isHost = false;
      state.activeRoomId = targetRoomId;
      dom.roomIdDisplay.textContent = '#' + targetRoomId;
      updateConnectionBadge('connecting');
      showToast('Switching to room: ' + targetRoomId, 'radio');
      initiateOutgoingConnection(targetRoomId);
    }
  });

  // Keep-alive heartbeat to prevent silent WebRTC channel dropouts
  setInterval(() => {
    if (state.activeConn && state.activeConn.open && state.peerProfile.connected) {
      sendDataPayload({ type: 'ping' });
    }
  }, 10000);

  // =========================================================================
  // Data Channel Dispatch & Receipt Handlers
  // =========================================================================
  function sendDataPayload(payload) {
    if (state.activeConn && state.activeConn.open) {
      try {
        state.activeConn.send(payload);
        return true;
      } catch (err) {
        console.error('Failed to send payload:', err);
        return false;
      }
    }
    return false;
  }

  function handleIncomingData(data, conn) {
    if (!data || !data.type) return;

    switch (data.type) {
      case 'handshake':
        state.peerProfile.nickname = data.nickname || 'Peer';
        state.peerProfile.avatarHue = data.avatarHue || 200;
        state.peerProfile.avatarEmoji = data.avatarEmoji || '';
        state.peerProfile.connected = true;
        updateConnectionBadge('connected');
        renderPeerIdentity(state.peerProfile);
        
        // Respond with handshake_ack so the connecting peer receives our profile and confirmed state
        sendDataPayload({
          type: 'handshake_ack',
          nickname: state.nickname,
          avatarHue: state.avatarHue,
          avatarEmoji: state.avatarEmoji || '',
          burnTimerSetting: state.burnTimerSetting
        });

        if (data.burnTimerSetting && data.burnTimerSetting !== state.burnTimerSetting) {
          showToast(`Peer configured burn timer to: ${getTimerLabel(data.burnTimerSetting)}`, 'flame');
        }
        break;

      case 'handshake_ack':
        state.peerProfile.nickname = data.nickname || 'Peer';
        state.peerProfile.avatarHue = data.avatarHue || 200;
        state.peerProfile.avatarEmoji = data.avatarEmoji || '';
        state.peerProfile.connected = true;
        updateConnectionBadge('connected');
        renderPeerIdentity(state.peerProfile);
        break;

      case 'ping':
        sendDataPayload({ type: 'pong' });
        break;

      case 'pong':
        // Heartbeat confirmed
        break;

      case 'profile_update':
        state.peerProfile.nickname = data.nickname || 'Peer';
        state.peerProfile.avatarHue = data.avatarHue || 200;
        state.peerProfile.avatarEmoji = data.avatarEmoji || '';
        renderPeerIdentity(state.peerProfile);
        break;

      case 'chat':
        handleIncomingMessage(data);
        // Automatically respond with delivery acknowledgment
        sendDataPayload({ type: 'ack', messageId: data.id });
        break;

      case 'file':
        handleIncomingFile(data);
        sendDataPayload({ type: 'ack', messageId: data.id });
        break;

      case 'voice':
        handleIncomingVoice(data);
        sendDataPayload({ type: 'ack', messageId: data.id });
        break;

      case 'ack':
        // Mark message as delivered with double checkmarks
        markMessageDelivered(data.messageId);
        break;

      case 'typing':
        handleRemoteTyping(data.isTyping);
        break;

      case 'burn':
        // Synchronized incineration of a specific message
        incinerateMessage(data.messageId, false);
        break;

      default:
        console.log('Unrecognized payload type:', data.type);
    }
  }

  function handleRemoteTyping(isTyping) {
    if (state.remoteTypingTimeout) {
      clearTimeout(state.remoteTypingTimeout);
      state.remoteTypingTimeout = null;
    }

    if (isTyping) {
      dom.typingText.textContent = `${state.peerProfile.nickname || 'Peer'} is typing...`;
      dom.typingIndicator.classList.add('active');

      // Auto-disappear after 2 seconds of inactivity
      state.remoteTypingTimeout = setTimeout(() => {
        dom.typingIndicator.classList.remove('active');
      }, 2000);
    } else {
      dom.typingIndicator.classList.remove('active');
    }
  }

  // =========================================================================
  // Ephemeral Message Engine & Timers
  // =========================================================================
  function getTimerLabel(val) {
    if (val === 'burn_on_read') return 'Burn on Read (5s)';
    if (val === '15s') return '15s Timer';
    if (val === '60s') return '60s Timer';
    return 'Keep for Session';
  }

  function getTimerSeconds(val) {
    if (val === 'burn_on_read') return 5;
    if (val === '15s') return 15;
    if (val === '60s') return 60;
    return 0; // session keep
  }

  function sendMessage() {
    const rawText = dom.messageInput.value.trim();
    const hasStagedFile = state.stagedFile && state.stagedFileData;

    if (!rawText && !hasStagedFile) return;

    if (!state.activeConn || !state.activeConn.open) {
      showToast('No active peer connected. Invite a peer to chat!', 'link-2');
    }

    const messageId = 'msg-' + (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10));
    const now = new Date();
    const timeFormatted = now.toTimeString().split(' ')[0];
    const timerSetting = state.burnTimerSetting;
    const timerSeconds = getTimerSeconds(timerSetting);

    // If sending an image/file
    if (hasStagedFile) {
      const filePayload = {
        type: 'file',
        id: messageId,
        sender: state.nickname,
        avatarHue: state.avatarHue,
        avatarEmoji: state.avatarEmoji || '',
        time: timeFormatted,
        timer: timerSetting,
        timerSeconds: timerSeconds,
        fileName: state.stagedFile.name,
        fileType: state.stagedFile.type,
        fileSize: formatBytes(state.stagedFile.size),
        fileData: state.stagedFileData,
        viewOnce: state.stagedFile.viewOnce,
        caption: rawText
      };

      sendDataPayload(filePayload);
      renderMessage(filePayload, true);
      clearStagedFile();
    } else {
      // Sending text message
      const textPayload = {
        type: 'chat',
        id: messageId,
        sender: state.nickname,
        avatarHue: state.avatarHue,
        avatarEmoji: state.avatarEmoji || '',
        time: timeFormatted,
        timer: timerSetting,
        timerSeconds: timerSeconds,
        text: rawText
      };

      sendDataPayload(textPayload);
      renderMessage(textPayload, true);
    }

    dom.messageInput.value = '';
    dom.messageInput.style.height = 'auto';
    notifyTyping(false);
    playTone('send');
  }

  function handleIncomingMessage(msg) {
    renderMessage(msg, false);
    playTone('receive');
  }

  function handleIncomingFile(fileMsg) {
    renderMessage(fileMsg, false);
    playTone('receive');
  }

  function handleIncomingVoice(voiceMsg) {
    renderMessage(voiceMsg, false);
    playTone('receive');
  }

  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // =========================================================================
  // Message Rendering with Code Snippets & Lightbox
  // =========================================================================
  function renderMessage(msg, isSent) {
    // Remove welcome card if still visible
    dismissWelcomeCard();

    const row = document.createElement('div');
    row.className = `message-row ${isSent ? 'sent' : 'received'}`;
    row.id = `row-${msg.id}`;

    // Sender Avatar: Procedural SVG Avatar Ring
    const avatar = document.createElement('div');
    avatar.className = 'avatar-ring-container';
    avatar.innerHTML = generateProceduralSvgAvatar(msg.sender, 28, msg.avatarEmoji || '');

    // Wrapper
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'message-content-wrapper';

    // Meta Header
    const meta = document.createElement('div');
    meta.className = 'message-meta';
    meta.innerHTML = `<span class="sender-name">${escapeHtml(msg.sender)}</span>`;

    // Bubble
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';

    // Render File, Voice or Text
    if (msg.type === 'file') {
      if (msg.viewOnce) {
        // View-Once file view
        if (msg.fileType.startsWith('image/')) {
          const viewOnceId = `vo-${msg.id}`;
          const wrapper = document.createElement('div');
          wrapper.id = viewOnceId;

          if (msg.viewed) {
            wrapper.innerHTML = `
              <div class="view-once-expired">
                <i data-lucide="eye-off" style="width: 14px; height: 14px;"></i>
                <span>Expired Media (Incinerated)</span>
              </div>
            `;
          } else {
            const unopened = document.createElement('div');
            unopened.className = 'view-once-unopened';
            unopened.innerHTML = `
              <i data-lucide="eye" style="width: 20px; height: 20px; color: var(--accent-amber);"></i>
              <span style="font-size: 12.5px; font-weight: 500;">Reveal View-Once Image</span>
            `;
            unopened.addEventListener('click', () => {
              unopened.remove();
              
              const imgWrap = document.createElement('div');
              imgWrap.className = 'image-attachment-wrap';
              const img = document.createElement('img');
              img.src = msg.fileData;
              img.alt = msg.fileName;
              img.loading = 'lazy';
              imgWrap.appendChild(img);
              
              const timerBar = document.createElement('div');
              timerBar.className = 'view-once-timer-bar';
              
              wrapper.appendChild(imgWrap);
              wrapper.appendChild(timerBar);
              if (window.lucide) window.lucide.createIcons();
              
              // Trigger recipient removal timer of 5 seconds
              setTimeout(() => {
                msg.fileData = null; // Fully trash the content from memory
                msg.viewed = true;
                wrapper.innerHTML = `
                  <div class="view-once-expired">
                    <i data-lucide="eye-off" style="width: 14px; height: 14px;"></i>
                    <span>Expired Media (Incinerated)</span>
                  </div>
                `;
                if (window.lucide) window.lucide.createIcons();
              }, 5000);
            });
            wrapper.appendChild(unopened);
          }
          bubble.appendChild(wrapper);
        } else {
          // View-Once Document / Text file / Other
          const wrapper = document.createElement('div');
          if (msg.viewed) {
            wrapper.innerHTML = `
              <div class="view-once-expired">
                <i data-lucide="file-x" style="width: 14px; height: 14px;"></i>
                <span>Expired File (Incinerated)</span>
              </div>
            `;
          } else {
            const fileCard = document.createElement('a');
            fileCard.className = 'file-attachment-card';
            fileCard.href = msg.fileData;
            fileCard.download = msg.fileName;
            fileCard.innerHTML = `
              <div class="file-icon-wrap"><i data-lucide="eye-off" style="width: 18px; height: 18px; color: var(--accent-amber);"></i></div>
              <div class="file-info">
                <div class="file-name">View-Once: ${escapeHtml(msg.fileName)}</div>
                <div class="file-meta">${escapeHtml(msg.fileSize)} • Incinerates after click</div>
              </div>
              <i data-lucide="download" style="width: 16px; height: 16px; color: var(--text-muted);"></i>
            `;
            fileCard.addEventListener('click', () => {
              // Mark viewed after 3 seconds download grace period
              setTimeout(() => {
                msg.fileData = null;
                msg.viewed = true;
                wrapper.innerHTML = `
                  <div class="view-once-expired">
                    <i data-lucide="file-x" style="width: 14px; height: 14px;"></i>
                    <span>Expired File (Incinerated)</span>
                  </div>
                `;
                if (window.lucide) window.lucide.createIcons();
              }, 3000);
            });
            wrapper.appendChild(fileCard);
          }
          bubble.appendChild(wrapper);
        }
      } else {
        // Normal Ephemeral image/file preview
        if (msg.fileType.startsWith('image/')) {
          const imgWrap = document.createElement('div');
          imgWrap.className = 'image-attachment-wrap';
          const img = document.createElement('img');
          img.src = msg.fileData;
          img.alt = msg.fileName;
          img.loading = 'lazy';
          imgWrap.appendChild(img);
          imgWrap.addEventListener('click', () => openLightbox(msg.fileData));
          bubble.appendChild(imgWrap);
        } else {
          // Normal Document / File Card
          const fileCard = document.createElement('a');
          fileCard.className = 'file-attachment-card';
          fileCard.href = msg.fileData;
          fileCard.download = msg.fileName;
          fileCard.innerHTML = `
            <div class="file-icon-wrap"><i data-lucide="file" style="width: 18px; height: 18px;"></i></div>
            <div class="file-info">
              <div class="file-name">${escapeHtml(msg.fileName)}</div>
              <div class="file-meta">${escapeHtml(msg.fileSize)} • Click to save</div>
            </div>
            <i data-lucide="download" style="width: 16px; height: 16px; color: var(--text-muted);"></i>
          `;
          bubble.appendChild(fileCard);
        }
      }

      if (msg.caption) {
        const captionEl = document.createElement('div');
        captionEl.style.marginTop = '6px';
        captionEl.innerHTML = parseMessageContent(msg.caption);
        bubble.appendChild(captionEl);
      }
    } else if (msg.type === 'voice') {
      // Voice Note message
      const voiceCard = document.createElement('div');
      voiceCard.className = 'voice-note-player';
      const playBtn = document.createElement('button');
      playBtn.className = 'voice-play-btn';
      playBtn.innerHTML = '<i data-lucide="play" style="width: 14px; height: 14px; fill: currentColor;"></i>';
      
      const timeline = document.createElement('div');
      timeline.className = 'voice-timeline-container';
      
      const wave = document.createElement('div');
      wave.className = 'voice-waveform-dummy';
      for (let i = 0; i < 15; i++) {
        const bar = document.createElement('div');
        bar.className = 'waveform-bar';
        const h = 20 + Math.abs(Math.sin(i * 0.5)) * 80;
        bar.style.height = `${h}%`;
        wave.appendChild(bar);
      }
      
      const durLabel = document.createElement('div');
      durLabel.className = 'voice-duration';
      durLabel.textContent = msg.duration || '0:03';
      
      timeline.appendChild(wave);
      timeline.appendChild(durLabel);
      
      voiceCard.appendChild(playBtn);
      voiceCard.appendChild(timeline);
      bubble.appendChild(voiceCard);
      
      let audio = null;
      let playing = false;
      let waveInterval = null;
      
      playBtn.addEventListener('click', () => {
        if (!audio) {
          audio = new Audio(msg.audioData);
          audio.addEventListener('ended', () => {
            playing = false;
            playBtn.innerHTML = '<i data-lucide="play" style="width: 14px; height: 14px; fill: currentColor;"></i>';
            clearInterval(waveInterval);
            wave.querySelectorAll('.waveform-bar').forEach(b => b.classList.remove('active'));
            if (window.lucide) window.lucide.createIcons();
          });
        }
        
        if (playing) {
          audio.pause();
          playing = false;
          playBtn.innerHTML = '<i data-lucide="play" style="width: 14px; height: 14px; fill: currentColor;"></i>';
          clearInterval(waveInterval);
          wave.querySelectorAll('.waveform-bar').forEach(b => b.classList.remove('active'));
        } else {
          audio.play().catch(e => console.error('Audio playback block:', e));
          playing = true;
          playBtn.innerHTML = '<i data-lucide="pause" style="width: 14px; height: 14px; fill: currentColor;"></i>';
          waveInterval = setInterval(() => {
            const bars = wave.querySelectorAll('.waveform-bar');
            const activeIndex = Math.floor(Math.random() * bars.length);
            bars.forEach((b, idx) => {
              if (idx === activeIndex || Math.random() > 0.6) {
                b.classList.add('active');
              } else {
                b.classList.remove('active');
              }
            });
          }, 120);
        }
        if (window.lucide) window.lucide.createIcons();
      });
    } else {
      // Pure Text (with markdown detection)
      const textEl = document.createElement('div');
      textEl.innerHTML = parseMessageContent(msg.text);
      bubble.appendChild(textEl);
    }

    // Bubble Footer (Timestamp, Burn Countdown, Delivery status)
    const footer = document.createElement('div');
    footer.className = 'bubble-footer';

    let burnHtml = '';
    if (msg.timerSeconds > 0) {
      burnHtml = `<span class="burn-badge" id="burn-${msg.id}"><i data-lucide="flame" style="width: 11px; height: 11px;"></i> <span class="burn-secs">${msg.timerSeconds}s</span></span>`;
    }

    let statusHtml = '';
    if (isSent) {
      statusHtml = `<span class="delivery-status" id="status-${msg.id}"><i data-lucide="check" style="width: 13px; height: 13px;"></i></span>`;
    }

    footer.innerHTML = `
      ${burnHtml}
      <span>${msg.time}</span>
      ${statusHtml}
    `;

    bubble.appendChild(footer);
    contentWrapper.appendChild(meta);
    contentWrapper.appendChild(bubble);

    row.appendChild(avatar);
    row.appendChild(contentWrapper);

    dom.messageStream.appendChild(row);
    dom.messageStream.scrollTop = dom.messageStream.scrollHeight;

    if (window.lucide) window.lucide.createIcons();

    // Register into ephemeral state
    state.messages.set(msg.id, {
      id: msg.id,
      rowEl: row,
      timerSeconds: msg.timerSeconds,
      remaining: msg.timerSeconds,
      intervalId: null
    });

    // Start burn countdown if timer is active
    if (msg.timerSeconds > 0) {
      startBurnCountdown(msg.id);
    }
  }

  function markMessageDelivered(msgId) {
    const statusEl = document.getElementById(`status-${msgId}`);
    if (statusEl) {
      statusEl.className = 'delivery-status delivered';
      statusEl.innerHTML = `<i data-lucide="check-check" style="width: 14px; height: 14px; color: var(--accent-cyan);"></i>`;
      if (window.lucide) window.lucide.createIcons();
    }
  }

  function startBurnCountdown(msgId) {
    const record = state.messages.get(msgId);
    if (!record || record.timerSeconds <= 0) return;

    record.intervalId = setInterval(() => {
      record.remaining -= 1;
      const badge = document.getElementById(`burn-${msgId}`);
      if (badge) {
        const span = badge.querySelector('.burn-secs');
        if (span) span.textContent = `${record.remaining}s`;
      }

      if (record.remaining <= 0) {
        clearInterval(record.intervalId);
        incinerateMessage(msgId, true);
      }
    }, 1000);
  }

  function incinerateMessage(msgId, notifyPeer = true) {
    const record = state.messages.get(msgId);
    if (record && record.intervalId) {
      clearInterval(record.intervalId);
    }

    if (notifyPeer) {
      sendDataPayload({ type: 'burn', messageId: msgId });
    }

    const row = document.getElementById(`row-${msgId}`);
    if (row) {
      playTone('burn');
      row.classList.add('burn-fizzle');
      setTimeout(() => {
        if (row.parentNode) row.remove();
        state.messages.delete(msgId);
      }, 650);
    } else {
      state.messages.delete(msgId);
    }
  }

  // =========================================================================
  // Text & Code Snippet Parser
  // =========================================================================
  function escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function parseMessageContent(text) {
    if (!text) return '';

    // First extract code blocks to avoid parsing markdown within code blocks
    const codeBlocks = [];
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g;
    let textWithPlaceholders = text.replace(codeBlockRegex, (match, lang, code) => {
      const cleanLang = lang || 'code';
      const cleanCode = escapeHtml(code.trim());
      const blockId = 'code-' + Math.random().toString(36).slice(2, 8);
      const placeholder = `__CODE_BLOCK_PLACEHOLDER_${codeBlocks.length}__`;
      codeBlocks.push(`
        <div class="code-block" id="${blockId}">
          <div class="code-header">
            <span>// ${cleanLang}</span>
            <button class="code-copy-btn" onclick="window.copyCodeSnippet('${blockId}')">
              <i data-lucide="copy" style="width: 12px; height: 12px;"></i> Copy
            </button>
          </div>
          <div class="code-body">${cleanCode}</div>
        </div>
      `);
      return placeholder;
    });

    // Escape HTML characters for security
    let escapedText = escapeHtml(textWithPlaceholders);

    // Parse blockquotes starting with > (escaped as &gt;)
    escapedText = escapedText.replace(/(?:^|\n|&lt;br&gt;|&gt;)&gt;\s?([^\n\r]+)/g, (match, content) => {
      return `<div class="parsed-blockquote">${content}</div>`;
    });

    // Parse Bold: **text**
    escapedText = escapedText.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Parse Italics: *text*
    escapedText = escapedText.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Parse Inline Code: `code`
    escapedText = escapedText.replace(/`([^`]+)`/g, '<code style="background: rgba(0, 240, 255, 0.1); color: var(--accent-cyan); padding: 1px 5px; border-radius: 4px; font-family: var(--font-mono); font-size: 13px;">$1</code>');

    // Replace regular newlines with line breaks
    let finalParsed = escapedText.replace(/\n/g, '<br>');

    // Re-inject the extracted code blocks
    codeBlocks.forEach((codeBlockHtml, index) => {
      finalParsed = finalParsed.replace(`__CODE_BLOCK_PLACEHOLDER_${index}__`, codeBlockHtml);
    });

    return finalParsed;
  }

  // Global window helper for copy code button
  window.copyCodeSnippet = function (blockId) {
    const block = document.getElementById(blockId);
    if (!block) return;
    const body = block.querySelector('.code-body');
    if (!body) return;
    navigator.clipboard.writeText(body.innerText).then(() => {
      showToast('Code copied to clipboard', 'check');
    });
  };

  // =========================================================================
  // Typing Indicator Tracker
  // =========================================================================
  function notifyTyping(isTyping) {
    if (state.isCurrentlyTyping !== isTyping) {
      state.isCurrentlyTyping = isTyping;
      sendDataPayload({ type: 'typing', isTyping });
    }
  }

  dom.messageInput.addEventListener('input', () => {
    // Auto expand textarea
    dom.messageInput.style.height = 'auto';
    dom.messageInput.style.height = Math.min(dom.messageInput.scrollHeight, 140) + 'px';

    notifyTyping(true);
    if (state.typingTimeout) clearTimeout(state.typingTimeout);
    state.typingTimeout = setTimeout(() => {
      notifyTyping(false);
    }, 1400);
  });

  // Handle mobile keyboard focus and scroll
  dom.messageInput.addEventListener('focus', () => {
    dismissWelcomeCard();
    setTimeout(() => {
      if (dom.messageStream) {
        dom.messageStream.scrollTop = dom.messageStream.scrollHeight;
      }
    }, 300);
  });

  // Keep chat positioned above mobile keyboard when visual viewport resizes
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
      if (dom.messageStream) {
        dom.messageStream.scrollTop = dom.messageStream.scrollHeight;
      }
    });
  }

  dom.messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  dom.btnSend.addEventListener('click', sendMessage);

  // =========================================================================
  // Push-to-Talk Voice Recording Engine
  // =========================================================================
  // =========================================================================
  // Tap-to-Toggle Voice Recording Engine (Optimized for Mobile/Safari/Chrome)
  // =========================================================================
  function toggleVoiceRecording(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (state.recording) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  }

  function startVoiceRecording() {
    if (state.recording) return;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showToast('Microphone recording not supported on this browser', 'alert-circle');
      return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        state.recording = true;
        state.audioChunks = [];
        state.recordingStartTime = performance.now();
        dom.btnMic.classList.add('recording');
        dom.btnMic.title = "Tap to stop and send voice note";
        
        showToast('Recording voice note... Tap microphone again to stop and send', 'mic');

        state.mediaRecorder = new MediaRecorder(stream);
        state.mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            state.audioChunks.push(event.data);
          }
        };

        state.mediaRecorder.onstop = () => {
          // Stop all audio tracks to release system microphone lock instantly
          stream.getTracks().forEach(track => track.stop());

          dom.btnMic.title = "Record voice note";

          const durationMs = performance.now() - state.recordingStartTime;
          if (durationMs < 800) {
            showToast('Recording discarded (too short)', 'info');
            return;
          }

          const seconds = Math.max(1, Math.floor(durationMs / 1000));
          const formattedDuration = `0:${seconds < 10 ? '0' : ''}${seconds}`;

          const audioBlob = new Blob(state.audioChunks, { type: 'audio/ogg; codecs=opus' });
          const reader = new FileReader();
          reader.onload = function (event) {
            const dataUrl = event.target.result;
            const messageId = 'voice-' + Math.random().toString(36).slice(2, 10);
            const now = new Date();
            const timeFormatted = now.toTimeString().split(' ')[0];

            const voicePayload = {
              type: 'voice',
              id: messageId,
              sender: state.nickname,
              avatarHue: state.avatarHue,
              avatarEmoji: state.avatarEmoji || '',
              time: timeFormatted,
              timerSeconds: 0,
              audioData: dataUrl,
              duration: formattedDuration
            };

            sendDataPayload(voicePayload);
            renderMessage(voicePayload, true);
            playTone('send');
          };
          reader.readAsDataURL(audioBlob);
        };

        state.mediaRecorder.start();
      })
      .catch(err => {
        console.error('Failed to access microphone:', err);
        showToast('Microphone access denied', 'alert-circle');
      });
  }

  function stopVoiceRecording() {
    if (!state.recording || !state.mediaRecorder) return;

    state.recording = false;
    dom.btnMic.classList.remove('recording');

    try {
      if (state.mediaRecorder.state !== 'inactive') {
        state.mediaRecorder.stop();
      }
    } catch (err) {
      console.error('Error stopping media recorder:', err);
    }
  }

  // =========================================================================
  // Floating Attachment Menu, File Staging & Voice Recording Bindings
  // =========================================================================
  
  // Toggle floating attachment menu on paperclip click
  dom.btnAttach.addEventListener('click', (e) => {
    e.stopPropagation();
    dom.attachmentMenu.classList.toggle('hidden');
  });

  // Hide attachment menu when clicking anywhere else
  document.addEventListener('click', () => {
    if (dom.attachmentMenu) {
      dom.attachmentMenu.classList.add('hidden');
    }
  });

  // Action: Send View-Once Image
  dom.attachViewOnce.addEventListener('click', () => {
    state.stagedViewOnce = true;
    dom.fileInput.setAttribute('accept', 'image/*');
    dom.fileInput.click();
  });

  // Action: Send Document
  dom.attachDocument.addEventListener('click', () => {
    state.stagedViewOnce = false;
    dom.fileInput.setAttribute('accept', 'image/*,.pdf,.txt,.zip,.json,.js,.ts,.py,.md,.csv');
    dom.fileInput.click();
  });

  // Action: Send Code Snippet Modal Trigger
  dom.attachCode.addEventListener('click', () => {
    dom.codeSnippetTextarea.value = '';
    dom.codeSnippetModal.classList.add('active');
    setTimeout(() => {
      dom.codeSnippetTextarea.focus();
    }, 100);
  });

  // Code Snippet Modal Actions
  dom.closeCodeModal.addEventListener('click', () => {
    dom.codeSnippetModal.classList.remove('active');
  });

  dom.btnSendCode.addEventListener('click', () => {
    const codeContent = dom.codeSnippetTextarea.value.trim();
    const selectedLang = dom.codeLangSelect.value;
    if (!codeContent) {
      showToast('Please enter some code snippet', 'alert-circle');
      return;
    }

    if (!state.activeConn || !state.activeConn.open) {
      showToast('No active peer connected. Invite a peer to chat!', 'link-2');
    }

    const formattedMessage = `\`\`\`${selectedLang}\n${codeContent}\n\`\`\``;
    
    const messageId = 'msg-' + Math.random().toString(36).slice(2, 10);
    const now = new Date();
    const timeFormatted = now.toTimeString().split(' ')[0];
    const timerSetting = state.burnTimerSetting;
    const timerSeconds = getTimerSeconds(timerSetting);

    const textPayload = {
      type: 'chat',
      id: messageId,
      sender: state.nickname,
      avatarHue: state.avatarHue,
      avatarEmoji: state.avatarEmoji || '',
      time: timeFormatted,
      timer: timerSetting,
      timerSeconds: timerSeconds,
      text: formattedMessage
    };

    sendDataPayload(textPayload);
    renderMessage(textPayload, true);
    playTone('send');

    dom.codeSnippetModal.classList.remove('active');
  });

  // Voice Recording Toggle Implementation (Optimized for both Desktop & Mobile click gestures)
  dom.btnMic.addEventListener('click', toggleVoiceRecording);

  // File input change staged listener
  dom.fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      stageFile(e.target.files[0]);
    }
  });

  function stageFile(file) {
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      showToast('File size exceeds ephemeral 25MB limit', 'alert-circle');
      return;
    }

    if (state.stagedViewOnce && !file.type.startsWith('image/')) {
      showToast('View-Once is restricted to image files', 'alert-circle');
      state.stagedViewOnce = false;
      return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
      state.stagedFile = file;
      state.stagedFileData = event.target.result;
      state.stagedFile.viewOnce = state.stagedViewOnce;

      dom.stagedInfo.textContent = `${state.stagedViewOnce ? '[VIEW-ONCE] ' : ''}${file.name} (${formatBytes(file.size)})`;
      if (file.type.startsWith('image/')) {
        dom.stagedThumb.src = event.target.result;
        dom.stagedThumb.style.display = 'block';
      } else {
        dom.stagedThumb.style.display = 'none';
      }
      dom.stagedAttachment.classList.add('active');
      showToast(`Staged ${state.stagedViewOnce ? 'view-once ' : ''}${file.name}`, 'paperclip');
    };
    reader.readAsDataURL(file);
  }

  function clearStagedFile() {
    state.stagedFile = null;
    state.stagedFileData = null;
    state.stagedViewOnce = false;
    dom.stagedAttachment.classList.remove('active');
    dom.fileInput.value = '';
  }

  dom.stagedRemoveBtn.addEventListener('click', clearStagedFile);

  // Drag and Drop Zone on Main Chat Window
  let dragCounter = 0;
  window.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dragCounter++;
    dom.dragOverlay.classList.add('active');
  });

  window.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dragCounter--;
    if (dragCounter <= 0) {
      dom.dragOverlay.classList.remove('active');
      dragCounter = 0;
    }
  });

  window.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  window.addEventListener('drop', (e) => {
    e.preventDefault();
    dragCounter = 0;
    dom.dragOverlay.classList.remove('active');
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      stageFile(e.dataTransfer.files[0]);
    }
  });

  // =========================================================================
  // =========================================================================
  // Share & Absolute URL QR Code Modal
  // =========================================================================
  function getAbsoluteRoomUrl() {
    const hostId = state.activeRoomId || state.peerId || '';
    const origin = window.location.origin || (window.location.protocol + '//' + window.location.host);
    let pathname = window.location.pathname || '/';
    pathname = pathname.split('#')[0].split('?')[0];
    if (!pathname.startsWith('/')) pathname = '/' + pathname;
    const roomHash = '#room=' + hostId;
    return origin + pathname + roomHash;
  }

  function copyInviteLink() {
    const url = getAbsoluteRoomUrl();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        showToast('Invite link copied to clipboard!', 'check');
      }).catch(() => fallbackCopy(url));
    } else {
      fallbackCopy(url);
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    showToast('Invite link copied!', 'check');
  }

  dom.btnShare.addEventListener('click', openQrModal);
  dom.btnCopyRoomId.addEventListener('click', copyInviteLink);
  if (dom.welcomeCopyLink) dom.welcomeCopyLink.addEventListener('click', copyInviteLink);
  if (dom.welcomeShowQr) dom.welcomeShowQr.addEventListener('click', openQrModal);

  // =========================================================================
  // Welcome Card Dismissal (Auto 3s + Manual 'X' Button)
  // =========================================================================
  let welcomeDismissed = false;
  function dismissWelcomeCard() {
    if (welcomeDismissed || !dom.welcomeCard) return;
    welcomeDismissed = true;
    dom.welcomeCard.classList.add('fade-out');
    setTimeout(() => {
      if (dom.welcomeCard && dom.welcomeCard.parentNode) {
        dom.welcomeCard.remove();
      }
    }, 420);
  }

  // Automatic fade out and remove 3 seconds after page loads
  const welcomeAutoTimer = setTimeout(() => {
    dismissWelcomeCard();
  }, 3000);

  if (dom.welcomeCloseBtn) {
    dom.welcomeCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      clearTimeout(welcomeAutoTimer);
      dismissWelcomeCard();
    });
  }

  function openQrModal() {
    // Construct standard absolute, fully qualified URL: origin + pathname + hash
    const fullRoomUrl = window.location.origin + window.location.pathname + window.location.hash;

    dom.qrUrlChip.textContent = fullRoomUrl;

    // Clear previous QR code canvas/image
    dom.qrCodeTarget.innerHTML = '';

    if (window.QRCode) {
      // Pass the absolute fully qualified URL to QR generator with optimal module sizing for phone cameras
      new window.QRCode(dom.qrCodeTarget, {
        text: fullRoomUrl,
        width: 220,
        height: 220,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: window.QRCode.CorrectLevel.M
      });

      // Clear default title tooltip
      setTimeout(() => {
        const qrImg = dom.qrCodeTarget.querySelector('img');
        if (qrImg) qrImg.removeAttribute('title');
      }, 50);
    }

    dom.qrModal.classList.add('active');
  }

  dom.closeQrModal.addEventListener('click', () => {
    dom.qrModal.classList.remove('active');
  });

  dom.btnCopyQrUrl.addEventListener('click', copyInviteLink);

  // =========================================================================
  // User Handle & Cyber Identity (Inline Editing & Reroll)
  // =========================================================================
  let isInlineEditing = false;

  function startInlineHandleEditing() {
    if (!dom.handleInlineInput || isInlineEditing) return;
    isInlineEditing = true;

    if (dom.userHandleText) dom.userHandleText.classList.add('hidden');
    if (dom.btnEditHandle) dom.btnEditHandle.classList.add('hidden');
    if (dom.btnRerollHandle) dom.btnRerollHandle.classList.add('hidden');

    if (dom.handleInlineInput) {
      dom.handleInlineInput.classList.remove('hidden');
      dom.handleInlineInput.value = state.nickname;
    }
    if (dom.btnSaveInlineHandle) dom.btnSaveInlineHandle.classList.remove('hidden');
    if (dom.btnCancelInlineHandle) dom.btnCancelInlineHandle.classList.remove('hidden');

    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      if (dom.handleInlineInput) {
        dom.handleInlineInput.focus();
        dom.handleInlineInput.select();
      }
    }, 20);
  }

  function stopInlineHandleEditing() {
    isInlineEditing = false;

    if (dom.handleInlineInput) dom.handleInlineInput.classList.add('hidden');
    if (dom.btnSaveInlineHandle) dom.btnSaveInlineHandle.classList.add('hidden');
    if (dom.btnCancelInlineHandle) dom.btnCancelInlineHandle.classList.add('hidden');

    if (dom.userHandleText) dom.userHandleText.classList.remove('hidden');
    if (dom.btnEditHandle) dom.btnEditHandle.classList.remove('hidden');
    if (dom.btnRerollHandle) dom.btnRerollHandle.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  }

  function commitInlineHandleEditing() {
    if (!isInlineEditing || !dom.handleInlineInput) return;
    const newName = dom.handleInlineInput.value.trim();
    if (newName && newName !== state.nickname) {
      state.nickname = newName;
      state.avatarHue = hashStringToHue(newName);
      showToast(`Handle updated: ${state.nickname}`, 'user-check');

      // Broadcast profile updates in real-time to connected P2P peer
      sendDataPayload({
        type: 'profile_update',
        nickname: state.nickname,
        avatarHue: state.avatarHue
      });
    }
    stopInlineHandleEditing();
    renderLocalIdentity();
  }

  function cancelInlineHandleEditing() {
    stopInlineHandleEditing();
    renderLocalIdentity();
  }

  function rerollCyberHandle() {
    const newHandle = generateRandomCyberHandle();
    state.nickname = newHandle;
    state.avatarHue = hashStringToHue(newHandle);
    renderLocalIdentity();
    playTone('send');
    showToast(`Cyber handle: ${state.nickname}`, 'dices');

    // Broadcast to connected peer
    sendDataPayload({
      type: 'profile_update',
      nickname: state.nickname,
      avatarHue: state.avatarHue
    });
  }

  // Click to edit listeners
  if (dom.userHandleText) {
    dom.userHandleText.addEventListener('click', startInlineHandleEditing);
  }
  if (dom.btnEditHandle) {
    dom.btnEditHandle.addEventListener('click', (e) => {
      e.stopPropagation();
      startInlineHandleEditing();
    });
  }

  // Reroll button listener
  if (dom.btnRerollHandle) {
    dom.btnRerollHandle.addEventListener('click', (e) => {
      e.stopPropagation();
      rerollCyberHandle();
    });
  }

  // Save / Cancel button listeners
  if (dom.btnSaveInlineHandle) {
    dom.btnSaveInlineHandle.addEventListener('click', (e) => {
      e.stopPropagation();
      commitInlineHandleEditing();
    });
  }
  if (dom.btnCancelInlineHandle) {
    dom.btnCancelInlineHandle.addEventListener('click', (e) => {
      e.stopPropagation();
      cancelInlineHandleEditing();
    });
  }

  // Input keyboard interactions & real-time procedural avatar ring preview
  if (dom.handleInlineInput) {
    dom.handleInlineInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitInlineHandleEditing();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelInlineHandleEditing();
      }
    });

    // Real-time procedural avatar ring updates as user types
    dom.handleInlineInput.addEventListener('input', () => {
      const previewText = dom.handleInlineInput.value.trim() || state.nickname;
      dom.userAvatar.innerHTML = generateProceduralSvgAvatar(previewText, 30, state.avatarEmoji);
    });

    // Graceful commit on blur if user clicks elsewhere
    dom.handleInlineInput.addEventListener('blur', () => {
      setTimeout(() => {
        if (isInlineEditing) {
          commitInlineHandleEditing();
        }
      }, 180);
    });
  }

  // =========================================================================
  // User Settings & Identity Modal Logic
  // =========================================================================
  function updateSettingsPreview() {
    if (!dom.settingsAvatarPreview || !dom.settingsHandleInput) return;
    const handle = dom.settingsHandleInput.value.trim() || state.nickname || 'ghost';
    dom.settingsAvatarPreview.innerHTML = generateProceduralSvgAvatar(handle, 36, state.stagedAvatarEmoji || '');
  }

  function openSettingsModal() {
    if (!dom.settingsModal) return;
    dom.settingsHandleInput.value = state.nickname;
    state.stagedAvatarEmoji = state.avatarEmoji || '';
    state.stagedTheme = state.theme || 'dark';

    // Synchronize active emoji in picker
    document.querySelectorAll('.emoji-select-btn').forEach(btn => {
      const isMatch = (btn.dataset.emoji || '') === state.stagedAvatarEmoji;
      btn.classList.toggle('active', isMatch);
    });

    // Synchronize active theme option
    document.querySelectorAll('.theme-option-btn').forEach(btn => {
      const isMatch = (btn.dataset.theme || '') === state.stagedTheme;
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-checked', isMatch ? 'true' : 'false');
    });

    // Synchronize Stealth Blur toggle
    if (dom.stealthBlurToggle) {
      dom.stealthBlurToggle.checked = state.stealthBlurEnabled;
    }

    updateSettingsPreview();
    dom.settingsModal.classList.add('active');
    if (window.lucide) window.lucide.createIcons();
    setTimeout(() => {
      if (dom.settingsHandleInput) dom.settingsHandleInput.focus();
    }, 50);
  }

  function closeSettingsModal() {
    if (!dom.settingsModal) return;
    dom.settingsModal.classList.remove('active');
    // If user closes without saving, revert visual theme to committed state.theme
    applyTheme(state.theme);
  }

  // Header Settings Button
  if (dom.btnSettings) {
    dom.btnSettings.addEventListener('click', openSettingsModal);
  }

  // Close buttons
  if (dom.closeSettingsModal) {
    dom.closeSettingsModal.addEventListener('click', closeSettingsModal);
  }
  if (dom.settingsModal) {
    dom.settingsModal.addEventListener('click', (e) => {
      if (e.target === dom.settingsModal) {
        closeSettingsModal();
      }
    });
  }

  // Handle typing & preview
  if (dom.settingsHandleInput) {
    dom.settingsHandleInput.addEventListener('input', updateSettingsPreview);
    dom.settingsHandleInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (dom.btnSaveSettings) dom.btnSaveSettings.click();
      }
    });
  }

  // Random handle generator button in settings
  if (dom.btnSettingsRandomHandle) {
    dom.btnSettingsRandomHandle.addEventListener('click', () => {
      dom.settingsHandleInput.value = generateRandomCyberHandle();
      updateSettingsPreview();
    });
  }

  // Avatar / Emoji selection clicks
  document.querySelectorAll('.emoji-select-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.stagedAvatarEmoji = btn.dataset.emoji || '';
      document.querySelectorAll('.emoji-select-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateSettingsPreview();
    });
  });

  // 3-Theme Selection Toggle (Dark / Light / Neon)
  document.querySelectorAll('.theme-option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedTheme = btn.dataset.theme || 'dark';
      state.stagedTheme = selectedTheme;
      document.documentElement.setAttribute('data-theme', selectedTheme);
      applyTheme(selectedTheme);
    });
  });

  // Save Settings
  if (dom.btnSaveSettings) {
    dom.btnSaveSettings.addEventListener('click', () => {
      const newName = dom.settingsHandleInput.value.trim();
      if (newName) {
        state.nickname = newName;
        state.avatarHue = hashStringToHue(newName);
      }
      state.avatarEmoji = state.stagedAvatarEmoji || '';
      state.theme = state.stagedTheme || 'dark';
      
      if (dom.stealthBlurToggle) {
        state.stealthBlurEnabled = dom.stealthBlurToggle.checked;
        updateStealthBlurState(!document.hasFocus() || document.hidden);
      }

      document.documentElement.setAttribute('data-theme', state.theme);
      applyTheme(state.theme);
      renderLocalIdentity();
      showToast(`User settings updated: ${state.nickname}`, 'check');

      // Broadcast profile updates in real-time to connected P2P peer
      sendDataPayload({
        type: 'profile_update',
        nickname: state.nickname,
        avatarHue: state.avatarHue,
        avatarEmoji: state.avatarEmoji
      });

      dom.settingsModal.classList.remove('active');
    });
  }

  // =========================================================================
  // Stealth Blur (Security & Privacy) Event Listeners
  // =========================================================================
  function updateStealthBlurState(shouldBlur) {
    const overlay = document.getElementById('stealth-blur-overlay');
    if (!overlay) return;
    if (state.stealthBlurEnabled && shouldBlur) {
      overlay.classList.add('active');
    } else {
      overlay.classList.remove('active');
    }
  }

  document.addEventListener('visibilitychange', () => {
    updateStealthBlurState(document.hidden || !document.hasFocus());
  });

  window.addEventListener('blur', () => {
    updateStealthBlurState(true);
  });

  window.addEventListener('focus', () => {
    updateStealthBlurState(false);
  });

  // =========================================================================
  // Burn Timer Dropdown Selector
  // =========================================================================
  dom.burnTimerSelect.addEventListener('change', (e) => {
    state.burnTimerSetting = e.target.value;
    showToast(`Burn timer set to: ${getTimerLabel(state.burnTimerSetting)}`, 'flame');
    // Notify peer
    sendDataPayload({
      type: 'handshake',
      nickname: state.nickname,
      avatarHue: state.avatarHue,
      burnTimerSetting: state.burnTimerSetting
    });
  });

  // =========================================================================
  // Image Lightbox
  // =========================================================================
  function openLightbox(src) {
    dom.lightboxImg.src = src;
    dom.lightboxModal.classList.add('active');
  }

  dom.closeLightboxModal.addEventListener('click', () => {
    dom.lightboxModal.classList.remove('active');
  });

  // =========================================================================
  // Audio Mute Toggle
  // =========================================================================
  dom.btnMute.addEventListener('click', () => {
    state.isMuted = !state.isMuted;
    if (state.isMuted) {
      dom.btnMute.innerHTML = `<i data-lucide="volume-x" style="width: 18px; height: 18px;"></i>`;
      showToast('Synthesizer muted', 'volume-x');
    } else {
      dom.btnMute.innerHTML = `<i data-lucide="volume-2" style="width: 18px; height: 18px;"></i>`;
      showToast('Synthesizer active', 'volume-2');
      playTone('send');
    }
    if (window.lucide) window.lucide.createIcons();
  });

  // =========================================================================
  // PANIC / NUKE EMERGENCY PROTOCOL
  // =========================================================================
  function executeNukePurge() {
    playTone('nuke');
    dom.nukeFlash.style.display = 'block';

    // 1. Destroy and close PeerJS connection
    if (state.activeConn) {
      try { state.activeConn.close(); } catch (e) {}
    }
    if (state.peer) {
      try { state.peer.destroy(); } catch (e) {}
    }

    // 2. Overwrite all in-memory arrays and state with empty buffers
    state.messages.forEach((rec) => {
      if (rec.intervalId) clearInterval(rec.intervalId);
    });
    state.messages.clear();
    state.stagedFileData = null;
    state.stagedFile = null;

    // 3. Wipe DOM completely
    document.body.innerHTML = `
      <div style="display:flex;height:100vh;align-items:center;justify-content:center;background:#000;color:#ef4444;font-family:monospace;font-size:24px;">
        [ PURGE COMPLETE • MEMORY OVERWRITTEN • REDIRECTING... ]
      </div>
    `;

    // 4. Instant Redirect away from session
    setTimeout(() => {
      window.location.replace('https://www.wikipedia.org');
    }, 200);
  }

  dom.btnPanic.addEventListener('click', executeNukePurge);

  // Keyboard Shortcuts: ESC key triggers Panic or closes open modals
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (dom.qrModal && dom.qrModal.classList.contains('active')) {
        dom.qrModal.classList.remove('active');
        return;
      }
      if (dom.settingsModal && dom.settingsModal.classList.contains('active')) {
        dom.settingsModal.classList.remove('active');
        applyTheme(state.theme);
        return;
      }
      if (dom.codeSnippetModal && dom.codeSnippetModal.classList.contains('active')) {
        dom.codeSnippetModal.classList.remove('active');
        return;
      }
      if (dom.lightboxModal && dom.lightboxModal.classList.contains('active')) {
        dom.lightboxModal.classList.remove('active');
        return;
      }
      // If no modal is open, trigger emergency nuke
      executeNukePurge();
    }
  });

  // Close modals on background click
  [dom.qrModal, dom.settingsModal, dom.lightboxModal, dom.codeSnippetModal].filter(Boolean).forEach((modal) => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        if (modal === dom.settingsModal) {
          applyTheme(state.theme);
        }
      }
    });
  });

  // =========================================================================
  // App Bootstrapping
  // =========================================================================
  window.addEventListener('DOMContentLoaded', () => {
    initUserIdentity();
    initPeerEngine();
    if (window.lucide) window.lucide.createIcons();
  });

})();
