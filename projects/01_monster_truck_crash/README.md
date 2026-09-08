# Monster Truck Crash Sensor (PlatformIO Project)

Flash this folder to Arduino Uno/Nano using VSCode + PlatformIO.
Target crash distance: 30 cm away from the sensor!

## 🔧 Hardware Required
- Arduino Uno or Nano
- HC-SR04 Ultrasonic Distance Sensor
- 1x Active or Passive Buzzer
- 1x Green LED (Start zone)
- 1x Yellow LED (Warning zone)
- 1x Red LED (Crash zone)
- 3x 220Ω Resistors (for LEDs)
- Jumper wires and breadboard

## ⚡ Wiring Connections

| Component | Component Pin | Arduino Pin | Notes |
|---|---|---|---|
| **HC-SR04**   | VCC | 5V | Power rail |
| **HC-SR04**   | GND | GND | Ground rail |
| **HC-SR04**   | TRIG | Digital Pin 9 | 10μs trigger pulse |
| **HC-SR04**   | ECHO | Digital Pin 10 | Echo return measurement |
| **Buzzer**    | Positive (+) | Digital Pin 3 | PWM-capable tone pin |
| **Buzzer**    | Negative (-) | GND | Ground |
| **Green LED** | Anode (+) | Digital Pin 4 | Via 220Ω resistor (Start zone) |
| **Yellow LED**| Anode (+) | Digital Pin 5 | Via 220Ω resistor (Warning zone) |
| **Red LED**   | Anode (+) | Digital Pin 6 | Via 220Ω resistor (Crash zone) |
| **All LEDs**  | Cathode (-) | GND | Ground rail |

*Tip: If you only have one LED, you can plug it into Pin 6 or just watch the Arduino's built-in LED on Pin 13!*

## 🚀 How to Flash with VS Code & PlatformIO
1. Open **VS Code** with the **PlatformIO IDE** extension installed.
2. Click **File > Open Folder...** and select this directory.
3. Plug in your **Arduino Uno** or **Nano** via USB.
4. Click the **Upload** arrow button in the bottom status bar (`Ctrl + Alt + U`).
5. Open the **Serial Monitor** at **115200 baud** (`Ctrl + Alt + S`) to watch live telemetry!

## ⚙️ Customization
You can easily adjust the settings inside `src/main.cpp`:
- **Change Crash Distance**:
  ```cpp
  const float CRASH_DISTANCE_CM = 30.0f; // Increase to 50.0 for a longer track!
  ```
- **Passive vs. Active Buzzer**:
  ```cpp
  const bool USE_PASSIVE_BUZZER = true;  // Set false if your buzzer only clicks on/off
  ```

## 🛠️ Comparison: SunFounder Original vs. Monster Truck Arena

| Feature | SunFounder Original Parking Sensor | Monster Truck Crash Arena |
|---|---|---|
| **Goal** | Prevent backing into a wall | Build suspense for an explosive car smash |
| **Sensor Placement** | On rear bumper, facing obstacles | At start ramp, tracking vehicle moving away |
| **Distance Behavior** | Closer = Faster beeps | Farther (towards 30cm) = Faster beeps |
| **Impact Event** | Stops or slow warning | 30cm triggers celebratory crash explosion SFX & strobe |
| **Visuals** | Basic single LED blink | 3-stage color ramp + multi-LED strobe |
| **Audio** | Monotone beep | Dynamic pitch climbing (650Hz–1750Hz) + 3 siren bursts |
