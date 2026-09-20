<h1 align="center">
  BdSL Translator Glove
  <br>
</h1>

<h4 align="center">
A wearable glove that translates Bangladeshi Sign Language (BdSL) into speech in real-time
</h4>

<div align="center">

![ESP32](https://img.shields.io/badge/XIao--ESP32--C3-000000?style=for-the-badge&logo=espressif&logoColor=white)
![KiCad](https://img.shields.io/badge/KiCad-314CB0?style=for-the-badge&logo=kicad&logoColor=white)
![Fusion 360](https://img.shields.io/badge/Fusion%20360-FF6B00?style=for-the-badge&logo=autodesk&logoColor=white)

</div>

## What is this?

A lot of deaf people in Bangladesh have no easy way to talk to people who don't know sign language. I wanted to fix that. Not with a camera setup that needs good lighting and a phone pointed at you the whole time, but something you actually wear and carry around. So I built it into a glove.

## How it works

There are two ways to build this depending on what you have access to.

**Option 1: Commercial flex sensors (what I recommend)**
Five 2.2" flex sensors go along each finger, held down by TPU guide segments I designed and printed. When you bend a finger, the sensor's resistance changes and the ADC picks that up. Simple and reliable.

**Option 2: Conductive TPU (only if you have your own printer)**
I originally wanted to skip commercial sensors entirely and just print the finger segments in Conductive TPU. It's piezoresistive, so resistance shifts as it bends, same idea. But no commercial print service carries conductive TPU filament, so unless you have your own printer and the filament already, this option is off the table. I learned that the hard way.

Either way, a **XIAO ESP32-C3** reads all the sensor values alongside orientation data from an **MPU-6050** IMU, maps them into a hand-geometry profile, and classifies the sign. Everything gets sent over Bluetooth LE.

No cameras. Works in the dark. Works outside. Works anywhere.

Print the finger guides here: [for flex sensors](https://github.com/Adnanosman9/Smart-Gloves/tree/main/CAD%20for%20flex%20sensor) | [for 3D-printed sensor](https://github.com/Adnanosman9/Smart-Gloves/tree/main/CAD_3d%20printed%20sensor)

---

## Addressing the Hack Club Review

The first version got flagged for two things:

> *"$80 seems a bit much for flex sensors"* and *"your CAD only shows a box, could you maybe design some flexible structure out of TPU?"*

Both fair. Here's what I changed.

**On the cost:** The original $80 estimate was for 4" flex sensors. I've since switched to 2.2" sensors at $6.86 each, which brings the total down to $68.60. BdSL uses both hands, so that's 10 fingers, 10 sensors, and $68.60 is already the cheapest I could get this to work. Not padding anything, that's just what flex sensors cost.

**On the CAD:** I redesigned the finger part properly. Each finger now has a TPU guide segment that holds the flex sensor flat against the joint. The glove actually looks like a glove now, not just a box with wires coming out of it. The wrist hub is still a box (it has to be, there's a PCB in there), but the hand part is done.

---

## The Finger Guide System

Credit to [zackfreedman](https://www.thingiverse.com/thing:1606915) for the original parametric ring glove design that I built on top of.

Find the STL [here](https://github.com/Adnanosman9/Smart-Gloves/blob/main/CAD%20for%20flex%20sensor/Ring_Glove_Parametric.stl).

Each finger gets a TPU channel segment. The sensor slides in and stays put mechanically, no glue, no tape. I made two sizes: "Long" for the index, middle, and ring fingers, and "Short" for the thumb and pinky since those are shorter and sit at a different angle.

White TPU, printable by any FDM service that does flexible filament.

<img src="Images/TPU guide.jpg" alt="TPU finger guide segments" width="800"/>

---

## The PCB

I designed a low-profile wrist hub in KiCad to keep everything in one place. A few things worth noting:

The **XIAO ESP32-C3** was the obvious pick: tiny footprint, built-in BLE, enough ADC pins for all five sensors. I used a **47kΩ voltage divider** on each sensor input because the flex sensors are high-impedance and need it to read reliably. Threw in **0.1µF decoupling caps** on the sensor lines too after I noticed noise in early simulations.

DRC came back 0 errors. There are some silkscreen warnings but those are just text placement things, nothing that affects the board.

**Schematic:**

<img src="Images/glove_schematic.png" alt="Schematic" width="800"/>

**PCB Layout:**

<img src="Images/glove_pcb.png" alt="PCB Layout" width="800"/>

<img src="Images/Warning.png" alt="KiCad DRC: 0 errors, silkscreen warnings only" width="800"/>

---

## The Enclosure

Designed in Fusion 360. Sits on the wrist, low-profile. The whole electronics module attaches with Velcro so you can pull it off and actually wash the glove fabric.

<img src="Images/Box case.png" alt="Wrist hub box" width="800"/>

<img src="Images/Box Assembly 3.png" alt="Assembly render" width="800"/>

<img src="Images/Box Assembly 2.png" alt="Assembly render 2" width="800"/>

<img src="Images/Finger and sensor.png" alt="Finger segment with sensor" width="800"/>

---

## ⚠️ Heads up on the firmware

I haven't physically tested the firmware yet. There's a real chance there are I2C pin mismatches, wrong GPIO assignments, or sensor init issues that won't show up until you actually flash and boot it. Please double-check every pin assignment against the schematic before you flash anything. First boot will probably need some debugging.

## Bill of Materials

[BOM is here](bom/BOM.csv)

## Credits

- [KiCad](https://www.kicad.org/) for PCB design
- [Autodesk Fusion 360](https://www.autodesk.com/products/fusion-360/) for the enclosure
- [Open Print Sense](https://github.com/PaBu04/OpenPrintSense/tree/main) for the 3D-printed sensor approach
- [zackfreedman](https://www.thingiverse.com/thing:1606915) for the parametric finger guide base
- [Hack Club](https://hackclub.com/) for the support

---

> GitHub [@Adnanosman](https://github.com/Adnanosman9)
