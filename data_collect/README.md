# Dataset Collection Firmware

Firmware for recording labeled gesture data from both gloves over USB Serial. Output is two CSV files that get merged and used to train the gesture classifier.

---

## Folder structure

```
data_collect/
├── data_collect_left/
│   └── data_collect_left.ino   ← flash to LEFT hand ESP32
└── data_collect_right/
    └── data_collect_right.ino  ← flash to RIGHT hand ESP32
```

---

## What you need

- 2x ESP32-C6 with gloves assembled
- 2x USB cables
- Arduino IDE or PlatformIO

Libraries (install from Arduino Library Manager):
- `Adafruit MPU6050`
- `Adafruit Unified Sensor`

---

## Before you start — calibration

Open both `.ino` files and paste in your calibration values from `translation/calibration/`:

```cpp
const int openVals[5]   = {your open values here};
const int closedVals[5] = {your closed values here};
```

Don't skip this — the flex readings will be garbage without it.

---

## Recording gestures

### 1. Flash the firmware

Flash `data_collect_left.ino` to the left glove and `data_collect_right.ino` to the right. Both over USB.

### 2. Open two Serial Monitors

Two separate Arduino IDE windows, one per ESP32, both at `115200 baud`. Each one will print the CSV header on startup:

```
label,thumb,index,middle,ring,pinky,ax,ay,az,gx,gy,gz,timestamp
```

### 3. Record

For each gesture:

1. Form the gesture and hold it
2. Type the label (e.g. `HELLO`) in **both** Serial Monitor windows and hit Enter
3. Hold still for 1.5 seconds — each ESP records 30 samples then stops
4. Move on to the next one

Some gestures to start with:
`HELLO`, `YES`, `NO`, `PLEASE`, `THANKS`, `HELP`, `WATER`, `FOOD`, `GOOD`, `BAD`, `MORE`, `STOP`, `SORRY`, `LOVE`, `NAME`

50+ samples per gesture is enough to get decent accuracy. 100 is better.

### 4. Save the output

Copy the Serial Monitor output from each window and save as:
- `left_hand.csv`
- `right_hand.csv`

---

## After recording

Go to the `ml/` folder. The training script will:
1. Merge both CSVs by timestamp
2. Train the Random Forest
3. Export `modelWeights.js` for the app

---

## CSV format

| Column | Description |
|--------|-------------|
| `label` | gesture name you typed |
| `thumb` | flex value (0.0 = open, 1.0 = fully bent) |
| `index` | index finger flex |
| `middle` | middle finger flex |
| `ring` | ring finger flex |
| `pinky` | pinky flex |
| `ax` | accelerometer X (g) |
| `ay` | accelerometer Y |
| `az` | accelerometer Z |
| `gx` | gyroscope X (rad/s) |
| `gy` | gyroscope Y |
| `gz` | gyroscope Z |
| `timestamp` | ESP32 uptime in ms |

---

## Notes

- Make sure both ESPs are recording at the same time — mismatched timestamps will cause issues during the merge step
- On Windows, check Device Manager for the right COM port if the Serial Monitor isn't connecting
- If flex readings look off, redo calibration before collecting data
