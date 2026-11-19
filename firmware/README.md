# Panduan Pembuatan Alat & Flashing Firmware: Coca-Cola Shake Shake

Dokumen ini ditujukan untuk **Hardware Engineer / Developer Alat** agar memahami cara kerja pengiriman data dan cara mem-flash microcontroller ke botol fisik.

---

## 1. Spesifikasi Hardware

| Komponen | Spesifikasi / Tipe |
| :--- | :--- |
| **Microcontroller** | **Seeed Studio XIAO nRF52840 Sense** (Wajib varian **Sense** karena ada sensor IMU bawaan). |
| **Sensor IMU** | Onboard **LSM6DS3TR-C** (Akselerometer 3-Axis + Gyroskop). |
| **Konektivitas** | Bluetooth Low Energy (BLE) 5.0 bawaan chip nRF52840. |
| **Baterai** | Baterai LiPo 3.7V (300mAh – 500mAh) disolder ke pad baterai di bagian bawah board XIAO. |
| **Casing / Mounting** | Dimasukkan ke dalam dummy botol Coca-Cola (3D printed base atau rongga bawah botol). |

---

## 2. Diagram Alur Pengiriman & Penerimaan Data

```
┌─────────────────────────────────┐
│     BOTOL FISIK COCA-COLA       │
│  XIAO nRF52840 Sense + Baterai  │
│  Mendeteksi kocokan (G-Force)   │
└────────────────┬────────────────┘
                 │
                 │ 1. BLE GATT Notification (Wireless)
                 │    Payload: "SHAKE,<id>,<timestamp>,<intensity>"
                 ▼
┌─────────────────────────────────┐
│     WINDOWS MINI PC (RECEIVER)  │
│    python/ble_receiver.py       │
│   (Bleak Client di port USB/BT) │
└────────────────┬────────────────┘
                 │
                 │ 2. Local WebSocket (ws://127.0.0.1:8765)
                 │
                 ▼
┌─────────────────────────────────┐
│    BROWSER / GAME NEXT.JS       │
│      src/lib/hardwareBridge.ts  │
│      Mengupdate skor & botol    │
└─────────────────────────────────┘
```

---

## 3. Parameter BLE & Format Data

### Parameter Koneksi BLE:
- **Device Advertised Name:** `COCA-COLA-BOTTLE`
- **Service UUID:** `19b10000-e8f2-537e-4f6c-d104768a1214`
- **Characteristic UUID:** `19b10001-e8f2-537e-4f6c-d104768a1214`
- **Properties:** `BLERead | BLENotify`

### Format String Packet yang Dikirim Botol:
Setiap kali botol dikocok melampaui batas ambang ($>1.85\text{g}$), botol mengirimkan 1 string CSV:
```text
SHAKE,<event_id>,<timestamp_ms>,<intensity>
```

**Penjelasan field:**
1. `SHAKE` : Tipe event (tetap string `"SHAKE"`).
2. `event_id` : Angka urut naik (`1, 2, 3, 4, ...`) untuk mencegah double-count / data duplikat.
3. `timestamp_ms` : Nilai `millis()` mikroprosesor saat kocokan terjadi.
4. `intensity` : Intensitas kekuatan kocokan bernilai antara `15` sampai `100`.

**Contoh data mentah yang dikirim via BLE:**
```text
SHAKE,1,1420,55
SHAKE,2,1580,72
SHAKE,3,1720,95
```

---

## 4. Cara Flashing Firmware Menggunakan Arduino IDE

1. **Install Arduino IDE:** Unduh versi terbaru dari [arduino.cc](https://www.arduino.cc/).
2. **Tambah Board Seeed nRF52 ke Arduino IDE:**
   - Masuk ke menu **File > Preferences**.
   - Pada kolom *Additional Boards Manager URLs*, tambahkan URL:
     ```
     https://files.seeedstudio.com/arduino/package_seeeduino_boards_index.json
     ```
   - Masuk ke **Tools > Board > Boards Manager...**, cari `Seeed nRF52` dan klik **Install**.
3. **Install Library yang Dibutuhkan:**
   Masuk ke **Tools > Manage Libraries...**, cari dan install 2 library ini:
   - **`ArduinoBLE`** (resmi by Arduino)
   - **`Seeed Arduino LSM6DS3`** (by Seeed Studio)
4. **Buka File Firmware:**
   - Buka file: `firmware/xiao_shake_controller.ino`.
5. **Pilih Board & Port:**
   - **Tools > Board > Seeed nRF52 Boards > Seeed XIAO nRF52840 Sense**.
   - Colokkan XIAO menggunakan kabel USB-C ke laptop.
   - Pilih Port COM yang sesuai di **Tools > Port**.
6. **Upload / Flash:**
   - Klik tombol **Upload** (panah kanan).
7. **Pengujian Lewat Serial Monitor:**
   - Buka **Serial Monitor** di baudrate **`115200`**.
   - Goyangkan/kocok board XIAO, di layar Serial Monitor akan keluar:
     ```text
     [SHAKE DETECTED] Packet: SHAKE,1,1840,65 | Accel G: 2.45
     ```
   - Jika sudah keluar log tersebut, alat sudah 100% siap digunakan dan akan langsung terhubung secara otomatis ke game!

