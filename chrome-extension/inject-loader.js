// This content script injects our WebSocket interceptor into the page
// It MUST run at document_start to intercept WebSocket before the page uses it

(function() {
    'use strict';

    console.log('[Gold Hack Loader] Injecting WebSocket interceptor...');

    // Inject our script into the page context
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('websocket-interceptor.js');
    script.onload = function() {
        console.log('[Gold Hack Loader] WebSocket interceptor injected successfully!');
        this.remove();
    };

    // Inject before any other scripts
    (document.head || document.documentElement).prepend(script);

})();
