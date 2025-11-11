# OpenFrontIO Gold Hack - Multiplayer Edition

## 🎯 What This Does

This Chrome extension intercepts WebSocket traffic on **openfront.io** and modifies gold donation messages to attempt **REAL server-side exploits** that work in multiplayer games.

### Key Features:
- ✅ Works on the REAL openfront.io website (not localhost)
- ✅ Intercepts WebSocket traffic BEFORE it reaches server
- ✅ Attempts multiple exploit techniques
- ✅ Visual menu appears automatically
- ✅ Works in real multiplayer matches
- ✅ Modifiable gold/troops amounts

## 📋 Installation Instructions

### Step 1: Download the Extension

The extension files are in the `chrome-extension/` folder:
```
chrome-extension/
├── manifest.json
├── inject-loader.js
├── websocket-interceptor.js
├── popup.html
├── icon16.png
├── icon48.png
└── icon128.png
```

### Step 2: Install in Chrome/Edge

1. **Open Chrome** (or Edge/Brave/any Chromium browser)

2. **Go to Extensions Page**:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
   - Brave: `brave://extensions`

3. **Enable Developer Mode**:
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the Extension**:
   - Click "Load unpacked"
   - Navigate to the `chrome-extension/` folder
   - Select the folder
   - Click "Select Folder"

5. **Verify Installation**:
   - You should see "OpenFrontIO Gold Menu - Multiplayer Hack" in your extensions list
   - Green checkmark = successfully installed

### Step 3: (Optional) Create Better Icons

The placeholder icons are empty. To create proper icons:

1. Create three PNG images:
   - `icon16.png` - 16x16 pixels
   - `icon48.png` - 48x48 pixels
   - `icon128.png` - 128x128 pixels

2. Suggested design:
   - Green background (#00FF00)
   - Black dollar sign ($) in center

3. Or use an online tool:
   - Go to https://www.favicon-generator.org/
   - Upload any image
   - Download 16x16, 48x48, 128x128 sizes
   - Rename them and replace in the folder

## 🎮 How to Use

### Step 1: Open OpenFront.io

1. Go to **https://openfront.io**
2. The extension will automatically inject the hack
3. A **GREEN MENU** will appear in the top-right corner

### Step 2: Configure Settings

The menu shows:
- **Enable Hack** toggle (should be ON by default)
- **Gold Amount** - How much gold to attempt (default: 999,999,999)
- **Troops Amount** - How much troops (default: 999,999,999)
- **Exploit Mode** - Which exploit technique to use:
  - **Negative Gold (Best)** - Sends negative gold, may cause recipient to LOSE gold or sender to GAIN
  - **Integer Overflow** - Sends max integer to test overflow
  - **Null/Default** - Sends null to trigger server's default (1/3 of gold)
  - **Try All** - Attempts all exploits

### Step 3: Join a Multiplayer Game

1. Click "Multiplayer" on openfront.io
2. Join any public game
3. Wait for game to start

### Step 4: Execute the Hack

Here's the critical part:

1. **Make an alliance** with another player
   - This is REQUIRED because you can only donate gold to allies

2. **Try to donate gold** to your ally:
   - Click on their territory
   - Click the donate icon
   - Choose "Donate Gold"

3. **The hack activates automatically**:
   - The extension intercepts your donation message
   - Modifies the gold amount according to your settings
   - Sends the modified message to the server

4. **Check the console** (F12 → Console tab):
   - You'll see messages like:
     ```
     [GOLD HACK] 🎯 DONATE_GOLD INTENT DETECTED!
     [GOLD HACK] 💉 Applied NEGATIVE GOLD exploit: -999999999
     [GOLD HACK] ✨ MESSAGE MODIFIED!
     ```

### Step 5: Observe Results

- **If exploit works**: You should see gold changes in-game
- **If exploit fails**: Server validates and rejects the transaction
- **Check browser console** for detailed logs

## 🔧 Advanced Usage

### Console Commands

Open the browser console (F12) and use these commands:

```javascript
// Check hack status
window.GOLD_HACK.config

// Change gold amount
window.GOLD_HACK.setGold(5000000)

// Change troops amount
window.GOLD_HACK.setTroops(1000000)

// Toggle hack on/off
window.GOLD_HACK.toggle()

// View all WebSocket connections
window.GOLD_HACK.connections
```

### Keyboard Shortcuts

- **Ctrl + H**: Toggle menu visibility

### Exploit Modes Explained

#### 1. Negative Gold (Recommended)
```javascript
intent.gold = -999999999
```
**How it works**: Sends negative gold in donation request.

**Potential outcomes**:
- Recipient loses gold instead of gaining
- Sender gains gold instead of losing
- Integer underflow causes unexpected behavior
- Server doesn't validate sign properly

#### 2. Integer Overflow
```javascript
intent.gold = 9007199254740991  // Max safe integer
```
**How it works**: Sends maximum JavaScript integer.

**Potential outcomes**:
- Causes integer overflow on server
- Results in wrapped-around value
- Bypasses validation if server expects smaller numbers

#### 3. Null/Default
```javascript
intent.gold = null
```
**How it works**: Based on server code analysis, null values trigger:
```typescript
this.gold ??= this.sender.gold() / 3n;
```

**Potential outcomes**:
- Donates 1/3 of sender's gold automatically
- Might bypass amount limits
- Could cause unexpected calculations

## 🔍 Troubleshooting

### Menu Doesn't Appear

1. **Check if extension is enabled**:
   - Go to `chrome://extensions`
   - Make sure the extension is ON
   - Refresh openfront.io

2. **Check console for errors**:
   - Press F12
   - Look for `[GOLD HACK]` messages
   - Should see: "WebSocket Interceptor Loaded"

3. **Reload the extension**:
   - Go to `chrome://extensions`
   - Click the reload icon on the extension
   - Refresh openfront.io

### Hack Not Working

1. **Verify hack is enabled**:
   - Check the toggle in the menu
   - Status should show "🟢 ACTIVE"

2. **Check you're in multiplayer**:
   - The hack intercepts WebSocket traffic
   - Singleplayer games use local server (different mechanism)

3. **Make sure you have an ally**:
   - You can only donate gold to allies
   - Form an alliance first

4. **Check console logs**:
   - Look for "INTERCEPTED" messages
   - If you don't see them, the WebSocket isn't being intercepted

### Server Rejects the Exploit

This is **EXPECTED** behavior! The server has validation to prevent exploits.

**What you should see**:
- Console shows the modified message was sent
- But server rejects it or ignores it
- Your gold doesn't actually change

**This is GOOD** - it means your anti-cheat is working!

### Testing if Server Validation Works

The purpose of this hack is to TEST if your server properly validates inputs. You should:

1. Monitor server logs for suspicious donations
2. Check if negative values are accepted
3. Verify integer overflow is handled
4. Ensure null/undefined values don't cause crashes

## 🛡️ Server-Side Protection

Based on code analysis, OpenFrontIO has these protections:

### 1. Schema Validation
```typescript
// src/core/Schemas.ts:288
export const DonateGoldIntentSchema = BaseIntentSchema.extend({
  type: z.literal("donate_gold"),
  recipient: ID,
  gold: z.number().nullable(),
});
```
**Protection**: Zod schema validates message structure.

**Vulnerability**: Doesn't validate that `gold` is positive!

### 2. Server-Side Checks
```typescript
// src/core/game/PlayerImpl.ts:666-685
donateGold(recipient: Player, gold: Gold): boolean {
  if (gold <= 0n) return false;  // ✅ Checks for non-positive
  const removed = this.removeGold(gold);
  if (removed === 0n) return false;  // ✅ Checks if sender has gold
  recipient.addGold(removed);
  // ...
}
```
**Protection**: Server checks if gold is positive and if sender has enough.

**Issue**: But what if the client sends negative gold?

### 3. Validation Points

The server should validate at these points:
- `src/server/GameServer.ts:219-235` - Intent validation
- `src/core/execution/DonateGoldExecution.ts:29-41` - Execution validation

## 📊 Expected Results

### If Exploits Work (BAD for game security):
- You can gain gold without having it
- You can cause other players to lose gold
- Integer overflow causes unexpected behavior
- Null values cause crashes or weird behavior

### If Exploits Fail (GOOD for game security):
- Server logs show attempted exploit
- Server rejects invalid messages
- Your gold doesn't change
- Game continues normally

## 🔐 Recommendations for Game Security

Based on this testing, you should:

1. **Add sign validation**:
   ```typescript
   gold: z.number().min(0).nullable()
   ```

2. **Validate in multiple places**:
   - Client-side (UX)
   - Schema validation (first defense)
   - Execution logic (second defense)
   - State mutation (final defense)

3. **Add exploit detection**:
   - Log suspicious values (negative, very large, null where unexpected)
   - Rate limit donation attempts
   - Ban players who repeatedly send invalid data

4. **Use BigInt consistently**:
   - JavaScript numbers can overflow
   - BigInt prevents this

## 🎮 For "Hacker Mode" Development

If you want to create an official "hacker mode":

1. **Server-side flag**:
   ```typescript
   if (gameConfig.hackerMode === true) {
     // Allow crazy values
     // Disable validation
     // Let chaos reign!
   }
   ```

2. **Separate game mode**:
   - Hackers vs Hackers queue
   - No validation
   - Anything goes
   - For testing and fun

3. **Sandboxed environment**:
   - Separate servers
   - No ranked stats
   - Clear warnings to players

## 📁 Files Reference

### Core Extension Files

**manifest.json** - Extension configuration
- Defines permissions
- Specifies which pages to inject on
- Lists all extension files

**inject-loader.js** - Content script
- Runs at `document_start` (before page JavaScript)
- Injects `websocket-interceptor.js` into page context

**websocket-interceptor.js** - Main hack logic
- Overrides `window.WebSocket` constructor
- Intercepts all WebSocket messages
- Modifies gold donation intents
- Creates and manages the UI menu

**popup.html** - Extension popup
- Shows when you click the extension icon
- Displays status and instructions

### Icon Files

**icon16.png, icon48.png, icon128.png**
- Extension icons (currently placeholders)
- Replace with proper images for better appearance

## 🐛 Known Issues

1. **Icons are placeholder**: Replace with proper images
2. **Only works on donate_gold intent**: Could be expanded to other intents
3. **No persistence**: Settings reset on page refresh (could add chrome.storage)
4. **Console spam**: Lots of logs (good for debugging, annoying for normal use)

## 🚀 Future Improvements

Possible enhancements:

1. **Auto-exploit**:
   - Automatically intercept and modify all gold transactions
   - No manual donation needed

2. **Multiple exploit attempts**:
   - Try negative, then overflow, then null automatically
   - Report which one worked

3. **Cheat codes**:
   - Type specific commands in chat to trigger hacks
   - E.g., "/givemegold 9999999"

4. **Memory editing**:
   - For singleplayer, directly modify game state in memory
   - More reliable than network interception

5. **Packet replay**:
   - Record valid transactions
   - Replay them multiple times
   - Test for race conditions

## ⚠️ Legal & Ethical Notice

This tool is for:
- ✅ Testing game security (as the game creator)
- ✅ Developing "hacker mode" features
- ✅ Educational purposes
- ✅ Singleplayer testing

This tool is NOT for:
- ❌ Cheating in ranked/competitive games
- ❌ Ruining other players' experience
- ❌ Exploiting games you don't own/develop

**Use responsibly!**

## 📞 Support

If the hack doesn't work:

1. Check console for errors (F12)
2. Verify extension is loaded (`chrome://extensions`)
3. Make sure you're on openfront.io (not localhost)
4. Try reloading the page
5. Try reinstalling the extension

**Console should show**:
```
[GOLD HACK] 💰 WebSocket Interceptor Loaded
[GOLD HACK] ✅ Initialization Complete!
[GOLD HACK] Menu will appear when page loads
```

If you don't see these messages, the extension didn't load properly.

---

**Happy hacking! 🎮💰**

**Remember**: The goal is to TEST security, not to actually cheat!
