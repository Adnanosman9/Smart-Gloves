<h1 align="center">
  BdSL Translator Glove
  <br>
</h1>

<h4 align="center">
An wearable smarrt glove that translates Bangladeshi Sign Language (BdSL) into speech in real-time
</h4>

<div align="center">

![ESP32](https://img.shields.io/badge/ESP32--C6-000000?style=for-the-badge&logo=espressif&logoColor=white)
![KiCad](https://img.shields.io/badge/KiCad-314CB0?style=for-the-badge&logo=kicad&logoColor=white)
![Fusion 360](https://img.shields.io/badge/Fusion%20360-FF6B00?style=for-the-badge&logo=autodesk&logoColor=white)

</div>

## Project Vision
<div align="center">
  <img src="Visualization poster.png" alt="BdSL Glove Poster">
  <br>
  
  <div style="background-color: #1a1a1a; padding: 10px; border-radius: 10px; display: inline-block;">
    <a href="https://git.io/typing-svg">
      <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=20&duration=2500&pause=1000&color=32CD32&center=true&vCenter=true&width=800&lines=Illustrating+Wearable+Features+%26+Goals;Designed+to+Empower+the+Deaf+Community" alt="Typing SVG" />
    </a>
    <br>
    <img src="https://img.shields.io/badge/Rendered%20By-Nano%20Banana%20Pro-FFD700?style=for-the-badge&logo=visual-studio-code&logoColor=black" alt="Nano Banana Pro Badge">
  </div>
</div>
---

## Overview

Communication is a fundamental right, yet many in the deaf community in Bangladesh face significant barriers. This project is a **sensor based wearable glove** to bridge that gap.

Unlike existing systems that rely on computer vision, this glove uses **integrated sensors** to track hand movements and finger bendings, making it:

-  **Portable** – No external cameras needed
-  **Environment Independent** – Works in any lighting condition
-  **Culturally Relevant** – Built specifically for Bangladeshi Sign Language

## Key Features

- **Dual-Hand Tracking** - ESP32-C6-Mini processes data from 5 flex sensors + MPU-6050 IMU
- **Compact Design** - Custom PCB placed in 3D-printed "Wrist Hub"
- **Custom Dataset** - We are willing to make our specific dataset for BdSL
- **Wireless Ready** - Wi-Fi 6, Bluetooth 5

## Design

Designed in KiCad and Fusion 360 for PCB and Enclosure

### PCB

Designed in KiCad with multi-layer board and antenna keep-out zone

**Schematic:**

<img src="Images/Glove_Schemetic.png" alt="Schematic" width="800"/>

**PCB Layout:**

<img src="Images/Glove_PCB.png" alt="PCB Layout" width="800"/>

**PCB 3D View:**

<img src="Images/3D View.png" alt="PCB 3D" width="800"/>

### Wrist Hub Enclosure

Designed in Fusion 360 for maximum portability

**Box Case:**

<img src="Images/Box case.png" alt="Case Top" width="800"/>

## Assembly:

**Sensors assembly:**

<img src="Images/Box Assembly 1.png" alt="Assembly" width="800"/>

<img src="Images/Box Assembly 2.png" alt="Assembly" width="800"/>

<img src="Images/Box Assembly 3.png" alt="Assembly" width="800"/>

**Wiring Diagram:**

<img src="Images/Wiring Diagram.png" alt="Assembly" width="800"/>

### ✅ Design Verification

**KiCad DRC Results (0 Errors):**
The PCB design passed the Design Rule Checker with 0 errors, but it has 2 warnings and these warnings are just for a slikscreen border on the antena area.

<img src="Images/Warning message.png" alt="KiCad DRC Verification" width="800"/>

### Hardware Wiring

**Voltage Divider Configuration:**
The flex sensors are wired in a pull-down configuration to ensure stable ADC readings:

- 🔴 **Red Wire**: 3.3V Power to Sensor
- 🟢 **Green Wire**: Signal from Sensor to ESP32 ADC pin
- ⚫ **Black Wire**: path to Ground (GND)

## Bill of Materials

| Component        | Specification          | Qty | Link      |
| ---------------- | ---------------------- | --- | --------- |
| Microcontroller | ESP32-C6-Mini          | 2   | [shop](https://store.roboticsbd.com/internet-of-things-iot/3855-esp32-c6-supermini-development-board-wifi-6-bluetooth-5-le-risc-v-32-bit-robotics-bangladesh.html) |
| Flex Sensors     | Resistive Flex Sensors | 10  | [shop](https://store.roboticsbd.com/flex-force-load/3645-flex-sensor-45-china-robotics-bangladesh.html) |
| IMU              | MPU-6050 (6-axis)      | 2   | [shop](https://store.roboticsbd.com/robotics-parts/104-6dof-accelerometer-gyroscope-gy-521-mpu-6050-robotics-bangladesh.html) |
| Battery          | 3.7V Li-Po Battery     | 2   | [shop](https://store.roboticsbd.com/battery/1260-lipo-battery-4500mah-111v-3s-robotics-bangladesh.html) |
| Resistors        | 10kΩ Resistors         | 10  | [shop](https://store.roboticsbd.com/resistor/243-10k-ohm-14w-carbon-film-resistor-pack-of-10-robotics-bangladesh.html) |
| Capacitor        | 0.1uf Capacitor        | 4   | [shop](https://store.roboticsbd.com/capacitor/2280-01uf-50v-capacitor-robotics-bangladesh.html) |

### Approximate cost : 250 usd


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


## > Currentlly we are working on the coding part || **Coding Partner** [Kishor](https://github.com/kishor1594)

### Hackclub Project and journals [HackClub](https://blueprint.hackclub.com/projects/11759)

## Credits

This project uses:
- [KiCad](https://www.kicad.org/) for PCB design
- [Autodesk Fusion 360](https://www.autodesk.com/products/fusion-360/) for enclosure design
- [Hack Club](https://hackclub.com/) for support and inspiration

---

**Built to empower the deaf community in Bangladesh**

> GitHub [@Adnanosman](https://github.com/Adnanosman9)





