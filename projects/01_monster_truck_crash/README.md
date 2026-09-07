# 🏎️ Project 01: Monster Truck Crash Arena Sensor

An interactive Arduino robotics & sound-FX project for kids toys and games!

Based on the [SunFounder Arduino Parking Sensor (V5)](https://www.sunfounder.com/pages/arduino-parking-sensor-with-ultrasonic-sensor-v5), re-engineered specifically for a **Monster Truck Car-Crushing Arena**.

---

## 🎯 Concept & Game Mechanics

In a conventional car parking sensor, the buzzer beeps faster as an obstacle gets **closer**.

In this **Monster Truck Crash Project**, the physics are inverted:
1. The **HC-SR04 ultrasonic sensor** is mounted at the **start gate / launch ramp**.
2. The **Monster Truck** starts close to the sensor (~2–3 cm).
3. The **pile of crushable junker cars** is positioned **10 cm away** from the sensor.
4. As the monster truck accelerates **AWAY from the sensor**, the measured distance increases.
5. The buzzer beeps **faster and higher pitched**, and the LEDs flash with mounting speed.
6. Once the monster truck reaches **10 cm**, **IMPACT!** The system unleashes a continuous crash siren, strobe light show, and engine rumble crunch sequence!

---

## 🔌 Pin Connections

| Component | Pin / Terminal | Arduino Pin | Notes |
|---|---|---|---|
| **HC-SR04** | VCC | 5V | Power |
| **HC-SR04** | GND | GND | Ground |
| **HC-SR04** | TRIG | Digital Pin 9 | Ultrasonic trigger pulse |
| **HC-SR04** | ECHO | Digital Pin 10 | Echo pulse return |
| **Buzzer** | Positive (+) | Digital Pin 3 | Passive or Active buzzer |
| **Buzzer** | Negative (-) | GND | Ground |
| **Green LED** | Anode (+) | Digital Pin 4 | Via 220Ω resistor (Start zone) |
| **Yellow LED**| Anode (+) | Digital Pin 5 | Via 220Ω resistor (Acceleration zone) |
| **Red LED**   | Anode (+) | Digital Pin 6 | Via 220Ω resistor (Crash zone) |
| **All LEDs**  | Cathode (-) | GND | Ground rail |

---

## 🚀 How to Flash with VS Code & PlatformIO

1. Open **VS Code** with the **PlatformIO IDE** extension installed.
2. Click **File > Open Folder...** and select this directory.
3. Plug in your **Arduino Uno** or **Nano** via USB.
4. Click the **Upload** arrow button in the bottom status bar (`Ctrl + Alt + U`).
5. Open the **Serial Monitor** at **115200 baud** (`Ctrl + Alt + S`) to watch live telemetry!
