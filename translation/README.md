# Translation Firmware

This is the main firmware for both gloves.  
Use this after calibration is done and your ML model is ready.

---

## Libraries

Install from Arduino Library Manager:

- ESP32 BLE Arduino (usually comes with ESP32 board package)
- Adafruit MPU6050
- Adafruit Unified Sensor
- ArduinoJson

---

## Step 1 - Calibration (Do this properly)

You need to calibrate **each glove separately**.  
Flex sensor readings are never exactly the same between hands.

Flash `calibration.ino`, open Serial Monitor, then:

1. Keep all fingers fully open (~5 seconds)
2. Then close all fingers fully (~5 seconds)
3. Copy the `openVals` and `closedVals` printed in Serial

Paste them into both:
- `glove_left.ino`
- `glove_right.ino`

```cpp
const int openVals[5]   = {your values};
const int closedVals[5] = {your values};
```

## Step 2 - Flash to Gloves

| File              | Glove | BLE Name  |
| ----------------- | ----- | --------- |
| `glove_left.ino`  | Left  | `SIGNO-L` |
| `glove_right.ino` | Right | `SIGNO-R` |


## Step 3 - Connect to App

Open the SIGNO app and press Connect.

It should automatically detect:
- SIGNO-L
- SIGNO-R

<br>

## *__I didn't have any physical component and don't have yet, so now I can't give bebug solution for every problem that will show up, I will add it up soon.__*
