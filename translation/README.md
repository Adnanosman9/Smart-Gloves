# Translation Firmware

Main firmware for both gloves. This is what you flash after calibration is done and the ML model is ready.

---

## Folder structure

```
translation/
├── calibration/
│   └── calibration.ino    ← run this first
├── glove_left/
│   └── glove_left.ino
└── glove_right/
    └── glove_right.ino
```

---

## Libraries

Install from Arduino Library Manager:
- `ESP32 BLE Arduino` (comes with the ESP32 board package)
- `Adafruit MPU6050`
- `Adafruit Unified Sensor`
- `ArduinoJson`

Board: **ESP32C6 Dev Module** | Upload speed: **921600**

---

## Step 1 — Calibrate

Do this before anything else, and do it per-glove — the flex values are different for each hand.

Flash `calibration/calibration.ino`, open Serial Monitor at `115200 baud`, then:

1. Hold all fingers fully open for 5 seconds
2. Bend all fingers fully closed for 5 seconds
3. Copy the `openVals` and `closedVals` arrays it prints

Paste them into both `glove_left.ino` and `glove_right.ino`:

```cpp
const int openVals[5]   = { /* your values */ };
const int closedVals[5] = { /* your values */ };
```

If the values look the same for open and closed, something's wrong with the wiring — check the voltage divider first.

---

## Step 2 — Flash

| File | Glove | BLE name |
|------|-------|----------|
| `glove_left.ino` | Left hand | `SIGNLINK-L` |
| `glove_right.ino` | Right hand | `SIGNLINK-R` |

Flash both over USB before disconnecting.

---

## Step 3 — Connect the app

Open the SIGNO app and tap Connect. It scans for `SIGNLINK-L` and `SIGNLINK-R` automatically. If it doesn't find one of them, try restarting that ESP32 — BLE advertising sometimes doesn't start cleanly on first boot.

---

## BLE packet format

Each glove sends JSON at 20Hz:

```json
{"h":"L","f":[0.85,0.90,0.05,0.02,0.01],"a":[0.01,-0.02,0.99],"g":[0.01,0.00,-0.01],"t":12345}
```

| Key | Description |
|-----|-------------|
| `h` | hand — `"L"` or `"R"` |
| `f` | 5 flex values (0.0 = open, 1.0 = closed) |
| `a` | accelerometer [x, y, z] in g |
| `g` | gyroscope [x, y, z] in rad/s |
| `t` | timestamp in ms |

---

## Pin wiring

| Signal | GPIO |
|--------|------|
| Thumb flex | GPIO 0 |
| Index flex | GPIO 1 |
| Middle flex | GPIO 2 |
| Ring flex | GPIO 3 |
| Pinky flex | GPIO 4 |
| I2C SDA (MPU6050) | GPIO 6 |
| I2C SCL (MPU6050) | GPIO 7 |

Voltage divider per finger:

```
3.3V → flex sensor → GPIO pin → 10kΩ → GND
```

GPIO 0 on ESP32-C6 is also used for boot mode — if the board is acting weird on startup, that's probably why. Swap thumb to a different pin if it becomes an issue.
