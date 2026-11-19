# QA Test Plan & Verification Matrix: Coca-Cola Shake Shake

## Test Execution Matrix

| Test ID | Test Category | Description | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | UI / Flow | Screen 01 Attract display | 16:9 Landscape, dark background, glowing moon, "COKE IT UP!", red PLAY GAME button | **PASS** |
| **TC-02** | Flow | Transition Attract → Countdown | Clicking "PLAY GAME" switches cleanly to Screen 02 Countdown | **PASS** |
| **TC-03** | Gameplay | Countdown 3 → 2 → 1 → GO! | Numbers pop with scale animation; audio beeps play; "READY" appears on 2; "SET" appears on 1; "GO!" punches | **PASS** |
| **TC-04** | Input Protection | Shake during countdown | Any shake events sent during Countdown (3, 2, 1) are strictly ignored and do not increase score | **PASS** |
| **TC-05** | Gameplay | Shake gameplay Screen 06-09 | Bottle wobbles dynamically on valid shake; liquid fills proportionally; foam bubbles explode at liquid meniscus | **PASS** |
| **TC-06** | Hardware Bridge | Duplicate Event Rejection | Repeated event IDs (`SHAKE,1,...`) are rejected by hardware filter; counted exactly once | **PASS** |
| **TC-07** | Gameplay | High Charge / Final Shake | High energy displays glowing red aura; higher pitch audio feedback; finishes on timer end (10s) | **PASS** |
| **TC-08** | Flight | Hero Jetpack Launch Screen 10 | Transition to full-screen flight; superhero ignites Coca-Cola twin jetpack; character DOES NOT run | **PASS** |
| **TC-09** | Flight | Score-driven distance Screen 11 | Higher score produces greater flight altitude (500m to 8500m); city skyline and clouds scroll downward | **PASS** |
| **TC-10** | Result | Screen 12 Result Display | Dark background, moon visual, "TAKE IT UP!", ranking (e.g. "RANKING 20/52"), total score, max altitude | **PASS** |
| **TC-11** | Local Storage | SQLite persistence | Result record written to `data/coke_shake.db`; local ranking calculated; leaderboard shows top scores | **PASS** |
| **TC-12** | Memory / Reset | Play Again clean reset | "PLAY AGAIN" wipes score, shakes, energy; returns to Attract screen with zero data leakage | **PASS** |
| **TC-13** | Offline | 100% Offline Integrity | Disconnecting internet has 0 impact; all vector graphics, audio, fonts, and database function locally | **PASS** |
| **TC-14** | Operator | Diagnostic Console | Pressing `[O]` opens hidden operator overlay; shows BLE, WebSocket, FPS; allows testing and DB reset | **PASS** |
| **TC-15** | Hardware | BLE Disconnection & Recovery | If controller turns off, Python BLE receiver auto-retries every 3s and re-establishes without crash | **PASS** |

