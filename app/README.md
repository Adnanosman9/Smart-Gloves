# 🧤 SIGNO Mobile App

<h4 align="center">
React Native application for real-time sign language translation
</h4>

<div align="center">

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Bluetooth](https://img.shields.io/badge/Bluetooth_LE-0082FC?style=for-the-badge&logo=bluetooth&logoColor=white)
![Android](https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white)

</div>

## Overview

This is the central "brain" of the SIGNO project. It connects via **Bluetooth Low Energy (BLE)** to both the left and right gloves, processes sensor data streaming at 20Hz, and uses a pre-trained ML model to translate Bangladeshi Sign Language (BdSL) into spoken audio in real-time.

> [!TIP]
> **Just want to use the app?** 
> [Download the pre-built APK here](./android/app/build/outputs/apk/release/app-release.apk) and install it directly on your Android phone to get started immediately without setting up a development environment.

---

##  Getting Started

### Prerequisites

- **Node.js**: LTS version (18+)
- **React Native CLI**: Follow the [official setup guide](https://reactnative.dev/docs/environment-setup)
- **Java SDK**: JDK 17+ (for Android)
- **Physical Device**: BLE performance is best tested on a real phone

### Installation

1. Navigate to the app directory:
   ```bash
   cd app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. (iOS Only) Install pods:
   ```bash
   cd ios && pod install && cd ..
   ```

### Running the App

```bash
npm start

npm run android

npm run ios
```

---

##  Codebase Structure

The app is built with a modular structure to handle asynchronous sensor streams efficiently:

- **`src/hooks/useBleGloves.js`**: The core BLE management hook. Handles scanning, simultaneous connection to two gloves, and JSON packet parsing.
- **`src/ml/`**: Contains the model weights and inference logic.
- **`src/screens/`**:
  - `TranslateScreen.js`: Main real-time translation interface with visual feedback.
  - `HistoryScreen.js`: Logs of previous translations.

---

##  Bluetooth Specs

The app logic filters for specific BLE advertising names and service/characteristic UUIDs defined in the firmware:

| Glove | Advertising Name | Service UUID |
|-------|------------------|--------------|
| **Left** | `SIGNO-L` | `4fafc201-1fb5-459e-8fcc-c5c9c331914b` |
| **Right** | `SIGNO-R` | `4fafc201-1fb5-459e-8fcc-c5c9c331914c` |

---

##  Key Libraries

- **`react-native-ble-plx`**: High-performance Bluetooth LE management.
- **`react-native-tts`**: Text-to-Speech engine for audio output.
- **`react-native-permissions`**: Handles Android 12+ Bluetooth and Location permission requests.

---

##  Important Note

The app expects a **`modelWeights.js`** file in `src/ml/`. If you are building this from scratch, you must first complete the "Data Collection" phase in the project root to generate these weights, or the app will not be able to perform translations.
