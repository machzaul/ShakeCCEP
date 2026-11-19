"""
Standalone Shake Emitter & Hardware Simulator
Simulates XIAO nRF52840 Sense physical bottle shakes by connecting directly to the
local WebSocket bridge (or hosting a standalone test stream) and sending real-time
SHAKE events: SHAKE,<eventId>,<timestamp>,<intensity>
"""

import asyncio
import random
import time
import websockets

WS_URL = "ws://127.0.0.1:8765"

async def run_simulation():
    print(f"Connecting to local WebSocket server at {WS_URL}...")
    try:
        async with websockets.connect(WS_URL) as ws:
            print("Connected! Simulating physical bottle shake events...")
            event_id = 1
            start_time = time.time()
            
            # Send 50 shakes over 10 seconds (5 shakes/sec)
            for i in range(50):
                intensity = random.randint(55, 95)
                timestamp = int((time.time() - start_time) * 1000)
                message = f"SHAKE,{event_id},{timestamp},{intensity}"
                print(f"[EMIT] {message}")
                await ws.send(message)
                event_id += 1
                await asyncio.sleep(0.18 + random.uniform(-0.04, 0.04))
                
            print("Simulation complete! 50 shakes emitted.")
    except Exception as e:
        print(f"Could not connect to WebSocket at {WS_URL}: {e}")
        print("Ensure ble_receiver.py is running.")

if __name__ == "__main__":
    asyncio.run(run_simulation())

