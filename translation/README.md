# Translation Firmware

This folder contains the **main glove firmware** for real-time BdSL gesture translation. Flash these to the gloves after completing calibration and ML model training.

---

## Folder Structure

```
translation/
├── calibration/
│   └── calibration.ino    ← Run this FIRST to get your sensor values
├── glove_left/
│   └── glove_left.ino     ← Flash to LEFT hand ESP32
└── glove_right/
    └── glove_right.ino    ← Flash to RIGHT hand ESP32
```

---

## Libraries Required

Install via Arduino Library Manager:
- `ESP32 BLE Arduino` (built-in with ESP32 board package)
- `Adafruit MPU6050`
- `Adafruit Unified Sensor`
- `ArduinoJson`

**Board:** ESP32C6 Dev Module | **Upload speed:** 921600

---

## Step 1 — Calibrate First

Flash `calibration/calibration.ino` to each ESP32 separately:

1. Open Serial Monitor at `115200 baud`
2. Hold all fingers **fully open** for 5 seconds
3. Bend all fingers **fully closed** for 5 seconds
4. Copy the printed `openVals` and `closedVals` arrays

Paste the values into both `glove_left.ino` and `glove_right.ino`:
```cpp
const int openVals[5]   = { /* your values */ };
const int closedVals[5] = { /* your values */ };
```

---

## Step 2 — Flash the Main Firmware

| File | Target ESP32 | BLE Name |
|------|-------------|----------|
| `glove_left.ino` | Left hand | `SIGNLINK-L` |
| `glove_right.ino` | Right hand | `SIGNLINK-R` |

---

## Step 3 — Open the Mobile App

Open the **SIGNLINK** React Native app on your phone. Tap **CONNECT** — the app will scan for and connect to both `SIGNLINK-L` and `SIGNLINK-R` automatically.

---

## BLE Packet Format

Each glove sends a JSON packet at **20Hz** over Bluetooth:

```json
{"h":"L","f":[0.85,0.90,0.05,0.02,0.01],"a":[0.01,-0.02,0.99],"g":[0.01,0.00,-0.01],"t":12345}
```

| Key | Description |
|-----|-------------|
| `h` | Hand — `"L"` for left, `"R"` for right |
| `f` | 5 flex sensor values (0.0 = open, 1.0 = closed) |
| `a` | Accelerometer [x, y, z] in g |
| `g` | Gyroscope [x, y, z] in rad/s |
| `t` | Timestamp in milliseconds |

---

## Pin Wiring

| Signal | GPIO |
|--------|------|
| Thumb flex | GPIO 0 |
| Index flex | GPIO 1 |
| Middle flex | GPIO 2 |
| Ring flex | GPIO 3 |
| Pinky flex | GPIO 4 |
| I2C SDA (MPU6050) | GPIO 6 |
| I2C SCL (MPU6050) | GPIO 7 |

**Flex sensor wiring per finger:**
```
3.3V → Flex sensor → GPIO pin → 10kΩ → GND
```
