# Dataset Collection Firmware

Firmware for recording labeled gesture data from both gloves over USB serial. Each glove outputs its own CSV — you merge them later and use the combined file to train the classifier.

---

## Folder Structure

```
data_collect/
├── data_collect_left/
│   └── data_collect_left.ino   ← flash to LEFT glove
└── data_collect_right/
    └── data_collect_right.ino  ← flash to RIGHT glove
```

---

## What You Need

- Both gloves assembled with ESP32-C6
- 2x USB cables
- Arduino IDE or PlatformIO
- Libraries: `Adafruit MPU6050`, `Adafruit Unified Sensor`

---

## Before You Start

Open both `.ino` files and paste in your calibration values from `translation/calibration/`:

```cpp
const int openVals[5]   = {your open values here};
const int closedVals[5] = {your closed values here};
```

Don't skip this — bad calibration = bad data = bad model.

---

## Recording Gestures

### 1. Flash both gloves

Flash `data_collect_left.ino` to the left and `data_collect_right.ino` to the right, both over USB.

### 2. Open two Serial Monitors

Two separate Arduino IDE windows, one per glove, both at `115200 baud`. You'll see the CSV header print on startup:

```
label,thumb,index,middle,ring,pinky,ax,ay,az,gx,gy,gz,timestamp
```

### 3. Record

For each gesture:

1. Form the gesture and hold it still
2. Type the label (e.g. `HELLO`) into **both** Serial Monitor windows and hit Enter
3. Hold for ~1.5 seconds — each glove records 30 samples then stops automatically
4. Repeat for the next gesture

Aim for 50+ samples per gesture minimum. 100 is better.

### 4. Save the output

Copy the Serial Monitor output from each window and save as:
- `left_hand.csv`
- `right_hand.csv`

---

## After Recording

Head to the `ml/` folder and run the training script. It will:

1. Merge both CSVs by timestamp
2. Train the Random Forest classifier
3. Export `modelWeights.js` ready to drop into the app

---

## CSV Format

| Column | Description |
|---|---|
| `label` | gesture name you typed |
| `thumb` | flex value (0.0 = open, 1.0 = fully bent) |
| `index` | index finger |
| `middle` | middle finger |
| `ring` | ring finger |
| `pinky` | pinky finger |
| `ax` `ay` `az` | accelerometer (g) |
| `gx` `gy` `gz` | gyroscope (rad/s) |
| `timestamp` | ESP32 uptime in ms |

---

## Notes

- Both gloves need to be recording at the same time — mismatched timestamps will break the merge step
- On Windows, check Device Manager for the correct COM port if Serial Monitor won't connect
- If flex readings look wrong, redo calibration before collecting any data
