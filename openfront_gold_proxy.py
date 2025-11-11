#!/usr/bin/env python3
"""
OpenFrontIO Gold Hack - mitmproxy Script
This intercepts WebSocket traffic and modifies gold-related messages
Works in multiplayer by modifying packets before they reach the server

Installation:
1. pip install mitmproxy
2. Run: mitmweb -s openfront_gold_proxy.py
3. Configure browser to use proxy (localhost:8080)
4. Install mitmproxy certificate
"""

import json
import mitmproxy.http
from mitmproxy import ctx, websocket

class OpenFrontGoldHack:
    def __init__(self):
        self.enabled = True
        self.custom_gold = 999999999
        self.custom_troops = 999999999
        self.target_player_id = None
        ctx.log.info("🎮 OpenFront Gold Hack initialized!")
        ctx.log.info("💰 Gold will be set to: {}".format(self.custom_gold))

    def websocket_message(self, flow: websocket.WebSocketFlow):
        """Intercept WebSocket messages"""
        message = flow.messages[-1]

        try:
            # Try to parse as JSON
            data = json.loads(message.content)

            # Check if this is from client to server
            if message.from_client:
                self.handle_client_message(data, message)
            else:
                # From server to client
                self.handle_server_message(data, message)

        except json.JSONDecodeError:
            pass  # Not JSON, ignore
        except Exception as e:
            ctx.log.error(f"Error processing message: {e}")

    def handle_client_message(self, data, message):
        """Modify client messages before they reach the server"""

        if not self.enabled:
            return

        msg_type = data.get('type')

        # Log all outgoing messages
        ctx.log.info(f"📤 Client -> Server: {msg_type}")

        # Intercept donate gold intents - try to exploit by sending massive amounts
        if msg_type == 'intent' and isinstance(data.get('intent'), dict):
            intent = data['intent']
            intent_type = intent.get('type')

            if intent_type == 'donate_gold':
                ctx.log.warn(f"🎯 INTERCEPTED DONATE_GOLD INTENT!")
                ctx.log.warn(f"   Original gold: {intent.get('gold')}")

                # Try exploiting: send negative gold to actually gain gold
                # OR send NULL to trigger default (1/3 of sender's gold)
                # OR send massive amount hoping server doesn't validate properly

                # Method 1: Negative gold exploit attempt
                intent['gold'] = -self.custom_gold
                ctx.log.warn(f"   🔧 Modified to NEGATIVE: {intent['gold']}")
                ctx.log.warn(f"   (Attempting negative gold exploit)")

                message.content = json.dumps(data).encode()

            elif intent_type == 'donate_troops':
                ctx.log.warn(f"🎯 INTERCEPTED DONATE_TROOPS INTENT!")
                intent['troops'] = -self.custom_troops
                ctx.log.warn(f"   🔧 Modified troops to: {intent['troops']}")
                message.content = json.dumps(data).encode()

    def handle_server_message(self, data, message):
        """Modify server messages before they reach the client"""

        if not self.enabled:
            return

        msg_type = data.get('type')

        # Log important server messages
        if msg_type in ['start', 'turn', 'prestart']:
            ctx.log.info(f"📥 Server -> Client: {msg_type}")

        # When game starts, capture our player ID
        if msg_type == 'start':
            game_start = data.get('gameStartInfo', {})
            ctx.log.info(f"🎮 GAME STARTED!")
            ctx.log.info(f"   Game ID: {game_start.get('gameID')}")
            ctx.log.info(f"   Players: {len(game_start.get('players', []))}")

        # Intercept turn data and try to modify gold values
        if msg_type == 'turn':
            turn_data = data.get('turn', {})
            intents = turn_data.get('intents', [])

            # Count gold-related intents
            gold_intents = [i for i in intents if isinstance(i, dict) and i.get('type') == 'donate_gold']
            if gold_intents:
                ctx.log.warn(f"   💰 Turn contains {len(gold_intents)} gold donation(s)")

    def request(self, flow: mitmproxy.http.HTTPFlow):
        """Intercept HTTP requests"""
        # Log when player connects to OpenFront
        if "openfront.io" in flow.request.pretty_host or "localhost" in flow.request.pretty_host:
            ctx.log.info(f"🌐 OpenFront request: {flow.request.path}")

            # If this is the main page, inject our hack status
            if flow.request.path == "/" or flow.request.path.startswith("/index"):
                ctx.log.warn("📍 Main page loaded - Hack is ACTIVE!")


addons = [OpenFrontGoldHack()]


# Console commands for mitmproxy
def configure(updated):
    """This runs when the script is loaded"""
    ctx.log.warn("=" * 60)
    ctx.log.warn("🎮 OpenFrontIO Gold Hack - mitmproxy Edition")
    ctx.log.warn("=" * 60)
    ctx.log.warn("💰 This script intercepts WebSocket traffic")
    ctx.log.warn("⚠️  FOR TESTING PURPOSES ONLY")
    ctx.log.warn("")
    ctx.log.warn("📝 How it works:")
    ctx.log.warn("   1. Intercepts donate_gold intents")
    ctx.log.warn("   2. Attempts negative gold exploit")
    ctx.log.warn("   3. Logs all game traffic")
    ctx.log.warn("")
    ctx.log.warn("🔧 To configure:")
    ctx.log.warn("   - Edit custom_gold variable in __init__")
    ctx.log.warn("   - Edit custom_troops variable in __init__")
    ctx.log.warn("")
    ctx.log.warn("✅ Proxy is running on: http://localhost:8080")
    ctx.log.warn("🌐 Web interface: http://localhost:8081")
    ctx.log.warn("=" * 60)
