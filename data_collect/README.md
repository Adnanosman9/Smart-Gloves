# Dataset Collection Firmware

This firmware is used to record gesture data from both gloves over USB serial.  
Each glove saves its own CSV file. Later, both files are merged and used to train the model.

---

## Requirements

- 2 gloves with ESP32-C6  
- 2 USB cables (one for each glove)  
- Arduino IDE or PlatformIO  
- Libraries:
  - Adafruit MPU6050  
  - Adafruit Unified Sensor  

---

## Before You Start (Don’t Skip This)

Open both `.ino` files and update the calibration values:

```cpp
const int openVals[5]   = {...};
const int closedVals[5] = {...};
```
Use the values from your calibration step.

If these are wrong, your flex readings will be inaccurate and you’ll likely have to redo your dataset. It’s worth checking twice here.

Recording Process
## 1. Flash both gloves

Upload:

```data_collect_left.ino``` → left glove

```data_collect_right.ino``` → right glove


## 2. Open Serial Monitors

Open two Serial Monitor windows (one for each glove)

On startup, you should see:

```label,thumb,index,middle,ring,pinky,ax,ay,az,gx,gy,gz,timestamp```

If you don’t see this, check:
- Correct COM port
- Baud rate
- Cable connection


## 3. Recording Gestures

For each gesture:
- Form the gesture and hold it steady
- Type the label (e.g. HELLO) into both Serial Monitors and press Enter
- Keep holding the gesture while it records
- Each glove records ~30 samples, then stops automatically

Repeat for all gestures.

> Try to stay still while recording — even small movements can add noise.


## 4. How Much Data?

- Minimum: ~50 samples per gesture
- Recommended: 80–100 samples

> More variation usually helps the model perform better.

## 5. Save the Data

Copy the Serial Monitor output from each window and save as:
- left_hand.csv
- right_hand.csv

## After Recording

Go to the ml/ folder and run the training script.

It will:
- Merge both CSV files using timestamps
- Train a Random Forest classifier
- Export modelWeights.js for use in the app


## CSV format reference 

| Column        | Description                            |
| ------------- | -------------------------------------- |
| label         | gesture name                           |
| thumb → pinky | flex values (0 = open, 1 = fully bent) |
| ax, ay, az    | accelerometer (g)                      |
| gx, gy, gz    | gyroscope (rad/s)                      |
| timestamp     | time in ms                             |


## Notes / Common Issues
- Both gloves need to record at the same time, otherwise merging won’t work properly
- On Windows, COM ports can change when reconnecting devices
- If Serial Monitor doesn’t connect, recheck the selected port
- If flex readings look off, redo calibration before collecting more data


