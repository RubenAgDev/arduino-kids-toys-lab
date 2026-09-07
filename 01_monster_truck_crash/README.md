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

*Tip: If you only have one LED, you can plug it into Pin 6 or just watch the Arduino's built-in LED on Pin 13!*

---

## 🚀 How to Flash with VS Code & PlatformIO

### Step 1: Install PlatformIO IDE in VS Code
1. Open **VS Code**.
2. Go to the **Extensions view** (`Ctrl + Shift + X` on Windows/Linux or `Cmd + Shift + X` on Mac).
3. Search for **PlatformIO IDE** and click **Install**.
4. Allow PlatformIO to complete its background setup (takes 1–2 minutes).

### Step 2: Open This Project Folder
1. In VS Code, go to **File > Open Folder...**
2. Select this folder: `01_monster_truck_crash`.
3. PlatformIO will automatically recognize `platformio.ini` and initialize the project environment.

### Step 3: Connect Arduino & Upload
1. Connect your **Arduino Uno** (or **Arduino Nano**) to your computer via USB cable.
2. In the bottom status bar of VS Code, click the **PlatformIO Upload button** (`→` right arrow icon) or press `Ctrl + Alt + U`.
3. PlatformIO will compile `src/main.cpp` and flash the Arduino board automatically!

### Step 4: Open the Serial Monitor
1. Click the **Plug icon** (Serial Monitor) in the bottom status bar, or press `Ctrl + Alt + S`.
2. The baud rate is set to `115200`.
3. Watch the live ASCII arena telemetry graph as you push the truck!

---

## ⚙️ Customization

You can easily adjust the settings inside `src/main.cpp`:

- **Change Crash Distance**:
  ```cpp
  const float CRASH_DISTANCE_CM = 10.0f; // Increase to 15.0 or 25.0 for a longer track!
  ```
- **Passive vs. Active Buzzer**:
  ```cpp
  const bool USE_PASSIVE_BUZZER = true;  // Set false if your buzzer only clicks on/off
  ```
- **Speed & Pitch Range**:
  Adjust `beepInterval` and `beepPitch` to change how intense the crescendo feels!

---

## 🛠️ Comparison: SunFounder Original vs. Monster Truck Arena

| Feature | SunFounder Original Parking Sensor | Monster Truck Crash Arena |
|---|---|---|
| **Goal** | Prevent backing into a wall | Build suspense for an explosive car smash |
| **Sensor Placement** | On rear bumper, facing obstacles | At start ramp, tracking vehicle moving away |
| **Distance Behavior** | Closer = Faster beeps | Farther (towards 10cm) = Faster beeps |
| **Impact Event** | Stops or slow warning | 10cm triggers celebratory crash explosion SFX & strobe |
| **Visuals** | Basic single LED blink | 3-stage color ramp + multi-LED strobe |
| **Audio** | Monotone beep | Dynamic pitch climbing (650Hz–1750Hz) + crash crunch rumble |
