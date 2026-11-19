# ShakeCCEP
# Coca-Cola Shake Shake
### Offline 2D Interactive Arcade Brand Activation

A high-performance, offline 2D interactive arcade activation built for Windows Mini PC vertical kiosks and portrait LED displays (1080×1920 9:16 Portrait). Players shake a custom Coca-Cola bottle equipped with a Bluetooth Low Energy (BLE) IMU accelerometer to charge the bottle with carbonated energy, launching a 2D superhero character into the stratosphere with a Coca-Cola jetpack!

---

## 1. System Architecture

```
[Physical Bottle Controller]
XIAO nRF52840 Sense + IMU
        │ (BLE GATT Notifications)
        ▼
[Python BLE Receiver Bridge] (python/ble_receiver.py)
Bleak Client + WebSocket Server (ws://127.0.0.1:8765)
        │ (Local WebSocket JSON / CSV)
        ▼
[Next.js + Phaser 3 Web Engine] (localhost:3000)
HardwareBridge ──► Game State Manager ──► Phaser 3 Scenes (Boot, Countdown, Shake, Flight)
        │                                  │
        ▼                                  ▼
[SQLite Local Database]               [Web Audio Synthesizer]
data/coke_shake.db                     100% Offline Procedural Sound
```

---

## 2. Wireframe Flow Implementation Mapping

The game strictly implements all 12 wireframe reference screens:

- **Screen 01 — Landing Page (Attract):** Dark 16:9 background, glowing celestial moon element, bold "COKE IT UP!" title, supporting tagline, and prominent red "PLAY GAME" button.
- **Screen 02 — Countdown: 3:** Pale blue-grey background (`#EAF0F4`), Coca-Cola branding header, centered bottle silhouette, and scale-pop number "3".
- **Screen 03 — Countdown: 2:** Same composition, number "2", and "READY" badge in the bottom-right.
- **Screen 04 — Countdown: 1:** Same composition, number "1", and "SET" badge in the bottom-right.
- **Screen 05 — Countdown: GO!:** Energetic punch animation with large "GO!" text, immediately initiating gameplay.
- **Screen 06 — Gameplay: Shake:** Centered bottle with dynamic liquid filling, "SHAKE!" badge with pulsing motion ripples, real-time score, timer, and energy HUD.
- **Screen 07 & 08 — Bottle Charging:** Liquid fill rises with smooth lerp interpolation; carbonation bubbles burst at the meniscus; glowing red aura intensifies with energy.
- **Screen 09 — Final Shake / Max Charge:** Bottle reaches full charge; gameplay timer ends; scores are locked; transition to launch.
- **Screen 10 — Hero Jetpack Launch:** Full-screen 2D flight environment; 2D superhero with Coca-Cola dual jetpack thrusters; particle exhaust plumes; upward acceleration. *(Hero DOES NOT run; no lanes).*
- **Screen 11 — Hero Flight:** Parallax downward scrolling (city skyline → clouds → starry stratosphere and moon); upward altitude meter driven directly by shake score:
  $$\text{flightDistance} = \text{lerp}(500\text{m}, 8500\text{m}, \text{score} / \text{maxScore})$$
- **Screen 12 — Result / Leaderboard:** Dark background, celestial moon, "TAKE IT UP!", achieved ranking (e.g. `RANKING 20/52`), total score, max altitude, local SQLite Hall of Fame, and red "PLAY AGAIN" button.

---

## 3. Technology Stack

- **Game Engine:** Phaser 3.90 (Scene Manager, Tween System, Particle Emitters, WebGL Renderer).
- **Web App:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS.
- **Local Storage:** SQLite (`@libsql/client` at `data/coke_shake.db`).
- **Hardware Integration:** Python 3.10 + Bleak (BLE GATT listener) + WebSockets.
- **Audio Engine:** Web Audio API procedural synthesizer (100% offline, zero network assets).
- **Deployment:** Windows Mini PC, Google Chrome / Edge fullscreen kiosk mode.

---

## 4. Quick Start & Development

### 1. Prerequisites
- Node.js LTS (v20+ or v24+)
- Python 3.10+

### 2. Install Dependencies
```bash
pnpm install
python -m pip install bleak websockets
```

### 3. Run Development Mode
Start the local Python BLE WebSocket server:
```bash
python python/ble_receiver.py
```
In a second terminal, start the Next.js development server:
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Uji Coba Tanpa Botol Fisik (Button A):**  
> Saat masuk ke fase gameplay shake (layar 06–09), Anda dapat langsung mengocok botol secara virtual dengan:
> 1. Menekan tombol **`A`** pada keyboard.
> 2. Mengklik tombol merah **`[A] SHAKE BOTOL (TEKAN TOMBOL A)`** yang tampil di layar.
> 3. Setiap penekanan tombol akan memicu penambahan poin acak realistis (+180–+245 pts), memunculkan efek animasi teks pop-up nilai poin, menggoyangkan botol secara dinamis, dan menaikkan cairan energi.

---

## 5. Production Windows Kiosk Deployment

### One-Click Launch:
Double click or run:
```cmd
scripts\start_kiosk.bat
```
This automatically starts the Python BLE receiver, Next.js production server, and launches Chrome in fullscreen kiosk mode.

### Stop All Services:
```cmd
scripts\stop_kiosk.bat
```

---

## 6. Operator Diagnostic Console

Press **`[O]`** or **`[Ctrl + Shift + D]`** on a connected keyboard to toggle the hidden operator console:
- Live BLE connection status & device name.
- WebSocket port 8765 bridge status & packet counter.
- Live FPS and state machine tracking.
- Test shake trigger buttons (Intensity 80 / 100).
- Global audio mute toggle.
- Safe local leaderboard reset button.

---

## 7. Project Structure

```text
├── data/                    # Local SQLite database (coke_shake.db)
├── docs/                    # Technical documentation
│   ├── DEPLOYMENT_GUIDE.md  # Step-by-step Windows Mini PC setup
│   ├── HARDWARE_SPEC.md     # BLE protocol and packet structure
│   └── QA_TEST_PLAN.md      # Complete test verification matrix
├── python/                  # Python BLE hardware integration
│   ├── ble_receiver.py      # Bleak BLE GATT client + WebSocket server
│   └── test_shake_emitter.py# Standalone shake event CLI simulator
├── scripts/                 # Windows automation scripts
│   ├── start_kiosk.bat      # 1-click kiosk launcher
│   ├── stop_kiosk.bat       # Clean process terminator
│   └── test_database.js     # SQLite validation script
├── src/
│   ├── app/                 # Next.js App Router (page, layout, API routes)
│   ├── components/          # Wireframe React UI components
│   │   ├── AttractScreen.tsx# Screen 01: Landing Page
│   │   ├── GameplayHUD.tsx  # In-game real-time HUD
│   │   ├── ResultScreen.tsx # Screen 12: Result & Local Leaderboard
│   │   └── OperatorOverlay.tsx # Hidden Diagnostic Console
│   ├── config/              # Centralized game configuration
│   ├── game/                # Phaser 3 2D Game Engine
│   │   ├── EventBus.ts      # Bidirectional React-Phaser event bridge
│   │   ├── PhaserGame.tsx   # React Phaser wrapper component
│   │   └── scenes/          # BootScene, CountdownScene, ShakeScene, FlightScene
│   ├── lib/                 # Core utilities
│   │   ├── audioManager.ts  # Web Audio API procedural sound engine
│   │   ├── db.ts            # SQLite client & ranking calculations
│   │   └── hardwareBridge.ts# WebSocket client & shake deduplication
│   └── types/               # TypeScript interfaces & types
└── package.json
```

---

## Update Terbaru
- **Protokol 4-Kolom dengan Baterai:** `SHAKE,<id>,<intensity>,<battery>` untuk monitoring baterai botol di layar operator.
- **Dukungan 2 Botol (Utama & Cadangan):** Multi-UUID auto-detect (`...1214` dan `...1215`) dengan auto-reconnect saat out-of-range.
- **UI Result Screen:** QR Code claim points SVG, animated countdown bar 60s, dan typography persis Totem Arcade.
- **Pembersihan Tampilan:** Menghilangkan efek zoom mendadak saat waktu habis, teks demo instruksi di layar idle, dan banner bawah.


