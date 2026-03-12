# Dataset Collection Firmware

This folder contains the firmware used to **record a labeled gesture dataset** from both gloves over USB Serial.

The output is a CSV file used to train the BdSL gesture recognition ML model.

---

## Folder Structure

```
data_collect/
├── data_collect_left/
│   └── data_collect_left.ino   ← Flash to LEFT hand ESP32
└── data_collect_right/
    └── data_collect_right.ino  ← Flash to RIGHT hand ESP32
```

---

## Hardware Required

- 2x ESP32-C6 with gloves assembled
- 2x USB cables connected to your laptop
- Arduino IDE (or PlatformIO)

## Libraries Required

Install via Arduino Library Manager:
- `Adafruit MPU6050`
- `Adafruit Unified Sensor`

---

## Step 1 — Update Calibration Values

Before recording, paste your personal calibration values (from `translation/calibration/`) into both `.ino` files:

```cpp
const int openVals[5]   = {your open values here};
const int closedVals[5] = {your closed values here};
```

---

## Step 2 — Flash the Firmware

Flash `data_collect_left.ino` to your **left hand** ESP32 and `data_collect_right.ino` to your **right hand** ESP32 via USB.

---

## Step 3 — Open Serial Monitors

Open **two separate Arduino IDE windows** (one per ESP32), each with the Serial Monitor set to `115200 baud`.

You will see the CSV header printed automatically:
```
label,thumb,index,middle,ring,pinky,ax,ay,az,gx,gy,gz,timestamp
```

---

## Step 4 — Record Gestures

For each gesture you want to record:

1. Form your hands into the gesture and hold still
2. Type the **gesture label** (e.g. `HELLO`) in **both** Serial Monitor windows and press Enter
3. Hold the gesture for **1.5 seconds** — each ESP records 30 samples automatically
4. Repeat for the next gesture

**Recommended gestures to start with:**
`HELLO`, `YES`, `NO`, `PLEASE`, `THANKS`, `HELP`, `WATER`, `FOOD`, `GOOD`, `BAD`, `MORE`, `STOP`, `SORRY`, `LOVE`, `NAME`

> Aim for **at least 50–100 samples per gesture** for good ML accuracy.

---

## Step 5 — Save the Output

Copy the Serial Monitor output from each window and save as:
- `left_hand.csv`
- `right_hand.csv`

---

## Step 6 — Merge and Train

Use the Python training script (in the `ml/` folder) to:
1. Merge `left_hand.csv` and `right_hand.csv` by timestamp
2. Train a Random Forest classifier
3. Export `modelWeights.js` for the mobile app

---

## CSV Format

Each row represents one sensor reading for a labeled gesture:

| Column | Description |
|--------|-------------|
| `label` | The gesture name you typed |
| `thumb` | Thumb flex value (0.0 = open, 1.0 = fully bent) |
| `index` | Index finger flex |
| `middle` | Middle finger flex |
| `ring` | Ring finger flex |
| `pinky` | Pinky flex |
| `ax` | Accelerometer X (in g) |
| `ay` | Accelerometer Y |
| `az` | Accelerometer Z |
| `gx` | Gyroscope X (rad/s) |
| `gy` | Gyroscope Y |
| `gz` | Gyroscope Z |
| `timestamp` | ESP32 uptime in milliseconds |
