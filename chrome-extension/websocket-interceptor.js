// This script runs in the page context and intercepts WebSocket
// It MUST run before the page creates any WebSocket connections

(function() {
    'use strict';

    console.log('%c[GOLD HACK] 💰 WebSocket Interceptor Loaded', 'color: #0f0; font-size: 14px; font-weight: bold;');

    // Hack configuration
    window.GOLD_HACK_CONFIG = {
        enabled: true,
        goldAmount: 999999999,
        troopsAmount: 999999999,
        autoHack: true,
        exploitMode: 'negative', // 'negative', 'overflow', 'null', 'all'
        logTraffic: true
    };

    // Store original WebSocket
    const OriginalWebSocket = window.WebSocket;
    const wsConnections = [];

    // Override WebSocket globally
    window.WebSocket = function(url, protocols) {
        console.log('%c[GOLD HACK] 🔌 WebSocket Connection Intercepted!', 'color: #ff0; font-weight: bold;');
        console.log('[GOLD HACK] URL:', url);

        // Create real WebSocket
        const ws = new OriginalWebSocket(url, protocols);
        wsConnections.push(ws);

        // Store original send method
        const originalSend = ws.send.bind(ws);

        // Override send to intercept outgoing messages
        ws.send = function(data) {
            let modified = false;
            let modifiedData = data;

            try {
                const message = JSON.parse(data);

                if (window.GOLD_HACK_CONFIG.logTraffic) {
                    console.log('%c[GOLD HACK] 📤 Outgoing:', 'color: #0af;', message.type);
                }

                const result = hackClientMessage(message);
                if (result.modified) {
                    modifiedData = JSON.stringify(result.message);
                    modified = true;
                    console.log('%c[GOLD HACK] ✨ MESSAGE MODIFIED!', 'color: #f0f; font-weight: bold;');
                    console.log('[GOLD HACK] Original:', message);
                    console.log('[GOLD HACK] Modified:', result.message);
                }
            } catch (e) {
                // Not JSON or error - send original
            }

            return originalSend.call(this, modifiedData);
        };

        // Intercept incoming messages (less useful but good for logging)
        const originalAddEventListener = ws.addEventListener.bind(ws);
        ws.addEventListener = function(type, listener, options) {
            if (type === 'message') {
                const wrappedListener = function(event) {
                    try {
                        const message = JSON.parse(event.data);
                        if (window.GOLD_HACK_CONFIG.logTraffic && message.type !== 'turn') {
                            console.log('%c[GOLD HACK] 📥 Incoming:', 'color: #0f0;', message.type);
                        }
                    } catch (e) {}
                    return listener.call(this, event);
                };
                return originalAddEventListener.call(this, type, wrappedListener, options);
            }
            return originalAddEventListener.call(this, type, listener, options);
        };

        return ws;
    };

    // Preserve WebSocket prototype and constants
    window.WebSocket.prototype = OriginalWebSocket.prototype;
    window.WebSocket.CONNECTING = OriginalWebSocket.CONNECTING;
    window.WebSocket.OPEN = OriginalWebSocket.OPEN;
    window.WebSocket.CLOSING = OriginalWebSocket.CLOSING;
    window.WebSocket.CLOSED = OriginalWebSocket.CLOSED;

    // Main hack logic
    function hackClientMessage(message) {
        if (!window.GOLD_HACK_CONFIG.enabled) {
            return { modified: false, message };
        }

        const type = message.type;

        // EXPLOIT 1: Intercept donate_gold intents
        if (type === 'intent' && message.intent) {
            const intent = message.intent;

            if (intent.type === 'donate_gold') {
                console.log('%c[GOLD HACK] 🎯 DONATE_GOLD INTENT DETECTED!', 'color: #f00; font-weight: bold;');

                const mode = window.GOLD_HACK_CONFIG.exploitMode;
                const goldAmount = window.GOLD_HACK_CONFIG.goldAmount;

                if (mode === 'negative' || mode === 'all') {
                    // NEGATIVE GOLD EXPLOIT
                    // Theory: Send negative gold. Server might:
                    // 1. Not validate sign, causing recipient to lose gold
                    // 2. Cause integer underflow
                    // 3. Cause sender to GAIN gold instead of losing it
                    intent.gold = -Math.abs(goldAmount);
                    console.log('[GOLD HACK] 💉 Applied NEGATIVE GOLD exploit:', intent.gold);
                    return { modified: true, message };
                }

                if (mode === 'overflow' || mode === 'all') {
                    // INTEGER OVERFLOW EXPLOIT
                    // Try to overflow the integer
                    intent.gold = 9007199254740991; // Max safe integer in JS
                    console.log('[GOLD HACK] 💉 Applied OVERFLOW exploit:', intent.gold);
                    return { modified: true, message };
                }

                if (mode === 'null' || mode === 'all') {
                    // NULL/UNDEFINED EXPLOIT
                    // Server code shows: this.gold ??= this.sender.gold() / 3n;
                    // If we send null, it might give us 1/3 of sender's gold!
                    intent.gold = null;
                    console.log('[GOLD HACK] 💉 Applied NULL exploit');
                    return { modified: true, message };
                }
            }

            if (intent.type === 'donate_troops') {
                const mode = window.GOLD_HACK_CONFIG.exploitMode;
                if (mode === 'negative' || mode === 'all') {
                    intent.troops = -Math.abs(window.GOLD_HACK_CONFIG.troopsAmount);
                    console.log('[GOLD HACK] 💉 Applied NEGATIVE TROOPS exploit:', intent.troops);
                    return { modified: true, message };
                }
            }
        }

        return { modified: false, message };
    }

    // Create floating menu
    function createMenu() {
        const menu = document.createElement('div');
        menu.id = 'gold-hack-menu-overlay';
        menu.innerHTML = `
            <style>
                #gold-hack-menu-overlay {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 999999999;
                    font-family: 'Courier New', monospace;
                }
                #gold-hack-menu {
                    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
                    border: 3px solid #0f0;
                    border-radius: 15px;
                    padding: 20px;
                    min-width: 320px;
                    box-shadow: 0 0 40px rgba(0, 255, 0, 0.6);
                    color: #0f0;
                }
                #gold-hack-menu h2 {
                    margin: 0 0 10px 0;
                    font-size: 18px;
                    text-align: center;
                    color: #0f0;
                    text-shadow: 0 0 10px #0f0;
                }
                #gold-hack-menu .subtitle {
                    text-align: center;
                    font-size: 10px;
                    color: #0af;
                    margin-bottom: 15px;
                }
                #gold-hack-menu .status {
                    background: rgba(0, 255, 0, 0.1);
                    padding: 10px;
                    border-radius: 8px;
                    margin-bottom: 15px;
                    font-size: 12px;
                    text-align: center;
                    border: 1px solid #0f0;
                }
                #gold-hack-menu .control {
                    margin-bottom: 12px;
                }
                #gold-hack-menu label {
                    display: block;
                    margin-bottom: 5px;
                    font-size: 12px;
                    color: #aaa;
                }
                #gold-hack-menu input[type="number"] {
                    width: 100%;
                    padding: 8px;
                    background: #000;
                    border: 2px solid #0f0;
                    border-radius: 5px;
                    color: #0f0;
                    font-family: 'Courier New', monospace;
                    font-size: 14px;
                }
                #gold-hack-menu input[type="checkbox"] {
                    width: 18px;
                    height: 18px;
                    margin-right: 8px;
                    vertical-align: middle;
                }
                #gold-hack-menu select {
                    width: 100%;
                    padding: 8px;
                    background: #000;
                    border: 2px solid #0f0;
                    border-radius: 5px;
                    color: #0f0;
                    font-family: 'Courier New', monospace;
                }
                #gold-hack-menu button {
                    width: 100%;
                    padding: 12px;
                    border: none;
                    border-radius: 8px;
                    font-family: 'Courier New', monospace;
                    font-size: 14px;
                    font-weight: bold;
                    cursor: pointer;
                    margin-bottom: 8px;
                    transition: transform 0.2s;
                }
                #gold-hack-menu button:hover {
                    transform: scale(1.05);
                }
                #gold-hack-menu .btn-primary {
                    background: linear-gradient(135deg, #0f0 0%, #0c0 100%);
                    color: #000;
                    box-shadow: 0 4px 15px rgba(0, 255, 0, 0.4);
                }
                #gold-hack-menu .btn-danger {
                    background: linear-gradient(135deg, #f00 0%, #c00 100%);
                    color: #fff;
                }
                #gold-hack-menu .toggle-container {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: rgba(0, 255, 0, 0.05);
                    padding: 10px;
                    border-radius: 6px;
                    margin-bottom: 12px;
                    border: 1px solid #0f0;
                }
                #gold-hack-menu .instructions {
                    background: rgba(0, 170, 255, 0.1);
                    border: 1px solid #0af;
                    border-radius: 6px;
                    padding: 10px;
                    font-size: 10px;
                    color: #0af;
                    margin-top: 10px;
                }
                #gold-hack-menu .warning {
                    background: rgba(255, 0, 0, 0.1);
                    border: 1px solid #f00;
                    border-radius: 6px;
                    padding: 8px;
                    font-size: 10px;
                    color: #f00;
                    margin-bottom: 12px;
                }
            </style>
            <div id="gold-hack-menu">
                <h2>💰 GOLD HACK MENU 💰</h2>
                <div class="subtitle">Multiplayer Edition - Real Server Exploit</div>

                <div class="status" id="hack-status">
                    🟢 ACTIVE - Intercepting Traffic
                </div>

                <div class="warning">
                    ⚠️ This attempts REAL exploits on the server!
                </div>

                <div class="toggle-container">
                    <label style="margin: 0; display: inline;">
                        <input type="checkbox" id="hack-enabled" checked>
                        Enable Hack
                    </label>
                </div>

                <div class="control">
                    <label>💰 Gold Amount</label>
                    <input type="number" id="gold-amount" value="999999999" min="0">
                </div>

                <div class="control">
                    <label>⚔️ Troops Amount</label>
                    <input type="number" id="troops-amount" value="999999999" min="0">
                </div>

                <div class="control">
                    <label>🎯 Exploit Mode</label>
                    <select id="exploit-mode">
                        <option value="negative">Negative Gold (Best)</option>
                        <option value="overflow">Integer Overflow</option>
                        <option value="null">Null/Default</option>
                        <option value="all">Try All</option>
                    </select>
                </div>

                <button class="btn-primary" id="apply-settings">
                    ⚡ Apply Settings
                </button>

                <button class="btn-danger" id="toggle-menu">
                    Hide Menu (Ctrl+H)
                </button>

                <div class="instructions">
                    <strong>📋 HOW TO USE:</strong><br>
                    1. Join a multiplayer game<br>
                    2. Make an alliance with someone<br>
                    3. Try to donate gold to them<br>
                    4. The hack will intercept and modify the amount!<br>
                    <br>
                    <strong>💡 TIP:</strong> Use "Negative Gold" mode for best results
                </div>
            </div>
        `;

        document.body.appendChild(menu);

        // Event listeners
        document.getElementById('hack-enabled').addEventListener('change', (e) => {
            window.GOLD_HACK_CONFIG.enabled = e.target.checked;
            updateStatus();
        });

        document.getElementById('apply-settings').addEventListener('click', () => {
            const goldAmount = parseInt(document.getElementById('gold-amount').value);
            const troopsAmount = parseInt(document.getElementById('troops-amount').value);
            const exploitMode = document.getElementById('exploit-mode').value;

            window.GOLD_HACK_CONFIG.goldAmount = goldAmount;
            window.GOLD_HACK_CONFIG.troopsAmount = troopsAmount;
            window.GOLD_HACK_CONFIG.exploitMode = exploitMode;

            console.log('[GOLD HACK] Settings updated:', window.GOLD_HACK_CONFIG);
            alert('✅ Settings Applied!\n\nGold: ' + goldAmount + '\nTroops: ' + troopsAmount + '\nMode: ' + exploitMode);
        });

        document.getElementById('toggle-menu').addEventListener('click', () => {
            menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        });

        // Keyboard shortcut
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'h') {
                e.preventDefault();
                menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
            }
        });

        // Make draggable
        makeDraggable(document.getElementById('gold-hack-menu'));

        updateStatus();
    }

    function updateStatus() {
        const statusEl = document.getElementById('hack-status');
        if (statusEl) {
            if (window.GOLD_HACK_CONFIG.enabled) {
                statusEl.innerHTML = '🟢 ACTIVE - Intercepting Traffic';
                statusEl.style.borderColor = '#0f0';
                statusEl.style.background = 'rgba(0, 255, 0, 0.1)';
            } else {
                statusEl.innerHTML = '🔴 DISABLED';
                statusEl.style.borderColor = '#f00';
                statusEl.style.background = 'rgba(255, 0, 0, 0.1)';
            }
        }
    }

    function makeDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        const header = element.querySelector('h2');

        if (header) {
            header.style.cursor = 'move';
            header.onmousedown = dragMouseDown;
        }

        function dragMouseDown(e) {
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            element.parentElement.style.top = (element.parentElement.offsetTop - pos2) + "px";
            element.parentElement.style.left = (element.parentElement.offsetLeft - pos1) + "px";
            element.parentElement.style.right = 'auto';
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    // Wait for page to load then create menu
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createMenu);
    } else {
        createMenu();
    }

    // Expose to window for console access
    window.GOLD_HACK = {
        config: window.GOLD_HACK_CONFIG,
        connections: wsConnections,
        setGold: (amount) => {
            window.GOLD_HACK_CONFIG.goldAmount = amount;
            document.getElementById('gold-amount').value = amount;
        },
        setTroops: (amount) => {
            window.GOLD_HACK_CONFIG.troopsAmount = amount;
            document.getElementById('troops-amount').value = amount;
        },
        toggle: () => {
            window.GOLD_HACK_CONFIG.enabled = !window.GOLD_HACK_CONFIG.enabled;
            document.getElementById('hack-enabled').checked = window.GOLD_HACK_CONFIG.enabled;
            updateStatus();
        }
    };

    console.log('%c[GOLD HACK] ✅ Initialization Complete!', 'color: #0f0; font-size: 16px; font-weight: bold;');
    console.log('[GOLD HACK] Menu will appear when page loads');
    console.log('[GOLD HACK] Console API: window.GOLD_HACK');

})();
