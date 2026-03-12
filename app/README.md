# SIGNO Mobile App

React Native app for translating BdSL (Bangladeshi Sign Language) gestures using a pair of smart gloves. Both gloves connect over Bluetooth, the app runs a gesture classifier on-device, and speaks the result out loud.

---

## What it does

- Connects to both gloves over BLE at the same time
- Shows live flex sensor readings for all 10 fingers
- Classifies gestures using a Random Forest model — no internet needed
- Speaks each recognized gesture using TTS
- Builds sentences from multiple gestures
- Auto-speak toggle
- Shows connection status + signal strength

---

## Stack

| Layer | Tech |
|-------|------|
| Framework | React Native 0.73 |
| Bluetooth | react-native-ble-plx |
| TTS | react-native-tts |
| Navigation | React Navigation (Bottom Tabs) |
| ML | Custom Random Forest in JS |
| Storage | AsyncStorage |

---

## Project structure

```
app/
├── App.js
├── package.json
└── src/
    ├── hooks/
    │   ├── useBleGloves.js         ← BLE manager for both gloves
    │   └── useTTS.js
    ├── screens/
    │   ├── TranslateScreen.js
    │   └── HistoryScreen.js
    └── ml/
        ├── useGestureClassifier.js
        └── modelWeights.js         ← you need to generate this
```

---

## Setup

### 1. Install

```bash
cd app
npm install
```

### 2. Android permissions

Already in the manifest, but the app needs:
- `BLUETOOTH_SCAN`
- `BLUETOOTH_CONNECT`
- `ACCESS_FINE_LOCATION`

### 3. Generate the model

The app won't work without `src/ml/modelWeights.js`. It'll crash on startup if the file is missing.

Collect gesture data with the `data_collect` firmware first, then:

```bash
cd ml
python train.py
python export_model.py
```

Copy the output into `src/ml/`.

### 4. Run

```bash
npx react-native run-android
# or
npx react-native run-ios
```

---

## How it works

1. Scans for BLE devices named `SIGNO-L` and `SIGNO-R`
2. Subscribes to notifications from both
3. Each glove sends JSON at 20Hz:
   ```json
   {"h":"L","f":[t,i,m,r,p],"a":[ax,ay,az],"g":[gx,gy,gz],"t":millis}
   ```
4. Both gloves get combined into a 16-value feature vector
5. Model returns a label + confidence
6. Anything above 72% confidence gets displayed and spoken

---

## BLE UUIDs

| Glove | Service UUID | Characteristic UUID |
|-------|-------------|---------------------|
| Left | `4fafc201-1fb5-459e-8fcc-c5c9c331914b` | `beb5483e-36e1-4688-b7f5-ea07361b26a8` |
| Right | `4fafc201-1fb5-459e-8fcc-c5c9c331914c` | `beb5483e-36e1-4688-b7f5-ea07361b26a9` |

---

## ML model

Exported from scikit-learn into a plain JS object. Runs a sliding window of 6 frames before classifying.

**Input:** 16 floats — `[L_flex×5, L_accel×3, R_flex×5, R_accel×3]`

**Output:** gesture label + confidence score

72% threshold is where false positives started becoming a problem in testing — adjust if needed.

---

## Note

App crashes without `modelWeights.js`. Train the model first before trying to run anything.
