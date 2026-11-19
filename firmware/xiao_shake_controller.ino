/*
  =============================================================================
  COCA-COLA SHAKE SHAKE - PHYSICAL BOTTLE CONTROLLER FIRMWARE
  =============================================================================
  Target Board: Seeed Studio XIAO nRF52840 Sense
  Onboard Sensor: LSM6DS3TR-C 6-Axis IMU (Accelerometer + Gyroscope)
  Connectivity: Bluetooth Low Energy (BLE) 5.0
  
  Libraries required in Arduino IDE / PlatformIO:
  1. ArduinoBLE (by Arduino)
  2. Seeed Arduino LSM6DS3 (by Seeed Studio)
  
  Board Selection in Arduino IDE:
  - Tools > Board > Seeed nRF52 Boards > Seeed XIAO nRF52840 Sense
  =============================================================================
*/

#include <ArduinoBLE.h>
#include <LSM6DS3.h>
#include <Wire.h>

// -----------------------------------------------------------------------------
// BLE UUID DEFINITIONS (Must match python/ble_receiver.py)
// -----------------------------------------------------------------------------
#define DEVICE_NAME         "COCA-COLA-BOTTLE"
#define SERVICE_UUID        "19b10000-e8f2-537e-4f6c-d104768a1214"
#define SHAKE_CHAR_UUID     "19b10001-e8f2-537e-4f6c-d104768a1214"

// BLE Service & Characteristic (Read + Notify, max 32 bytes ASCII string)
BLEService shakeService(SERVICE_UUID);
BLECharacteristic shakeCharacteristic(SHAKE_CHAR_UUID, BLERead | BLENotify, 32);

// -----------------------------------------------------------------------------
// IMU SENSOR INSTANCE (I2C address 0x6A on Seeed XIAO Sense)
// -----------------------------------------------------------------------------
LSM6DS3 myIMU(I2C_MODE, 0x6A);

// -----------------------------------------------------------------------------
// SHAKE DETECTION TUNING PARAMETERS
// -----------------------------------------------------------------------------
const float SHAKE_THRESHOLD_G = 1.85;   // Trigger threshold in G-force (1.0 = normal gravity)
const unsigned long DEBOUNCE_MS = 120;  // Minimum delay between consecutive shakes (prevents chatter)
const int LED_PIN = LED_BUILTIN;        // Visual feedback LED

// Runtime state
unsigned long lastShakeTime = 0;
uint32_t eventIdCounter = 1;

// -----------------------------------------------------------------------------
// BATTERY READING FUNCTION (Li-Po 3.7V / Seeed XIAO nRF52840 Sense)
// -----------------------------------------------------------------------------
int readBatteryLevel() {
#if defined(PIN_VBAT) && defined(PIN_VBAT_ENABLE)
  pinMode(PIN_VBAT_ENABLE, OUTPUT);
  digitalWrite(PIN_VBAT_ENABLE, LOW); // Enable voltage divider
  delay(1);
  int raw = analogRead(PIN_VBAT);
  digitalWrite(PIN_VBAT_ENABLE, HIGH); // Disable to save power
  // Typical Li-Po voltage: 3.4V (empty 0%) to 4.2V (full 100%)
  float vbat = (raw / 1023.0f) * 3.3f * 1.51f;
  int pct = (int)((vbat - 3.4f) / (4.2f - 3.4f) * 100.0f);
  return constrain(pct, 0, 100);
#else
  return 85; // Default fallback percentage
#endif
}

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, HIGH); // LED OFF (Active LOW on XIAO)

  // 1. Initialize IMU
  if (myIMU.begin() != 0) {
    Serial.println("[ERROR] Failed to initialize LSM6DS3 IMU!");
    // Fast blink if IMU fails
    while (1) {
      digitalWrite(LED_PIN, LOW);
      delay(100);
      digitalWrite(LED_PIN, HIGH);
      delay(100);
    }
  }
  Serial.println("[OK] LSM6DS3 IMU Initialized.");

  // 2. Initialize BLE Radio
  if (!BLE.begin()) {
    Serial.println("[ERROR] Failed to start BLE module!");
    while (1);
  }

  // Configure BLE Advertising
  BLE.setLocalName(DEVICE_NAME);
  BLE.setDeviceName(DEVICE_NAME);
  BLE.setAdvertisedService(shakeService);

  // Add characteristic to service
  shakeService.addCharacteristic(shakeCharacteristic);
  BLE.addService(shakeService);

  // Set initial characteristic value
  shakeCharacteristic.writeValue("SHAKE,0,0,0");

  // Event handlers for instant auto-recovery if out of range
  BLE.setEventHandler(BLEDisconnected, bleDisconnectHandler);

  // Start Advertising
  BLE.advertise();
  Serial.println("[OK] BLE Advertising as '" DEVICE_NAME "'...");
  Serial.println("Ready to connect to Windows Mini PC!");
}

void bleDisconnectHandler(BLEDevice central) {
  Serial.println("[BLE EVENT] Central disconnected (out of range). Re-advertising immediately...");
  digitalWrite(LED_PIN, HIGH); // Turn off LED
  BLE.advertise();             // Resume beacon so PC reconnects as soon as in range
}

void loop() {
  // Listen for BLE central connections (Python receiver on Mini PC)
  BLEDevice central = BLE.central();

  if (central) {
    Serial.print("[BLE] Connected to central: ");
    Serial.println(central.address());
    digitalWrite(LED_PIN, LOW); // Solid LED when connected

    while (central.connected()) {
      detectAndSendShake();
      delay(10); // IMU polling loop ~100 Hz
    }

    Serial.println("[BLE] Disconnected from central. Resuming advertising...");
    digitalWrite(LED_PIN, HIGH); // LED OFF
    BLE.advertise();
  } else {
    // If not connected to BLE yet, still print detected shakes to Serial for USB debugging
    detectAndSendShake();
    delay(15);
  }
}

/**
 * Reads 3-axis accelerometer, calculates dynamic G-force, and transmits BLE packet.
 */
void detectAndSendShake() {
  // Read acceleration in Gs (-4g to +4g range)
  float ax = myIMU.readFloatAccelX();
  float ay = myIMU.readFloatAccelY();
  float az = myIMU.readFloatAccelZ();

  // Vector magnitude: sqrt(ax^2 + ay^2 + az^2)
  float totalMagnitude = sqrt(ax * ax + ay * ay + az * az);

  // Check if shake exceeds threshold and debounce window has elapsed
  unsigned long now = millis();
  if (totalMagnitude > SHAKE_THRESHOLD_G && (now - lastShakeTime > DEBOUNCE_MS)) {
    lastShakeTime = now;

    // Calculate relative intensity percentage (10 to 100)
    // 1.85g -> ~20%, 4.5g+ -> 100%
    float intensityRaw = ((totalMagnitude - 1.0f) / 3.5f) * 100.0f;
    int intensity = constrain((int)intensityRaw, 15, 100);

    // Format packet: SHAKE,<eventId>,<intensity>,<battery>
    // Example: "SHAKE,1,65,47" (where 47 is battery percentage)
    int battery = readBatteryLevel();
    char packet[32];
    snprintf(packet, sizeof(packet), "SHAKE,%lu,%d,%d", eventIdCounter, intensity, battery);

    // 1. Send via BLE GATT Notification to Python receiver
    if (BLE.connected()) {
      shakeCharacteristic.writeValue(packet);
    }

    // 2. Output to USB Serial for debugging
    Serial.print("[SHAKE DETECTED] Packet: ");
    Serial.print(packet);
    Serial.print(" | Accel G: ");
    Serial.println(totalMagnitude, 2);

    // Increment event counter
    eventIdCounter++;

    // Blink LED briefly on each valid shake
    digitalWrite(LED_PIN, HIGH);
    delay(15);
    if (BLE.connected()) digitalWrite(LED_PIN, LOW);
  }
}

