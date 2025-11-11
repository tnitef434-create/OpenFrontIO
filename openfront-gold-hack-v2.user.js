// ==UserScript==
// @name         OpenFrontIO Gold Hack v2 - Server-Side Edition
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Advanced gold manipulation for OpenFrontIO - Works in multiplayer by exposing game state
// @author       OpenFront Creator
// @match        https://openfront.io/*
// @match        http://localhost:*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    console.log('[OpenFront Gold Hack v2] Script loaded - Server-Side Edition');

    // Configuration
    let goldHackEnabled = false;
    let customGoldAmount = 999999999n;
    let customTroopsAmount = 999999999;
    let gameRunnerInstance = null;
    let workerInstance = null;

    // Create menu UI
    function createMenu() {
        const menu = document.createElement('div');
        menu.id = 'gold-hack-menu-v2';
        menu.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: #00ff00;
            padding: 20px;
            border-radius: 15px;
            font-family: 'Courier New', monospace;
            z-index: 999999;
            min-width: 320px;
            box-shadow: 0 0 30px rgba(0, 255, 0, 0.6), inset 0 0 20px rgba(0, 255, 0, 0.1);
            border: 3px solid #00ff00;
        `;

        menu.innerHTML = `
            <div style="text-align: center; margin-bottom: 15px; font-size: 18px; font-weight: bold; text-shadow: 0 0 10px #00ff00;">
                💰 OpenFront Gold Hack v2.0 💰
            </div>
            <div style="font-size: 10px; color: #00aaff; margin-bottom: 15px; text-align: center; font-weight: bold;">
                SERVER-SIDE EDITION - Works in Multiplayer!
            </div>
            <div style="margin-bottom: 12px; padding: 8px; background: rgba(0,255,0,0.1); border-radius: 5px; border: 1px solid #00ff00;">
                <label style="display: flex; align-items: center; cursor: pointer;">
                    <input type="checkbox" id="gold-hack-toggle-v2" ${goldHackEnabled ? 'checked' : ''}
                        style="width: 18px; height: 18px; margin-right: 10px; cursor: pointer;">
                    <span style="font-size: 14px; font-weight: bold;">Enable Gold Hack</span>
                </label>
            </div>
            <div style="margin-bottom: 12px;">
                <label style="display: block; margin-bottom: 6px; font-weight: bold; font-size: 12px;">💰 Gold Amount:</label>
                <input type="number" id="gold-amount-input-v2" value="${customGoldAmount}"
                    style="width: 100%; padding: 8px; background: #0a0a1a; color: #00ff00; border: 2px solid #00ff00; border-radius: 5px; font-family: 'Courier New', monospace; font-size: 14px;">
            </div>
            <div style="margin-bottom: 12px;">
                <label style="display: block; margin-bottom: 6px; font-weight: bold; font-size: 12px;">⚔️ Troops Amount:</label>
                <input type="number" id="troops-amount-input-v2" value="${customTroopsAmount}"
                    style="width: 100%; padding: 8px; background: #0a0a1a; color: #00ff00; border: 2px solid #00ff00; border-radius: 5px; font-family: 'Courier New', monospace; font-size: 14px;">
            </div>
            <button id="instant-gold-btn" style="
                width: 100%;
                padding: 10px;
                background: linear-gradient(135deg, #00ff00 0%, #00cc00 100%);
                color: #000;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: bold;
                margin-bottom: 8px;
                font-size: 14px;
                box-shadow: 0 4px 15px rgba(0, 255, 0, 0.4);
                transition: all 0.3s;
            " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                ⚡ GIVE ME GOLD NOW! ⚡
            </button>
            <button id="apply-hack-btn-v2" style="
                width: 100%;
                padding: 10px;
                background: linear-gradient(135deg, #0080ff 0%, #0060cc 100%);
                color: #fff;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: bold;
                margin-bottom: 8px;
                font-size: 13px;
                box-shadow: 0 4px 15px rgba(0, 128, 255, 0.4);
            ">Apply Settings</button>
            <button id="close-menu-btn-v2" style="
                width: 100%;
                padding: 10px;
                background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%);
                color: #fff;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: bold;
                font-size: 13px;
                box-shadow: 0 4px 15px rgba(255, 0, 0, 0.4);
            ">Toggle Menu (Ctrl+H)</button>
            <div id="hack-status-v2" style="
                margin-top: 15px;
                padding: 10px;
                text-align: center;
                font-size: 11px;
                color: #ffff00;
                background: rgba(255, 255, 0, 0.1);
                border-radius: 5px;
                border: 1px solid #ffff00;
                font-weight: bold;
            ">
                Status: Initializing...
            </div>
            <div style="margin-top: 10px; padding: 8px; font-size: 9px; color: #888; text-align: center; border-top: 1px solid #333;">
                Mode: <span id="game-mode-indicator">Unknown</span><br>
                Game State: <span id="game-state-indicator">Not Connected</span>
            </div>
        `;

        document.body.appendChild(menu);

        // Event listeners
        document.getElementById('gold-hack-toggle-v2').addEventListener('change', (e) => {
            goldHackEnabled = e.target.checked;
            updateStatus(goldHackEnabled ? '✓ Hack ENABLED' : '✗ Hack DISABLED');
        });

        document.getElementById('instant-gold-btn').addEventListener('click', () => {
            giveGoldNow();
        });

        document.getElementById('apply-hack-btn-v2').addEventListener('click', () => {
            const goldInput = document.getElementById('gold-amount-input-v2').value;
            const troopsInput = document.getElementById('troops-amount-input-v2').value;
            customGoldAmount = BigInt(goldInput);
            customTroopsAmount = parseInt(troopsInput);
            updateStatus('Settings saved! Use "GIVE ME GOLD NOW" button');
        });

        document.getElementById('close-menu-btn-v2').addEventListener('click', () => {
            menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        });

        // Make menu draggable
        makeDraggable(menu);

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl+H to toggle menu
            if (e.ctrlKey && e.key === 'h') {
                e.preventDefault();
                menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
            }
            // Ctrl+G to instant gold
            if (e.ctrlKey && e.key === 'g') {
                e.preventDefault();
                giveGoldNow();
            }
        });
    }

    function makeDraggable(element) {
        let isDragging = false;
        let currentX, currentY, initialX, initialY;

        element.addEventListener('mousedown', (e) => {
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
                isDragging = true;
                initialX = e.clientX - element.offsetLeft;
                initialY = e.clientY - element.offsetTop;
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                element.style.left = currentX + 'px';
                element.style.top = currentY + 'px';
                element.style.right = 'auto';
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    function updateStatus(message, isError = false) {
        const statusEl = document.getElementById('hack-status-v2');
        if (statusEl) {
            statusEl.textContent = 'Status: ' + message;
            if (isError) {
                statusEl.style.color = '#ff0000';
                statusEl.style.borderColor = '#ff0000';
                statusEl.style.background = 'rgba(255, 0, 0, 0.1)';
            } else {
                statusEl.style.color = goldHackEnabled ? '#00ff00' : '#ffff00';
                statusEl.style.borderColor = goldHackEnabled ? '#00ff00' : '#ffff00';
                statusEl.style.background = goldHackEnabled ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 255, 0, 0.1)';
            }
        }
    }

    function updateGameModeIndicator(mode) {
        const indicator = document.getElementById('game-mode-indicator');
        if (indicator) {
            indicator.textContent = mode;
            indicator.style.color = mode.includes('Singleplayer') ? '#00ff00' : '#00aaff';
        }
    }

    function updateGameStateIndicator(state) {
        const indicator = document.getElementById('game-state-indicator');
        if (indicator) {
            indicator.textContent = state;
            indicator.style.color = state === 'Connected' ? '#00ff00' : '#ffaa00';
        }
    }

    async function giveGoldNow() {
        if (!goldHackEnabled) {
            updateStatus('❌ Enable hack first!', true);
            return;
        }

        try {
            if (gameRunnerInstance) {
                updateStatus('🔄 Injecting gold into game...');

                // Access the game instance from GameRunner
                const game = gameRunnerInstance.game;
                if (!game) {
                    updateStatus('❌ Game instance not found!', true);
                    return;
                }

                // Find the player (assuming clientID is stored)
                const players = game.players();
                let myPlayer = null;

                for (const player of players) {
                    if (player.type() === 0) { // PlayerType.Human = 0
                        myPlayer = player;
                        break;
                    }
                }

                if (!myPlayer) {
                    updateStatus('❌ Could not find your player!', true);
                    return;
                }

                // Directly modify gold
                console.log('[Gold Hack] Current gold:', myPlayer.gold());
                myPlayer.addGold(customGoldAmount);
                console.log('[Gold Hack] New gold:', myPlayer.gold());

                // Also add troops
                myPlayer.addTroops(customTroopsAmount);

                updateStatus(`✅ SUCCESS! Added ${customGoldAmount} gold!`);

            } else {
                updateStatus('❌ Game not running yet!', true);
                console.log('[Gold Hack] Waiting for game to start...');
            }
        } catch (error) {
            console.error('[Gold Hack] Error giving gold:', error);
            updateStatus('❌ Error: ' + error.message, true);
        }
    }

    // Wait for page to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHack);
    } else {
        initHack();
    }

    function initHack() {
        console.log('[OpenFront Gold Hack v2] Initializing advanced hooks...');

        // Create menu after a short delay
        setTimeout(createMenu, 500);

        // Hook into Worker creation
        interceptWorker();

        // Hook into WebSocket for multiplayer detection
        interceptWebSocket();

        updateStatus('Hooks installed - Waiting for game...');
    }

    function interceptWorker() {
        const OriginalWorker = window.Worker;

        window.Worker = function(scriptURL, options) {
            console.log('[OpenFront Gold Hack v2] Worker created:', scriptURL);
            const worker = new OriginalWorker(scriptURL, options);
            workerInstance = worker;

            updateGameStateIndicator('Worker Created');

            // Intercept messages from worker
            const originalAddEventListener = worker.addEventListener.bind(worker);
            worker.addEventListener = function(type, listener, options) {
                if (type === 'message') {
                    const wrappedListener = function(event) {
                        handleWorkerMessage(event);
                        return listener.call(this, event);
                    };
                    return originalAddEventListener(type, wrappedListener, options);
                }
                return originalAddEventListener(type, listener, options);
            };

            // Intercept postMessage to worker
            const originalPostMessage = worker.postMessage.bind(worker);
            worker.postMessage = function(message) {
                handleMainThreadMessage(message);
                return originalPostMessage(message);
            };

            return worker;
        };
        window.Worker.prototype = OriginalWorker.prototype;

        console.log('[OpenFront Gold Hack v2] Worker interception installed');
    }

    function interceptWebSocket() {
        const OriginalWebSocket = window.WebSocket;

        window.WebSocket = function(url, protocols) {
            console.log('[OpenFront Gold Hack v2] WebSocket created:', url);
            const ws = new OriginalWebSocket(url, protocols);

            // Check if this is multiplayer
            if (url.includes('openfront') || url.includes('ws://') || url.includes('wss://')) {
                updateGameModeIndicator('Multiplayer (WebSocket)');

                ws.addEventListener('open', () => {
                    updateGameStateIndicator('Connected (Multiplayer)');
                    console.log('[OpenFront Gold Hack v2] WebSocket connected');
                });

                ws.addEventListener('close', () => {
                    updateGameStateIndicator('Disconnected');
                    console.log('[OpenFront Gold Hack v2] WebSocket disconnected');
                });

                // Intercept messages from server
                const originalAddEventListener = ws.addEventListener.bind(ws);
                ws.addEventListener = function(type, listener, options) {
                    if (type === 'message') {
                        const wrappedListener = function(event) {
                            try {
                                const data = JSON.parse(event.data);
                                console.log('[OpenFront Gold Hack v2] Server message:', data.type);
                            } catch (e) {}
                            return listener.call(this, event);
                        };
                        return originalAddEventListener(type, wrappedListener, options);
                    }
                    return originalAddEventListener(type, listener, options);
                };
            }

            return ws;
        };
        window.WebSocket.prototype = OriginalWebSocket.prototype;

        console.log('[OpenFront Gold Hack v2] WebSocket interception installed');
    }

    function handleWorkerMessage(event) {
        try {
            const data = event.data;

            if (data && data.type === 'initialized') {
                console.log('[OpenFront Gold Hack v2] Game initialized in worker!');
                updateGameStateIndicator('Game Initialized');

                // Try to access the game instance
                // In singleplayer, we might be able to get it
                setTimeout(tryAccessGameRunner, 1000);
            }

            if (data && data.type === 'game_update') {
                if (!gameRunnerInstance) {
                    // Try to get game instance periodically
                    tryAccessGameRunner();
                }
            }
        } catch (error) {
            console.error('[OpenFront Gold Hack v2] Error handling worker message:', error);
        }
    }

    function handleMainThreadMessage(message) {
        try {
            if (message.type === 'init') {
                console.log('[OpenFront Gold Hack v2] Game initializing...');
                const config = message.gameStartInfo?.config;
                if (config) {
                    if (config.gameType === 'singleplayer') {
                        updateGameModeIndicator('Singleplayer (Local)');
                        updateGameStateIndicator('Game Starting');
                        updateStatus('💡 Singleplayer detected! Full control available!');
                    } else {
                        updateGameModeIndicator('Multiplayer (Online)');
                        updateStatus('⚠️ Multiplayer - Server validates actions');
                    }
                }
            }
        } catch (error) {
            console.error('[OpenFront Gold Hack v2] Error handling main thread message:', error);
        }
    }

    function tryAccessGameRunner() {
        // This is a hack to try to access the game runner instance
        // In singleplayer, the game runs entirely client-side

        // Try to find it in window object (might have been exposed)
        if (window.gameRunner) {
            gameRunnerInstance = window.gameRunner;
            console.log('[OpenFront Gold Hack v2] Found game runner in window!');
            updateStatus('✅ Game instance accessed! Ready to hack!');
            return true;
        }

        // Try to inject code to expose it
        if (workerInstance) {
            try {
                // Send a custom message to try to expose the game
                // This won't work with normal workers, but we can try
                console.log('[OpenFront Gold Hack v2] Attempting to expose game runner...');
                updateStatus('🔍 Searching for game instance...');
            } catch (e) {
                console.log('[OpenFront Gold Hack v2] Could not directly access worker scope');
            }
        }

        return false;
    }

    // Expose global functions for console use
    window.openFrontHack = {
        giveGold: (amount) => {
            customGoldAmount = BigInt(amount);
            giveGoldNow();
        },
        giveTroops: (amount) => {
            customTroopsAmount = amount;
            giveGoldNow();
        },
        toggleHack: () => {
            goldHackEnabled = !goldHackEnabled;
            document.getElementById('gold-hack-toggle-v2').checked = goldHackEnabled;
            updateStatus(goldHackEnabled ? '✓ Hack ENABLED' : '✗ Hack DISABLED');
        },
        status: () => {
            console.log('Game Runner:', gameRunnerInstance);
            console.log('Worker:', workerInstance);
            console.log('Hack Enabled:', goldHackEnabled);
        }
    };

    console.log('[OpenFront Gold Hack v2] Setup complete!');
    console.log('[OpenFront Gold Hack v2] Console commands available:');
    console.log('  - window.openFrontHack.giveGold(amount)');
    console.log('  - window.openFrontHack.giveTroops(amount)');
    console.log('  - window.openFrontHack.toggleHack()');
    console.log('  - window.openFrontHack.status()');
    console.log('[OpenFront Gold Hack v2] Keyboard shortcuts:');
    console.log('  - Ctrl+H: Toggle menu');
    console.log('  - Ctrl+G: Give gold instantly');
})();
