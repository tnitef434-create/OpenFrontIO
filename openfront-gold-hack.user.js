// ==UserScript==
// @name         OpenFrontIO Gold Hack Menu
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Testing script for OpenFrontIO gold manipulation - For testing hacker mode
// @author       OpenFront Creator
// @match        https://openfront.io/*
// @match        http://localhost:*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    console.log('[OpenFront Gold Hack] Script loaded');

    // Configuration
    let goldHackEnabled = false;
    let customGoldAmount = 999999999n;
    let customTroopsAmount = 999999999;

    // Create menu UI
    function createMenu() {
        const menu = document.createElement('div');
        menu.id = 'gold-hack-menu';
        menu.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.9);
            color: #0f0;
            padding: 15px;
            border-radius: 10px;
            font-family: 'Courier New', monospace;
            z-index: 999999;
            min-width: 280px;
            box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
            border: 2px solid #0f0;
        `;

        menu.innerHTML = `
            <div style="text-align: center; margin-bottom: 10px; font-size: 16px; font-weight: bold;">
                🎮 OpenFront Gold Hack 🎮
            </div>
            <div style="font-size: 11px; color: #888; margin-bottom: 10px; text-align: center;">
                Testing Mode - Hacker Mode Development
            </div>
            <div style="margin-bottom: 10px;">
                <label style="display: block; margin-bottom: 5px;">
                    <input type="checkbox" id="gold-hack-toggle" ${goldHackEnabled ? 'checked' : ''}>
                    Enable Gold Hack
                </label>
            </div>
            <div style="margin-bottom: 10px;">
                <label style="display: block; margin-bottom: 5px;">Gold Amount:</label>
                <input type="number" id="gold-amount-input" value="${customGoldAmount}"
                    style="width: 100%; padding: 5px; background: #111; color: #0f0; border: 1px solid #0f0; border-radius: 3px;">
            </div>
            <div style="margin-bottom: 10px;">
                <label style="display: block; margin-bottom: 5px;">Troops Amount:</label>
                <input type="number" id="troops-amount-input" value="${customTroopsAmount}"
                    style="width: 100%; padding: 5px; background: #111; color: #0f0; border: 1px solid #0f0; border-radius: 3px;">
            </div>
            <button id="apply-hack-btn" style="
                width: 100%;
                padding: 8px;
                background: #0f0;
                color: #000;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
                margin-bottom: 5px;
            ">Apply Hack</button>
            <button id="close-menu-btn" style="
                width: 100%;
                padding: 8px;
                background: #f00;
                color: #fff;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
            ">Close Menu</button>
            <div id="hack-status" style="margin-top: 10px; padding: 5px; text-align: center; font-size: 11px; color: #ff0;">
                Status: Waiting for game...
            </div>
        `;

        document.body.appendChild(menu);

        // Event listeners
        document.getElementById('gold-hack-toggle').addEventListener('change', (e) => {
            goldHackEnabled = e.target.checked;
            updateStatus(goldHackEnabled ? 'Hack ENABLED ✓' : 'Hack DISABLED ✗');
        });

        document.getElementById('apply-hack-btn').addEventListener('click', () => {
            const goldInput = document.getElementById('gold-amount-input').value;
            const troopsInput = document.getElementById('troops-amount-input').value;
            customGoldAmount = BigInt(goldInput);
            customTroopsAmount = parseInt(troopsInput);
            updateStatus('Settings applied! Hack active: ' + goldHackEnabled);
        });

        document.getElementById('close-menu-btn').addEventListener('click', () => {
            menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        });

        // Make menu draggable
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;

        menu.addEventListener('mousedown', (e) => {
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
                isDragging = true;
                initialX = e.clientX - menu.offsetLeft;
                initialY = e.clientY - menu.offsetTop;
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                menu.style.left = currentX + 'px';
                menu.style.top = currentY + 'px';
                menu.style.right = 'auto';
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Add keyboard shortcut (Ctrl+G) to toggle menu
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'g') {
                e.preventDefault();
                menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
            }
        });
    }

    function updateStatus(message) {
        const statusEl = document.getElementById('hack-status');
        if (statusEl) {
            statusEl.textContent = 'Status: ' + message;
            statusEl.style.color = goldHackEnabled ? '#0f0' : '#ff0';
        }
    }

    // Wait for page to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHack);
    } else {
        initHack();
    }

    function initHack() {
        console.log('[OpenFront Gold Hack] Initializing...');

        // Create menu after a short delay to ensure body exists
        setTimeout(createMenu, 500);

        // Intercept Worker creation to hook into game updates
        const OriginalWorker = window.Worker;
        window.Worker = function(scriptURL, options) {
            console.log('[OpenFront Gold Hack] Worker created:', scriptURL);
            const worker = new OriginalWorker(scriptURL, options);

            // Intercept messages from worker
            const originalAddEventListener = worker.addEventListener.bind(worker);
            worker.addEventListener = function(type, listener, options) {
                if (type === 'message') {
                    const wrappedListener = function(event) {
                        if (goldHackEnabled && event.data) {
                            modifyGameUpdate(event);
                        }
                        return listener.call(this, event);
                    };
                    return originalAddEventListener(type, wrappedListener, options);
                }
                return originalAddEventListener(type, listener, options);
            };

            // Also intercept onmessage setter
            let onmessageHandler = null;
            Object.defineProperty(worker, 'onmessage', {
                get: () => onmessageHandler,
                set: function(handler) {
                    onmessageHandler = function(event) {
                        if (goldHackEnabled && event.data) {
                            modifyGameUpdate(event);
                        }
                        if (handler) {
                            return handler.call(this, event);
                        }
                    };
                }
            });

            return worker;
        };
        window.Worker.prototype = OriginalWorker.prototype;

        updateStatus('Hack initialized - Press Ctrl+G to toggle menu');
    }

    function modifyGameUpdate(event) {
        try {
            const data = event.data;

            // Check if this is a game update message
            if (data && data.type === 'game_update' && data.gameUpdate) {
                const update = data.gameUpdate;

                // Check if there are player updates
                if (update.updates && Array.isArray(update.updates)) {
                    let modified = false;

                    update.updates.forEach((item, index) => {
                        // PlayerUpdate has type: 0 (GameUpdateType.Player)
                        if (item.type === 2 && item.gold !== undefined) {
                            // Modify gold for all players when hack is enabled
                            // This will show up in UI but won't affect server-side game state
                            console.log(`[OpenFront Gold Hack] Modifying player ${item.name} gold from ${item.gold} to ${customGoldAmount}`);
                            item.gold = customGoldAmount;
                            item.troops = customTroopsAmount;
                            modified = true;
                        }
                    });

                    if (modified) {
                        updateStatus(`Gold hacked! (${customGoldAmount})`);
                    }
                }
            }
        } catch (error) {
            console.error('[OpenFront Gold Hack] Error modifying game update:', error);
        }
    }

    console.log('[OpenFront Gold Hack] Setup complete. Press Ctrl+G to open menu.');
})();
