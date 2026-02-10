<h1 align="center">
  BdSL Translator Glove
  <br>
</h1>

<h4 align="center">
An assistive wearable that translates Bangladeshi Sign Language (BdSL) into text and speech in real-time
</h4>

<div align="center">

![ESP32](https://img.shields.io/badge/ESP32--C6-000000?style=for-the-badge&logo=espressif&logoColor=white)
![Arduino](https://img.shields.io/badge/Arduino-00979D?style=for-the-badge&logo=arduino&logoColor=white)
![KiCad](https://img.shields.io/badge/KiCad-314CB0?style=for-the-badge&logo=kicad&logoColor=white)
![Fusion 360](https://img.shields.io/badge/Fusion%20360-FF6B00?style=for-the-badge&logo=autodesk&logoColor=white)

</div>

## Overview

Communication is a fundamental right, yet many in the deaf and hard-of-hearing community in Bangladesh face significant barriers. This project is a **low-cost, sensor-based wearable** designed to bridge that gap.

Unlike existing systems that rely on computer vision (which requires a camera and good lighting), this glove uses **integrated sensors** to track hand orientation and finger flex, making it:

- ✅ **Portable** – No external cameras needed
- ✅ **Environment-Independent** – Works in any lighting condition
- ✅ **Privacy-Focused** – No video recording required
- ✅ **Culturally Relevant** – Built specifically for Bangladeshi Sign Language

## Key Features

- **Dual-Hand Tracking** - ESP32-C6-Mini processes data from 5 flex sensors + MPU-6050 IMU
- **Compact Design** - Custom PCB placed in 3D-printed "Wrist Hub"
- **Custom Dataset** - Built specifically for BdSL gestures
- **Wireless Ready** - Wi-Fi 6, Bluetooth 5, and Matter-ready

## Design

Designed in KiCad and Fusion 360 for PCB and Enclosure

### PCB

Designed in KiCad with multi-layer board and antenna keep-out zone

**Schematic:**

<img src="Images/schematic.png" alt="Schematic" width="800"/>

**PCB Layout:**

<img src="Images/pcb_layout.png" alt="PCB Layout" width="800"/>

**PCB 3D View:**

<img src="Images/pcb_3d.png" alt="PCB 3D" width="800"/>

### Wrist Hub Enclosure

Designed in Fusion 360 for maximum portability

**Top Case:**

<img src="Images/case_top.png" alt="Case Top" width="800"/>

**Bottom Case:**

<img src="Images/case_bottom.png" alt="Case Bottom" width="800"/>

**Assembly:**

<img src="Images/assembly.png" alt="Assembly" width="800"/>

### Hardware Wiring

**Voltage Divider Configuration:**

The flex sensors are wired in a pull-down configuration to ensure stable ADC readings:

- 🔴 **Red Wire**: 3.3V Power to Sensor
- 🟢 **Green Wire**: Signal from Sensor to ESP32 ADC pin
- ⚫ **Black Wire**: path to Ground (GND)

## Bill of Materials

| Component       | Specification          | Qty | Link      |
| --------------- | ---------------------- | --- | --------- |
| Microcontroller | ESP32-C6-Mini          | 1   | [shop](#) |
| Flex Sensors    | Resistive Flex Sensors | 5   | [shop](#) |
| IMU             | MPU-6050 (6-axis)      | 1   | [shop](#) |
| Battery         | 3.7V Li-Po Battery     | 1   | [shop](#) |
| Charger         | TP4056 Charging Module | 1   | [shop](#) |
| Resistors       | 10kΩ Resistors         | 5   | [shop](#) |

### Full BOM with detailed specifications coming soon.

## Current Status

**✅ Completed:**

---> Complete KiCad Schematic (0 Errors / 0 Warnings)
---> 3D Model Assembly and Wire Routing
---> Voltage Divider Circuit Design
---> Component Selection and BOM

**🔄 In Progress:**

- Physical Prototype Assembly
- Sensor Calibration and Data Collection
- Machine Learning Model Training for BdSL gestures
- Firmware Optimization for Real-Time Inference

## Roadmap

### Phase 1: Hardware Validation (Current)

Currently working to creating the hardware parts. We are focusing on making it better to use not just a prototype.

### Phase 2: Data Collection

We are planning to collaborate with a deaf community, most probably Bangladesh national federation of the deaf.
We want to collaborate to make it better by working with practical data and deaf people to make a proper impact.

### Phase 3: ML Model Development

- Train gesture recognition model
- Optimize for ESP32-C6 inference
- Achieve >90% accuracy on test set

### Phase 4: Integration & Testing

- Integrate ML model with firmware
- Implement text-to-speech output
- User testing with deaf community members

## Credits

This project uses:

- [KiCad](https://www.kicad.org/) for PCB design
- [Autodesk Fusion 360](https://www.autodesk.com/products/fusion-360/) for enclosure design
- [Hack Club](https://hackclub.com/) for support and inspiration

---

**Built with ❤️ to empower the deaf community in Bangladesh**

> GitHub [@Adnanosman](https://github.com/Adnanosman9)
