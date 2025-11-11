# OpenFrontIO Gold Hack Script - Testing Documentation

## ⚠️ Purpose
This script is for **TESTING ONLY** to explore the feasibility of:
1. Creating a "hacker mode" where players can play against each other with cheats enabled
2. Testing anti-cheat mechanisms
3. Evaluating security of the game's client-side code

## 🎯 What This Script Does

This userscript intercepts game updates from the OpenFrontIO worker thread and modifies the gold/troops values displayed to the player.

### Important Limitations:
- **Client-side only**: This modifies what YOU see, not the actual server state
- **Visual hack**: The server still validates all actions, so you can't actually spend more gold than you have
- **Testing tool**: Useful for testing UI behavior and potential future "hacker mode" features

## 📦 Installation Instructions

### Method 1: Browser Extension (Tampermonkey) - RECOMMENDED

1. **Install Tampermonkey Extension**:
   - **Chrome**: https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo
   - **Firefox**: https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/
   - **Edge**: https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd
   - **Safari**: https://apps.apple.com/us/app/tampermonkey/id1482490089
   - **Opera**: https://addons.opera.com/en/extensions/details/tampermonkey-beta/

2. **Install the Script**:
   - Click on the Tampermonkey icon in your browser
   - Click "Create a new script"
   - Delete all the default content
   - Copy the entire contents of `openfront-gold-hack.user.js`
   - Paste it into the editor
   - Press Ctrl+S (or Cmd+S on Mac) to save

3. **Verify Installation**:
   - The Tampermonkey icon should show a badge with "1" indicating one script is active
   - The script will now run automatically on openfront.io

### Method 2: Browser Console (Temporary - Per Session)

1. **Open Browser Developer Tools**:
   - Press `F12` or `Ctrl+Shift+I` (Windows/Linux)
   - Press `Cmd+Option+I` (Mac)

2. **Navigate to Console Tab**

3. **Paste and Execute**:
   - Open `openfront-gold-hack.user.js`
   - Copy the entire script (starting from line after the metadata block)
   - Paste into the console
   - Press Enter

4. **Note**: This method requires re-pasting the script every time you refresh the page

### Method 3: Bookmarklet (Quick Access)

1. **Create a Bookmark**:
   - Right-click your bookmarks bar
   - Click "Add Page" or "Add Bookmark"

2. **Configure Bookmark**:
   - Name: "OpenFront Gold Hack"
   - URL: Paste the entire script wrapped like this:
     ```javascript
     javascript:(function(){/* PASTE SCRIPT HERE */})();
     ```

3. **Usage**:
   - Visit openfront.io
   - Click the bookmark to activate the hack

## 🎮 How to Use

### Starting the Hack

1. **Load the Game**:
   - Go to https://openfront.io
   - Join or create a game (singleplayer or multiplayer)

2. **Open the Hack Menu**:
   - The menu appears automatically in the top-right corner
   - Or press `Ctrl+G` to show/hide the menu

### Using the Menu

The hack menu provides:

- **Enable Gold Hack**: Toggle checkbox to activate/deactivate the hack
- **Gold Amount**: Set how much gold you want to display (default: 999,999,999)
- **Troops Amount**: Set how much troops you want to display (default: 999,999,999)
- **Apply Hack**: Click to apply your custom gold/troops amounts
- **Close Menu**: Hide/show the menu (or use Ctrl+G)

### Controls

- **Ctrl+G**: Toggle menu visibility
- **Drag**: Click and drag the menu title to reposition it
- **Status Display**: Shows current hack status at the bottom of the menu

## 🔧 Technical Details

### How It Works

1. **Worker Interception**:
   - OpenFrontIO runs its game logic in a Web Worker
   - The script intercepts the `Worker` constructor to hook into worker communications

2. **Message Modification**:
   - Game updates flow from the worker to the main thread
   - The script intercepts messages with type `game_update`
   - It modifies PlayerUpdate objects (type: 2) to change gold/troops values

3. **Display Manipulation**:
   - The modified values are displayed in the UI
   - The actual game state on the server remains unchanged

### Code Architecture

The game architecture (based on exploration):
```
Server (Node.js)
  ↓ WebSocket
Client Main Thread (Browser)
  ↓ postMessage
Web Worker (Game Logic)
  ↓ Game Updates
Client UI (What you see)  ← [HACK INTERCEPTS HERE]
```

### Key Files in OpenFrontIO (Reference)

- `src/core/game/PlayerImpl.ts:70-71` - Server-side gold storage
- `src/core/game/GameView.ts:362-364` - Client-side gold getter
- `src/core/game/GameUpdates.ts:146-174` - PlayerUpdate interface
- `src/core/worker/WorkerClient.ts` - Worker message handler
- `src/server/GameServer.ts:217-244` - Server validation (prevents actual cheating)

## 🚫 Limitations & Why This Doesn't Actually Cheat

### Server-Side Validation

The OpenFrontIO server validates all player actions:

1. **Intent Validation** (`src/server/GameServer.ts:219-235`):
   - All player intents (attacks, donations, upgrades) are validated by schemas
   - The server checks if you have enough gold before executing actions

2. **Hash Verification** (`src/core/game/PlayerImpl.ts:1124-1129`):
   - The game computes hashes of the game state
   - This prevents state manipulation

3. **Rate Limiting** (`src/server/GameServer.ts:153-164`):
   - IP-based rate limiting prevents spam
   - Multi-account detection active

### What Actually Happens

When you "hack" gold to 999,999,999:
- **Your UI shows**: 999,999,999 gold ✓
- **You try to donate 1 million gold**: Server rejects (insufficient funds) ✗
- **You try to upgrade a unit**: Server checks real balance, denies if insufficient ✗

The server is the **source of truth**, not the client.

## 🎯 Testing Scenarios

### Scenario 1: Singleplayer Testing
```
1. Start a singleplayer game
2. Enable the gold hack
3. Set gold to 999,999,999
4. Observe UI behavior
5. Try to perform expensive actions
6. Note: In singleplayer, since the game runs locally, the hack might be more effective
```

### Scenario 2: Multiplayer Testing
```
1. Join a multiplayer game
2. Enable the gold hack
3. Observe that UI shows modified gold
4. Try to perform expensive actions
5. Note: Server will reject actions that exceed real gold amount
6. This tests the visual UI only
```

### Scenario 3: Hacker Mode Development
```
1. Use this as a prototype for a "hacker mode" feature
2. In this mode, the server could intentionally allow modified values
3. Players could agree to play in "anything goes" mode
4. Useful for testing extreme game scenarios
```

## 🔍 Debugging

### Check if Script is Running

Open browser console (F12) and look for:
```
[OpenFront Gold Hack] Script loaded
[OpenFront Gold Hack] Initializing...
[OpenFront Gold Hack] Setup complete. Press Ctrl+G to open menu.
```

### Check Worker Interception

You should see:
```
[OpenFront Gold Hack] Worker created: [worker URL]
```

### Check Gold Modification

When hack is active and game is running:
```
[OpenFront Gold Hack] Modifying player [name] gold from [old] to [new]
```

### Common Issues

1. **Menu doesn't appear**:
   - Wait a few seconds after page load
   - Press Ctrl+G to toggle visibility
   - Check console for errors

2. **Hack doesn't work**:
   - Make sure "Enable Gold Hack" is checked
   - Click "Apply Hack" after changing values
   - Ensure you're in an active game

3. **Script not loading**:
   - For Tampermonkey: Check that script is enabled
   - For console: Make sure to paste AFTER page loads
   - Check @match URLs in script metadata

## 🛡️ Security Implications

### Why This Is Educational

This script demonstrates:
1. **Client-side code is never secure**: Anything running in the browser can be modified
2. **Server validation is essential**: The game correctly validates all actions server-side
3. **UI manipulation is easy**: But doesn't compromise game integrity

### Defense Mechanisms in OpenFrontIO

The game already implements:
- Schema validation with Zod
- Server-side state management
- Hash verification
- Rate limiting
- Multi-account detection
- Intent validation

## 📝 Future Development Ideas

### Potential "Hacker Mode" Features

1. **Sanctioned Cheat Mode**:
   - Server explicitly allows modified values
   - All players opt-in to "chaos mode"
   - No rank/stats tracking

2. **Sandbox Mode**:
   - Practice mode with unlimited resources
   - Test strategies without consequences

3. **Debug Mode**:
   - Developer tools for testing
   - Instant building, unlimited resources
   - Map manipulation

## ⚖️ Legal & Ethical Notes

- This script is for **testing and educational purposes only**
- Created by the game creator for development purposes
- Using this in competitive play without disclosure is unethical
- The script doesn't actually provide unfair advantages due to server validation
- Always respect the game's terms of service

## 🤝 Contributing

If you're working on OpenFrontIO development and want to extend this script:

1. The script is located at: `openfront-gold-hack.user.js`
2. Key function to modify: `modifyGameUpdate(event)`
3. Game update structure: See `src/core/game/GameUpdates.ts`
4. Worker protocol: See `src/core/worker/WorkerMessages.ts`

## 📞 Support

For issues or questions:
1. Check browser console for error messages
2. Ensure you're using the latest version of the script
3. Test in multiple browsers if issues persist
4. Verify the game itself is working properly

## 🔄 Version History

- **v1.0** (Current):
  - Initial release
  - Gold and troops manipulation
  - Interactive UI menu
  - Keyboard shortcuts
  - Worker interception

---

**Remember**: This is a testing tool for game development. The actual game remains secure due to server-side validation. Use responsibly! 🎮
