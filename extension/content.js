// Content script - runs in isolated context
// Injects our script into the actual page context

(function() {
    'use strict';

    console.log('[OpenFront Gold Hack] Content script loaded');

    // Inject our script into the page
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('injected.js');
    script.onload = function() {
        this.remove();
        console.log('[OpenFront Gold Hack] Injected script inserted into page');
    };
    (document.head || document.documentElement).appendChild(script);

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'getStatus') {
            // Get status from injected script
            const script = `
                (function() {
                    if (window.__openFrontHack) {
                        return window.__openFrontHack.getStatus();
                    }
                    return null;
                })();
            `;

            const result = eval(script);
            sendResponse(result);
        }

        else if (request.action === 'setEnabled') {
            window.postMessage({
                type: 'OPENFRONTHACK_SET_ENABLED',
                enabled: request.enabled
            }, '*');
            sendResponse({success: true});
        }

        else if (request.action === 'setGold') {
            window.postMessage({
                type: 'OPENFRONTHACK_SET_GOLD',
                amount: request.amount
            }, '*');
            sendResponse({success: true});
        }

        else if (request.action === 'setTroops') {
            window.postMessage({
                type: 'OPENFRONTHACK_SET_TROOPS',
                amount: request.amount
            }, '*');
            sendResponse({success: true});
        }

        else if (request.action === 'injectGold') {
            window.postMessage({
                type: 'OPENFRONTHACK_INJECT_GOLD'
            }, '*');
            sendResponse({success: true});
        }

        return true; // Keep channel open for async response
    });

    // Bridge messages between injected script and extension
    window.addEventListener('message', (event) => {
        if (event.source !== window) return;

        if (event.data.type && event.data.type.startsWith('OPENFRONTHACK_')) {
            // Forward to background script if needed
            chrome.runtime.sendMessage(event.data);
        }
    });

})();
