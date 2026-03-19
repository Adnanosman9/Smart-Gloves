# Building This Project — A Guide

This is for anyone trying to build the gloves from scratch or contribute to the project. I'll walk through the full process in the order you actually need to do things.

---

## What this is

Two gloves, each running an ESP32-C6 with 5 flex sensors and an MPU6050. They send sensor data over BLE to a React Native app, which classifies the gesture and reads it out loud. No internet, no camera, runs fully on-device.

---

## What you need installed
 
- [Arduino IDE](https://www.arduino.cc/en/software) — with the ESP32 board package installed (add `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json` to board manager URLs)
- [Node.js](https://nodejs.org/en/download) — LTS version is fine, needed for the React Native app
- [React Native CLI](https://reactnative.dev/docs/environment-setup) — follow the "React Native CLI Quickstart" tab, not Expo
- [Python 3](https://www.python.org/downloads/) — for the ML training pipeline when that's ready
- An Android or iOS phone for the app

---

## Step 0 - Hardware first

Order from the BOM before doing anything else. Flex sensors are the expensive part - 10 of them will run you around 20k BDT — and if you're buying locally they can take a while to arrive.

PCB files are in `/PCB/`. Take `Gerber.zip` and upload it to JLCPCB or wherever you get PCBs made. 2-layer, standard settings, nothing special.

Enclosure files are in `/CAD/`. `.f3d` opens in Fusion 360, `.step` works in pretty much everything else. Print both halves and check the fit before you start mounting anything.

---

## Step 1 - Calibrate before anything else

The flex sensors read differently depending on how they sit on your hand and how tight the glove is. The placeholder values in the firmware (`openVals = 400`, `closedVals = 900`) are just guesses - you need real numbers from your actual gloves.

Flash `translation/calibration.ino` to an ESP32, open Serial Monitor at `115200 baud`, and follow what it prints. It'll ask you to hold fingers open, then close them, and spit out your values:

```cpp
const int openVals[5]   = {412, 398, 405, 410, 395};
const int closedVals[5] = {887, 901, 876, 892, 910};
```

Do this for both gloves separately. Left and right hands flex differently so the numbers won't match.

---

## Step 2 - Record gesture data

Paste your calibration values into `data_collect/data_collect_left.ino` and `data_collect/data_collect_right.ino` - the arrays are near the top, hard to miss.

Flash left to left, right to right. Open two separate Arduino IDE windows with Serial Monitor at `115200 baud` each.

To record a gesture — form it with both hands, type the label in both Serial Monitors at roughly the same time and hit Enter, hold the gesture still for about 1.5 seconds. It records 30 samples then stops. Repeat for the next one.

Copy the output from each window into `left_hand.csv` and `right_hand.csv`.

50 samples per gesture is the minimum to get anything reasonable out of the model. 100 is better. If a gesture looks noisy, record more.

One thing to watch: both ESPs timestamp using their own uptime clock from whenever they booted, not actual wall time. If you started them at different times the timestamps won't line up directly - the merge script will need to handle that offset.

---

## Step 3 - Train the model

The training scripts aren't in the repo yet. This part is still being worked on.

When it's ready, it'll merge both CSVs, train a Random Forest, and export `modelWeights.js` into `app/src/ml/`. The app imports that file on startup - if it's missing, the app crashes immediately.

---

## Step 4 - Flash the translation firmware

Same deal as data collection - paste your calibration values into `translation/glove_left.ino` and `translation/glove_right.ino` before flashing.

Left glove advertises as `SIGNO-L`, right as `SIGNO-R`. The app looks for exactly those names when scanning.

---

## Step 5 - Run the app

```bash
cd app
npm install
npx react-native run-android
# or
npx react-native run-ios
```

On Android you'll need to grant `BLUETOOTH_SCAN`, `BLUETOOTH_CONNECT`, and `ACCESS_FINE_LOCATION` - the permissions are already in the manifest, just make sure they're accepted on the device. Tap Connect and it'll find both gloves on its own.


---

## Things that might bite you

The firmware hasn't been tested on real hardware yet so there will probably be some debugging involved. A few things to check before you get frustrated;

**modelWeights.js** - the app will crash without it. Don't try to run the app until the model is trained and the file is in place.

**BLE not advertising on first boot** - occasionally the BLE stack on ESP32 doesn't start clean after a fresh flash. Power cycle the board if the app can't find a glove.

---

## Contributing

If you fix any of the above or build out the ML training pipeline, PRs are welcome. One thing per PR makes it easier to review.

---

