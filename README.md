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

## What is this?
A lot of deaf people in Bangladesh can't easily communicate with those who don't know sign language. This project tries to fix that, not with cameras or computer vision, but with sensors built directly into a glove. That means it works in any lighting, doesn't need a phone pointed at you, and is actually portable.


## How it works
Five finger-mounted sensors are 3D-printed directly from **Conductive TPU**, acting as flex sensors through the piezoresistive effect, they change resistance as each finger bends. A **XIAO ESP32-C3** reads those values alongside orientation data from an **MPU-6050** IMU, maps them into a hand-geometry profile, and classifies the result into BdSL signs, transmitted over Bluetooth LE.
 
No cameras. No fragile commercial sensors. Works in any lighting, anywhere.

## Engineering Highlights
 
### Dual-Material Exoskeleton (Fusion 360)
 
The finger segments are FDM-printed in two materials simultaneously:
 
- **White TPU**: flexible structural base, comfortable to wear
- **Black Conductive TPU**: integrated sensing traces that shift resistance with bend angle
Segments come in two geometries ("Long" and "Short") to fit fingers anatomically, including the thumb and pinky.
 
<img src="Images/Finger and sensor.png" alt="Integrated Sensor Design" width="800"/>

Designed in KiCad and Fusion 360 for PCB and Enclosure

### Custom PCB (KiCad)
 
A low-profile wrist hub houses all electronics, with a few deliberate design choices:

- **Xiao ESP32-C3** used for high speed transmition in small size. 
- **47kΩ voltage divider** network tuned for high-impedance sensor readings
- **0.1µF decoupling caps** to filter noise from the printed traces
DRC: 0 errors.

**Schematic:**

<img src="Images/glove_schematic.png" alt="Schematic" width="800"/>

**PCB Layout:**

<img src="Images/glove_pcb.png" alt="PCB Layout" width="800"/>

### Wrist Hub Enclosure

Designed in Fusion 360 for maximum portability

**Box Case:**

<img src="Images/Box case.png" alt="Case Top" width="800"/>

## Assembly:

**Sensors assembly:**

<img src="Images/Box Assembly 1.png" alt="Assembly" width="800"/>

<img src="Images/Box Assembly 2.png" alt="Assembly" width="800"/>

<img src="Images/Box Assembly 3.png" alt="Assembly" width="800"/>


### ✅ Design Verification

**KiCad DRC Results (0 Errors):**
The PCB design passed the Design Rule Checker with 0 errors, but it has warnings and these warnings are just for a slikscreen text warning.

<img src="Images/Warning.png" alt="KiCad DRC Verification" width="800"/>

### Enclosure
* Designed in **Fusion 360**. 
* Low-profile box that sits on the wrist. 
* The electronics module detaches from the glove via Velcro straps, so you can actually wash the fabric.

## Bill of Materials

[BOM](bom/BOM.csv) is here. 

## ⚠ Caution
 
> The firmware has not been physically tested yet. There may be issues like I2C pin mismatches (SDA/SCL), wrong GPIO assignments, or sensor initialization errors that only show up on real hardware. Double-check all pin numbers against the schematic before flashing, and expect some debugging on first boot.
## Credits

This project uses:
- [KiCad](https://www.kicad.org/) for PCB design
- [Autodesk Fusion 360](https://www.autodesk.com/products/fusion-360/) for enclosure design
- [Hack Club](https://hackclub.com/) for support and inspiration

---

> GitHub [@Adnanosman](https://github.com/Adnanosman9)
















