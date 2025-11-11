// Popup script
document.addEventListener('DOMContentLoaded', function() {
    const enableToggle = document.getElementById('enableToggle');
    const goldInput = document.getElementById('goldInput');
    const troopsInput = document.getElementById('troopsInput');
    const applyBtn = document.getElementById('applyBtn');
    const injectBtn = document.getElementById('injectBtn');

    // Load saved settings
    chrome.storage.sync.get(['enabled', 'gold', 'troops'], function(data) {
        enableToggle.checked = data.enabled !== false;
        if (data.gold) goldInput.value = data.gold;
        if (data.troops) troopsInput.value = data.troops;
    });

    // Update status
    updateStatus();
    setInterval(updateStatus, 2000);

    // Event listeners
    enableToggle.addEventListener('change', function() {
        const enabled = this.checked;
        chrome.storage.sync.set({ enabled: enabled });
        sendToContentScript('setEnabled', { enabled: enabled });
        updateStatusText(enabled ? 'ENABLED ✓' : 'DISABLED ✗');
    });

    applyBtn.addEventListener('click', function() {
        const gold = parseInt(goldInput.value);
        const troops = parseInt(troopsInput.value);

        chrome.storage.sync.set({
            gold: gold,
            troops: troops
        });

        sendToContentScript('setGold', { amount: gold });
        sendToContentScript('setTroops', { amount: troops });

        updateStatusText('Settings Applied!');
        setTimeout(updateStatus, 1000);
    });

    injectBtn.addEventListener('click', function() {
        updateStatusText('Injecting gold...');
        sendToContentScript('injectGold', {}, function(response) {
            if (response && response.success) {
                updateStatusText('Gold injected! ✓');
            } else {
                updateStatusText('Injection failed - See console');
            }
            setTimeout(updateStatus, 2000);
        });
    });

    function sendToContentScript(action, data, callback) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: action,
                    ...data
                }, callback);
            }
        });
    }

    function updateStatus() {
        sendToContentScript('getStatus', {}, function(response) {
            if (response) {
                updateStatusText(response.enabled ? 'ENABLED ✓' : 'DISABLED ✗');
                document.getElementById('connection-status').textContent =
                    response.wsConnected ? 'Connected ✓' : 'Not Connected';
                document.getElementById('connection-status').className =
                    'status-value' + (response.wsConnected ? '' : ' inactive');
            }
        });

        // Check if we're on the right page
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                const url = tabs[0].url;
                if (url && (url.includes('openfront.io') || url.includes('localhost'))) {
                    document.getElementById('game-mode').textContent = 'OpenFront Detected ✓';
                    document.getElementById('game-mode').className = 'status-value';
                } else {
                    document.getElementById('game-mode').textContent = 'Not on OpenFront';
                    document.getElementById('game-mode').className = 'status-value inactive';
                }
            }
        });
    }

    function updateStatusText(text) {
        const statusEl = document.getElementById('hack-status');
        statusEl.textContent = text;
        statusEl.className = text.includes('✓') || text.includes('ENABLED')
            ? 'status-value' : 'status-value inactive';
    }
});
