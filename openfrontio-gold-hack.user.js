// ==UserScript==
// @name         OpenFrontIO Gold Hack
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Add unlimited gold to OpenFrontIO - Works in Singleplayer & Multiplayer (for testing)
// @author       OpenFront Team
// @match        https://openfront.io/*
// @match        http://localhost:*/*
// @match        http://127.0.0.1:*/*
// @icon         https://openfront.io/favicon.ico
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    console.log('[OpenFront Gold Hack] Script loaded');

    // Configuration
    let goldAmount = 1000000n; // Default 1 million gold
    let autoGoldEnabled = false;
    let menuVisible = false;
    let gameInstance = null;
    let updateInterceptor = null;

    // Wait for game to load
    function waitForGame() {
        const checkInterval = setInterval(() => {
            if (window.__openfrontGame) {
                gameInstance = window.__openfrontGame;
                console.log('[OpenFront Gold Hack] Game instance found!');
                clearInterval(checkInterval);
                initializeHack();
            }
        }, 500);
    }

    // Create the menu UI
    function createMenu() {
        const menuHTML = `
            <div id="openfrontGoldHackMenu" style="
                position: fixed;
                top: 100px;
                right: 20px;
                width: 320px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: 2px solid #fff;
                border-radius: 12px;
                padding: 20px;
                z-index: 999999;
                font-family: 'Arial', sans-serif;
                color: white;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                display: none;
            ">
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                    cursor: move;
                    user-select: none;
                " id="menuHeader">
                    <h3 style="margin: 0; font-size: 18px; font-weight: bold;">💰 OpenFront Gold Hack</h3>
                    <button id="closeMenuBtn" style="
                        background: rgba(255,255,255,0.2);
                        border: none;
                        color: white;
                        width: 28px;
                        height: 28px;
                        border-radius: 50%;
                        cursor: pointer;
                        font-size: 18px;
                        line-height: 1;
                        transition: all 0.2s;
                    ">×</button>
                </div>

                <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500;">
                        Gold Amount:
                    </label>
                    <input type="number" id="goldAmountInput" value="1000000" style="
                        width: 100%;
                        padding: 10px;
                        border: 2px solid rgba(255,255,255,0.3);
                        border-radius: 6px;
                        background: rgba(255,255,255,0.9);
                        color: #333;
                        font-size: 16px;
                        font-weight: bold;
                        box-sizing: border-box;
                    ">
                </div>

                <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                    <button id="setGoldBtn" style="
                        flex: 1;
                        padding: 12px;
                        background: #10b981;
                        border: none;
                        color: white;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: bold;
                        font-size: 14px;
                        transition: all 0.2s;
                        box-shadow: 0 4px 12px rgba(16,185,129,0.3);
                    ">
                        💸 Set Gold
                    </button>
                    <button id="maxGoldBtn" style="
                        flex: 1;
                        padding: 12px;
                        background: #f59e0b;
                        border: none;
                        color: white;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: bold;
                        font-size: 14px;
                        transition: all 0.2s;
                        box-shadow: 0 4px 12px rgba(245,158,11,0.3);
                    ">
                        ♾️ Max Gold
                    </button>
                </div>

                <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <label style="display: flex; align-items: center; cursor: pointer; user-select: none;">
                        <input type="checkbox" id="autoGoldToggle" style="
                            width: 20px;
                            height: 20px;
                            margin-right: 10px;
                            cursor: pointer;
                        ">
                        <span style="font-size: 14px; font-weight: 500;">Auto-Maintain Gold</span>
                    </label>
                    <p style="margin: 8px 0 0 30px; font-size: 12px; opacity: 0.9; line-height: 1.4;">
                        Automatically keeps your gold at the set amount
                    </p>
                </div>

                <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 6px; margin-bottom: 10px;">
                    <div style="font-size: 12px; opacity: 0.9; margin-bottom: 5px;">Current Gold:</div>
                    <div id="currentGoldDisplay" style="font-size: 20px; font-weight: bold;">N/A</div>
                </div>

                <div style="font-size: 11px; opacity: 0.7; text-align: center; margin-top: 10px;">
                    ⚠️ For testing purposes only
                </div>
            </div>

            <button id="toggleMenuBtn" style="
                position: fixed;
                top: 60px;
                right: 20px;
                width: 50px;
                height: 50px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: 2px solid white;
                border-radius: 50%;
                cursor: pointer;
                font-size: 24px;
                z-index: 999998;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                transition: all 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
            ">💰</button>
        `;

        document.body.insertAdjacentHTML('beforeend', menuHTML);
        attachEventListeners();
        makeDraggable();
    }

    // Make menu draggable
    function makeDraggable() {
        const menu = document.getElementById('openfrontGoldHackMenu');
        const header = document.getElementById('menuHeader');
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        header.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);

        function dragStart(e) {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            isDragging = true;
        }

        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                xOffset = currentX;
                yOffset = currentY;
                setTranslate(currentX, currentY, menu);
            }
        }

        function dragEnd() {
            isDragging = false;
        }

        function setTranslate(xPos, yPos, el) {
            el.style.transform = `translate(${xPos}px, ${yPos}px)`;
        }
    }

    // Attach event listeners
    function attachEventListeners() {
        document.getElementById('toggleMenuBtn').addEventListener('click', toggleMenu);
        document.getElementById('closeMenuBtn').addEventListener('click', toggleMenu);
        document.getElementById('setGoldBtn').addEventListener('click', setGold);
        document.getElementById('maxGoldBtn').addEventListener('click', setMaxGold);
        document.getElementById('autoGoldToggle').addEventListener('change', toggleAutoGold);
        document.getElementById('goldAmountInput').addEventListener('input', updateGoldAmount);

        // Add hover effects
        const buttons = document.querySelectorAll('button[id$="Btn"]');
        buttons.forEach(btn => {
            btn.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.05)';
                this.style.filter = 'brightness(1.1)';
            });
            btn.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
                this.style.filter = 'brightness(1)';
            });
        });
    }

    // Toggle menu visibility
    function toggleMenu() {
        const menu = document.getElementById('openfrontGoldHackMenu');
        menuVisible = !menuVisible;
        menu.style.display = menuVisible ? 'block' : 'none';
    }

    // Update gold amount from input
    function updateGoldAmount() {
        const input = document.getElementById('goldAmountInput');
        const value = parseInt(input.value);
        if (!isNaN(value) && value >= 0) {
            goldAmount = BigInt(value);
        }
    }

    // Set gold to specified amount
    function setGold() {
        if (!gameInstance) {
            alert('Game not loaded yet!');
            return;
        }

        try {
            const player = gameInstance.getMyPlayer();
            if (player && player.data) {
                player.data.gold = goldAmount;
                console.log(`[OpenFront Gold Hack] Set gold to ${goldAmount}`);
                showNotification(`Gold set to ${goldAmount.toLocaleString()}!`, 'success');
                updateCurrentGoldDisplay();
            } else {
                showNotification('Player not found! Are you in a game?', 'error');
            }
        } catch (error) {
            console.error('[OpenFront Gold Hack] Error setting gold:', error);
            showNotification('Error setting gold!', 'error');
        }
    }

    // Set max gold
    function setMaxGold() {
        goldAmount = 999999999999n; // ~1 trillion
        document.getElementById('goldAmountInput').value = goldAmount.toString();
        setGold();
    }

    // Toggle auto gold
    function toggleAutoGold(e) {
        autoGoldEnabled = e.target.checked;
        if (autoGoldEnabled) {
            startAutoGold();
            showNotification('Auto-Gold enabled!', 'success');
        } else {
            stopAutoGold();
            showNotification('Auto-Gold disabled!', 'info');
        }
    }

    // Auto gold interval
    let autoGoldInterval = null;
    function startAutoGold() {
        if (autoGoldInterval) return;
        autoGoldInterval = setInterval(() => {
            if (gameInstance) {
                try {
                    const player = gameInstance.getMyPlayer();
                    if (player && player.data) {
                        player.data.gold = goldAmount;
                        updateCurrentGoldDisplay();
                    }
                } catch (error) {
                    console.error('[OpenFront Gold Hack] Auto-gold error:', error);
                }
            }
        }, 100); // Update every 100ms (every game tick)
    }

    function stopAutoGold() {
        if (autoGoldInterval) {
            clearInterval(autoGoldInterval);
            autoGoldInterval = null;
        }
    }

    // Update current gold display
    function updateCurrentGoldDisplay() {
        const display = document.getElementById('currentGoldDisplay');
        if (!display) return;

        try {
            const player = gameInstance?.getMyPlayer();
            if (player && player.data) {
                const currentGold = player.data.gold || 0n;
                display.textContent = currentGold.toLocaleString();
            } else {
                display.textContent = 'N/A';
            }
        } catch (error) {
            display.textContent = 'Error';
        }
    }

    // Show notification
    function showNotification(message, type = 'info') {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#3b82f6'
        };

        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 9999999;
            font-family: Arial, sans-serif;
            font-size: 14px;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Initialize the hack
    function initializeHack() {
        createMenu();
        showNotification('OpenFront Gold Hack Loaded!', 'success');

        // Update display periodically
        setInterval(updateCurrentGoldDisplay, 500);

        console.log('[OpenFront Gold Hack] Initialized successfully');
        console.log('[OpenFront Gold Hack] Available commands:');
        console.log('  - Click the 💰 button to open the menu');
        console.log('  - Use "Set Gold" to apply custom amount');
        console.log('  - Use "Max Gold" for maximum gold');
        console.log('  - Enable "Auto-Maintain" to keep gold constant');
    }

    // Start waiting for game
    waitForGame();

    // Also add keyboard shortcut (Ctrl+G) to toggle menu
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'g') {
            e.preventDefault();
            toggleMenu();
        }
    });

    console.log('[OpenFront Gold Hack] Waiting for game to load...');
    console.log('[OpenFront Gold Hack] Press Ctrl+G to toggle menu once in-game');
})();
