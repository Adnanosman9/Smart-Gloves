<h2 align="center">
   SIGNO Mobile App
</h2>

<h4 align="center">
   React Native app for real-time sign language translation
</h4>

<div align="center">

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Bluetooth](https://img.shields.io/badge/Bluetooth_LE-0082FC?style=for-the-badge&logo=bluetooth&logoColor=white)
![Android](https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white)

</div>

---

## Overview

This is the mobile app that connects everything in SIGNO.

It pairs with both gloves over BLE, receives sensor data at ~20Hz, runs it through the ML model, and outputs the translated BdSL sign with audio feedback.

It’s designed to work in real time on an actual Android device (emulator BLE is unreliable).

> [!TIP]
> If you just want to try it:
> Install the APK from `app-release.apk` and run it on your phone.

---

## Getting Started

### Requirements

- Node.js (18+ recommended)
- React Native CLI setup (follow official docs if needed)
- JDK 17+
- Android phone with BLE support (important)

---

### Setup

Go into the app folder:

```bash
cd app
```

### Install dependencies:
```
npm install
```

### Run the app
```
npm start
npm run android
```

## Bluetooth Setup

The app only connects to devices with these names:

| Glove | Name      |
| ----- | --------- |
| Left  | `SIGNO-L` |
| Right | `SIGNO-R` |


## Libraries Used
- ```react-native-ble-plx``` : BLE connection handling
- ```react-native-tts``` : text-to-speech output
- ```react-native-permissions``` : handles Android permissions

> ## Important

The app needs ```src/ml/modelWeights.js``` file to work:

If this file is missing, the app won’t translate anything.

Generate it by running the ML training after collecting glove data.
