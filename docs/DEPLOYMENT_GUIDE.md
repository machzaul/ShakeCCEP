# Deployment & Operations Guide: Coca-Cola Shake Shake

## Target Environment
- **Platform:** Windows 10 / 11 Mini PC (e.g. Intel NUC, ASUS PN Series, Beelink, Minisforum).
- **Display Output:** 1080 × 1920 (9:16 Portrait) connected via HDMI or DisplayPort to a vertical kiosk totem, vertical TV, or portrait LED poster.
- **Audio Output:** HDMI audio or 3.5mm line out to event PA system.
- **Network Requirement:** 100% OFFLINE during gameplay.

---

## 1. Initial Setup Checklist

1. **Install Prerequisites (one-time setup):**
   - Node.js LTS (v20+ or v24+).
   - Python 3.10+ (ensure "Add Python to PATH" is checked during installation).
   - Google Chrome or Microsoft Edge.
2. **Install Dependencies:**
   Open Command Prompt inside project folder:
   ```cmd
   pnpm install
   python -m pip install bleak websockets
   ```
3. **Build Production Assets:**
   ```cmd
   pnpm build
   ```

---

## 2. One-Click Automated Startup

We provide pre-configured batch scripts in the `scripts/` directory:

### Production Kiosk Mode:
Run:
```cmd
scripts\start_kiosk.bat
```
This script automatically:
1. Spawns `python python\ble_receiver.py` in the background (BLE GATT listener + WebSocket server on port 8765).
2. Spawns `pnpm start` (Next.js local production server on port 3000).
3. Waits 4 seconds for services to initialize.
4. Opens Chrome / Edge in **fullscreen kiosk mode** (`--kiosk --incognito --disable-pinch http://localhost:3000`).

### Stopping the Activation:
Run:
```cmd
scripts\stop_kiosk.bat
```
Terminates all background node and python processes cleanly.

---

## 3. Configuring Windows Mini PC for Auto-Boot (Event Ready)

To ensure the activation automatically restarts after power loss or morning venue power-up:

1. **Enable Automatic Windows Sign-In:**
   - Press `Win + R`, type `netplwiz`, uncheck "Users must enter a user name and password to use this computer".
2. **Add Kiosk Launcher to Windows Startup:**
   - Press `Win + R`, type `shell:startup` and press Enter.
   - Right-click and create a shortcut pointing to `C:\Users\USER\CODX\COCACOLA-SHAKE\scripts\start_kiosk.bat`.
3. **Disable Screen Sleep & Windows Update Notifications:**
   - Power & Sleep settings: set "Screen" and "Sleep" to **Never**.
   - Enable Focus Assist (Alarms only) to prevent OS popups.
4. **BIOS Power Restore:**
   - In Mini PC BIOS settings, set "AC Power Recovery / Restore on AC Power Loss" to **Power On**. When venue circuit breakers are turned on in the morning, the Mini PC will boot and launch the game automatically!

---

## 4. Operator Diagnostic Screen

The game includes a hidden operator diagnostic console designed for onsite technicians:

- **Shortcut:** Press `[O]` or `[Ctrl + Shift + D]` on a keyboard connected to the Mini PC.
- **Available Diagnostics:**
  - BLE Controller status (`CONNECTED` / `DISCONNECTED`, device name, total events).
  - WebSocket port 8765 status.
  - Live FPS and state machine status.
  - SQLite database health and table record count.
  - **Manual Test Buttons:** Test Shake (Intensity 80 / 100), Mute/Unmute Audio, Restart Session.
  - **Reset Leaderboard:** Safely wipe all local score records between event days.

