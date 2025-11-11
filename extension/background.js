// Background service worker

console.log('[OpenFront Gold Hack] Background script loaded');

// Listen for extension install
chrome.runtime.onInstalled.addListener(() => {
    console.log('[OpenFront Gold Hack] Extension installed');

    // Set default values
    chrome.storage.sync.set({
        enabled: true,
        gold: 999999999,
        troops: 999999999
    });
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('[OpenFront Gold Hack] Message from content script:', request);

    // Log important events
    if (request.type && request.type.startsWith('OPENFRONTHACK_')) {
        console.log('[OpenFront Gold Hack] Event:', request.type);
    }

    return true;
});

// Monitor tab changes to inject script when needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        if (tab.url.includes('openfront.io') || tab.url.includes('localhost')) {
            console.log('[OpenFront Gold Hack] OpenFront tab detected:', tabId);
        }
    }
});
