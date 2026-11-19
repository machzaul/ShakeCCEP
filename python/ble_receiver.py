"""
Coca-Cola Shake Shake - Local BLE Receiver & WebSocket Bridge
Connects to XIAO nRF52840 Sense Plus via Bluetooth Low Energy (BLE)
and broadcasts real-time shake notifications to the Next.js browser app via WebSocket.

Dependencies:
    pip install bleak websockets
"""

import asyncio
import json
import logging
import sys
from typing import Set
import websockets
from bleak import BleakClient, BleakScanner
from bleak.backends.characteristic import BleakGATTCharacteristic

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger("BLE_RECEIVER")

# Configuration
WS_HOST = "127.0.0.1"
WS_PORT = 8765
TARGET_DEVICE_NAME = "COCA-COLA-BOTTLE"  # Base name (matches COCA-COLA-BOTTLE, COCA-COLA-BOTTLE-1, COCA-COLA-BOTTLE-2, etc.)

# Supported Characteristic UUIDs (Botol Utama & Botol Cadangan)
SUPPORTED_SHAKE_UUIDS = [
    "19b10001-e8f2-537e-4f6c-d104768a1214",  # Botol 1 (Utama)
    "19b10001-e8f2-537e-4f6c-d104768a1215",  # Botol 2 (Cadangan)
]

# Active WebSocket clients
connected_clients: Set[websockets.WebSocketServerProtocol] = set()
event_counter = 0

async def broadcast_message(message: str):
    """Broadcast text message to all connected local WebSocket clients."""
    if not connected_clients:
        return
    dead_clients = set()
    for ws in connected_clients:
        try:
            await ws.send(message)
        except Exception:
            dead_clients.add(ws)
    connected_clients.difference_update(dead_clients)

async def ws_handler(websocket, path):
    """Handle new browser WebSocket connections."""
    connected_clients.add(websocket)
    logger.info(f"Browser client connected: {websocket.remote_address}")
    
    # Send initial status
    status_msg = json.dumps({
        "type": "STATUS",
        "connected": True,
        "name": TARGET_DEVICE_NAME,
        "totalEvents": event_counter
    })
    try:
        await websocket.send(status_msg)
        async for msg in websocket:
            # Handle incoming ping/test requests if any
            pass
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        connected_clients.remove(websocket)
        logger.info("Browser client disconnected")

def notification_callback(characteristic: BleakGATTCharacteristic, data: bytearray):
    """GATT notification callback fired when physical bottle shakes."""
    global event_counter
    try:
        raw_text = data.decode("utf-8").strip()
        event_counter += 1
        logger.info(f"[BLE NOTIFY] {raw_text}")
        
        # Schedule broadcast on running asyncio event loop
        loop = asyncio.get_event_loop()
        loop.create_task(broadcast_message(raw_text))
    except Exception as e:
        logger.error(f"Error handling notification: {e}")

async def ble_worker():
    """Continuously scan and maintain BLE connection with the bottle controller."""
    while True:
        logger.info(f"Scanning for BLE device '{TARGET_DEVICE_NAME}'...")
        try:
            device = await BleakScanner.find_device_by_filter(
                lambda d, ad: (d.name and TARGET_DEVICE_NAME.lower() in d.name.lower()) or False,
                timeout=5.0
            )

            if not device:
                logger.info(f"Device '{TARGET_DEVICE_NAME}' not found. Retrying in 3s...")
                await asyncio.sleep(3.0)
                continue

            logger.info(f"Connecting to {device.name} ({device.address})...")
            async with BleakClient(device.address) as client:
                logger.info(f"Connected to BLE controller: {device.name}")
                
                # Find and subscribe to matching shake characteristic
                subscribed_uuid = None
                for char_uuid in SUPPORTED_SHAKE_UUIDS:
                    try:
                        await client.start_notify(char_uuid, notification_callback)
                        subscribed_uuid = char_uuid
                        logger.info(f"Subscribed to shake notifications on: {char_uuid}")
                        break
                    except Exception:
                        continue

                if not subscribed_uuid:
                    logger.error("Could not find any matching shake characteristic on device!")
                    continue

                # Keep connected until disconnect
                while client.is_connected:
                    await asyncio.sleep(1.0)

                logger.warning("BLE controller disconnected.")

        except Exception as e:
            logger.error(f"BLE error: {e}. Reconnecting in 3s...")
            await asyncio.sleep(3.0)

async def main():
    logger.info("Starting Coca-Cola Shake Shake Hardware Bridge...")
    logger.info(f"Starting WebSocket server on ws://{WS_HOST}:{WS_PORT}")
    
    # Start WebSocket server
    ws_server = await websockets.serve(ws_handler, WS_HOST, WS_PORT)
    
    # Start BLE worker loop in parallel
    ble_task = asyncio.create_task(ble_worker())
    
    try:
        await asyncio.gather(ws_server.wait_closed(), ble_task)
    except asyncio.CancelledError:
        pass

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Exiting BLE receiver...")

