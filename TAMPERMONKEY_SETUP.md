# OpenFrontIO Tampermonkey Script - Gold Hack

This document explains how to install and use the OpenFrontIO Gold Hack Tampermonkey script for testing purposes.

## ⚠️ Important Notice

This script is designed for **testing and development purposes only**. It allows game administrators and testers to modify gold values in both singleplayer and multiplayer games.

## 📋 Prerequisites

1. A web browser (Chrome, Firefox, Edge, or Opera)
2. Tampermonkey extension installed
3. OpenFrontIO game (local or production)

## 🔧 Installation

### Step 1: Install Tampermonkey

Install the Tampermonkey browser extension:
- **Chrome**: [Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- **Firefox**: [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
- **Edge**: [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)
- **Opera**: [Opera Add-ons](https://addons.opera.com/en/extensions/details/tampermonkey-beta/)

### Step 2: Install the Script

1. Open Tampermonkey dashboard (click the extension icon → Dashboard)
2. Click on the **"+"** tab or **"Create a new script"**
3. Copy the entire contents of `openfrontio-gold-hack.user.js`
4. Paste it into the script editor
5. Click **File → Save** (or press Ctrl+S)

### Step 3: Build and Run OpenFrontIO

Since we modified the client code, you need to rebuild:

```bash
# Install dependencies (if not already done)
npm install

# Build the project
npm run build

# Start the development server
npm run dev
```

## 🎮 How to Use

### Starting the Script

1. Navigate to OpenFrontIO (local: `http://localhost:3000` or production: `https://openfront.io`)
2. Start a game (singleplayer or multiplayer)
3. Wait for the game to fully load
4. You'll see a **💰 button** appear in the top-right corner
5. Click the button to open the Gold Hack menu

### Menu Features

#### 1. **Gold Amount Input**
- Enter any amount of gold you want (e.g., 1000000 for 1 million)
- Supports values up to 999,999,999,999 (1 trillion)

#### 2. **Set Gold Button (💸)**
- Applies the specified gold amount to your account
- Works instantly in both singleplayer and multiplayer

#### 3. **Max Gold Button (♾️)**
- Instantly sets your gold to maximum (999,999,999,999)
- One-click solution for unlimited resources

#### 4. **Auto-Maintain Gold Toggle**
- When enabled, automatically maintains your gold at the specified amount
- Updates every 100ms (every game tick)
- Perfect for testing building mechanics without worrying about resources

#### 5. **Current Gold Display**
- Shows your real-time gold amount
- Updates every 500ms

### Keyboard Shortcuts

- **Ctrl+G**: Toggle menu visibility

### Draggable Menu

- Click and drag the menu header to reposition it anywhere on the screen

## 🔍 How It Works

### Technical Overview

The script works by:

1. **Exposing Game State**: Modified `ClientGameRunner.ts` to expose the game instance to `window.__openfrontGame`
2. **Direct Modification**: Accesses `PlayerView.data.gold` and modifies it directly
3. **Client-Side Changes**: All modifications happen client-side

### Behavior in Different Game Modes

#### Singleplayer Mode
- ✅ **Fully Functional**: Changes persist because the game runs locally
- ✅ **No Server Sync**: No server to override your changes
- ✅ **Perfect for Testing**: Ideal for testing building costs, unit purchases, etc.

#### Multiplayer Mode
- ⚠️ **Temporary Effect**: Server may override changes on next update
- ✅ **Auto-Maintain Helps**: The auto-maintain feature keeps reapplying the gold value
- ⚠️ **Use for Testing Only**: Not recommended for actual gameplay

## 🛠️ Code Changes Made

### Modified Files

1. **`src/client/ClientGameRunner.ts`**
   - Added `window.__openfrontGame` exposure in constructor
   - Added public getter methods: `getGameView()`, `getMyPlayer()`, `getClientID()`
   - Added cleanup on game stop

## 🐛 Troubleshooting

### Script Not Loading
- Check Tampermonkey is enabled
- Verify the script is active (green indicator in Tampermonkey icon)
- Check browser console for errors (F12 → Console tab)

### Menu Not Appearing
- Wait for the game to fully load (you should be in-game, not in lobby)
- Try pressing **Ctrl+G** to toggle menu
- Check console for `[OpenFront Gold Hack] Game instance found!` message

### Gold Not Changing
- Make sure you're in an active game (not in lobby)
- Try enabling **Auto-Maintain Gold** mode
- Check if you entered a valid number in the input field

### Gold Resets Immediately (Multiplayer)
- This is expected in multiplayer due to server synchronization
- Solution: Enable **Auto-Maintain Gold** to continuously reapply the value
- Alternatively, test in singleplayer mode

## 📊 Console Commands

The script logs helpful information to the console:

```javascript
// Check if game is loaded
console.log(window.__openfrontGame);

// Get current player
console.log(window.__openfrontGame.getMyPlayer());

// Get current gold
console.log(window.__openfrontGame.getMyPlayer().gold());

// Manually set gold
window.__openfrontGame.getMyPlayer().data.gold = 999999n;
```

## 🔐 Security Considerations

### Why This Works
- Client-side modifications are possible in browser games
- The script modifies the local game state
- In multiplayer, server-side validation should ideally prevent exploits

### Recommendations for Production
If you want to **prevent** Tampermonkey scripts in production:

1. **Server-Side Validation**: Always validate gold/resource changes on the server
2. **Obfuscate Code**: Make it harder to find and modify game objects
3. **Don't Expose to Window**: Remove the `window.__openfrontGame` exposure
4. **Anti-Cheat Detection**: Monitor for suspicious gold increases
5. **Rate Limiting**: Limit how fast resources can be spent/gained

### For Singleplayer Testing
If you want to **allow** scripts in singleplayer only:

1. Keep the window exposure as-is
2. Add server-side validation for multiplayer games
3. Document that modifications are possible in singleplayer

## 📝 License

This script is part of the OpenFrontIO project and follows the same license.

## 🤝 Contributing

Found issues or want to improve the script? Please submit issues or pull requests to the main repository.

---

**Happy Testing! 🎮💰**
