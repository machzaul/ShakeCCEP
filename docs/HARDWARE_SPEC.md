# Hardware Communication Specification: Coca-Cola Shake Shake

## 1. Overview
The **Coca-Cola Shake Shake** interactive installation uses a custom physical bottle controller powered by a **Seeed Studio XIAO nRF52840 Sense** microcontroller equipped with an onboard 6-axis IMU (LSM6DS3TR-C accelerometer + gyroscope).

Communication flow:
```
[Physical Bottle Controller]
XIAO nRF52840 Sense + IMU
        │ (BLE GATT Notifications)
        ▼
[Windows Mini PC Local Bridge]
Python Bleak BLE Receiver
        │ (Local WebSocket ws://127.0.0.1:8765)
        ▼
[Browser Frontend Engine]
Next.js + Phaser 3 Game State Engine
```

---

## 2. Bluetooth Low Energy (BLE) Profile

- **Device Advertised Name:** `COCA-COLA-BOTTLE`
- **Service UUID:** `19b10000-e8f2-537e-4f6c-d104768a1214`
- **Shake Characteristic UUID:** `19b10001-e8f2-537e-4f6c-d104768a1214`
- **Properties:** `NOTIFY`, `READ`
- **Payload Format:** ASCII CSV String

---

## 3. Packet Protocol

Each valid shake threshold trigger emits a single notification packet in the following format:
```text
SHAKE,<event_id>,<intensity>,<battery>
```

### Field Definitions:
1. `event_type` (`string`): Always `SHAKE`.
2. `event_id` (`integer`): Monotonically increasing counter (e.g. `1, 2, 3...`) used by the browser engine for duplicate rejection.
3. `intensity` (`integer`): Relative shake magnitude clamped between `10` and `100`.
4. `battery` (`integer`): Current battery percentage clamped between `0` and `100` (e.g. `47` = 47%).

### Example Packet:
```text
SHAKE,1,65,47
SHAKE,2,82,47
SHAKE,3,95,46
```

*(Note: The game engine also supports backward compatibility with 3-part `SHAKE,<id>,<intensity>` or 5-part formats).*

---

## 4. Accelerometer IMU Calibration on Microcontroller

- **Sampling Rate:** 104 Hz (ODR)
- **Full Scale:** ±4g or ±8g
- **Shake Detection Algorithm:**
  - High-pass filtered vector magnitude:
    $$A_{mag} = \sqrt{a_x^2 + a_y^2 + a_z^2}$$
  - A valid shake event is triggered when $\Delta A_{mag} > \text{threshold}$ (typically $> 1.8g$) followed by zero-crossing within 120ms.
  - Refractory debounce window: 100ms minimum between consecutive shake triggers to prevent micro-vibration chatter.

---

## 5. Fault Tolerance & Reconnection

- **Auto-Scan & Reconnect:** The Python BLE receiver script continuously scans for `COCA-COLA-BOTTLE`. If the controller is powered off or battery is replaced, the script automatically re-establishes the connection within 3 seconds without restarting the browser or losing game state.
- **Duplicate Prevention:** Incoming packets with identical `event_id` are discarded.
- **State Filtering:** Shake events received outside the active `PLAYING` state (e.g., during countdown or on attract screen) are dropped.
- **Simulator Mode:** If the physical controller is unavailable during rehearsal, pressing `[Space]` or clicking **TEST SHAKE** in the Operator Console (`[O]`) emits synthetic events.

