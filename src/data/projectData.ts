import { ArduinoProject, PinConnection } from '../types';

export const PIN_CONNECTIONS: PinConnection[] = [
  {
    component: 'HC-SR04 Sensor',
    pin: 'VCC',
    arduinoPin: '5V',
    color: '#ef4444', // Red
    type: 'Power',
    notes: 'Power pin (+5V DC rail)'
  },
  {
    component: 'HC-SR04 Sensor',
    pin: 'GND',
    arduinoPin: 'GND',
    color: '#1f2937', // Black
    type: 'Ground',
    notes: 'Common system ground'
  },
  {
    component: 'HC-SR04 Sensor',
    pin: 'TRIG',
    arduinoPin: 'Pin 9',
    color: '#eab308', // Yellow
    type: 'Digital IO',
    notes: '10μs trigger pulse output'
  },
  {
    component: 'HC-SR04 Sensor',
    pin: 'ECHO',
    arduinoPin: 'Pin 10',
    color: '#3b82f6', // Blue
    type: 'Digital IO',
    notes: 'Echo return pulse input'
  },
  {
    component: 'Buzzer (Passive or Active)',
    pin: 'Positive (+)',
    arduinoPin: 'Pin 3',
    color: '#f97316', // Orange
    type: 'PWM',
    notes: 'Supports tone() pitch variation'
  },
  {
    component: 'Buzzer',
    pin: 'Negative (-)',
    arduinoPin: 'GND',
    color: '#1f2937', // Black
    type: 'Ground',
    notes: 'Ground return'
  },
  {
    component: 'Green LED (Start Zone)',
    pin: 'Anode (+) via 220Ω',
    arduinoPin: 'Pin 4',
    color: '#22c55e', // Green
    type: 'Digital IO',
    notes: 'Safe / Launch zone indicator'
  },
  {
    component: 'Yellow LED (Acceleration Zone)',
    pin: 'Anode (+) via 220Ω',
    arduinoPin: 'Pin 5',
    color: '#eab308', // Yellow
    type: 'Digital IO',
    notes: 'Warning / Approaching crash point'
  },
  {
    component: 'Red LED (Crash Impact Zone)',
    pin: 'Anode (+) via 220Ω',
    arduinoPin: 'Pin 6',
    color: '#ef4444', // Red
    type: 'Digital IO',
    notes: 'Crash impact indicator & strobe'
  },
  {
    component: 'All LEDs',
    pin: 'Cathodes (-)',
    arduinoPin: 'GND',
    color: '#1f2937', // Black
    type: 'Ground',
    notes: 'Connect to breadboard ground rail'
  }
];

export const MAIN_CPP_CONTENT = `/**
 * ==============================================================================
 * Project: Monster Truck Crash Detector (Arduino Kids Games & Toys)
 * Based on: SunFounder Ultrasonic Parking Sensor V5
 * 
 * CONCEPT & MODIFICATIONS:
 * In a traditional parking sensor, alerts get faster as an obstacle gets closer.
 * For this Monster Truck project, the setup is inverted for dramatic action:
 *   - The HC-SR04 ultrasonic sensor is placed at the starting gate/ramp.
 *   - The monster truck starts near the sensor (~2-3 cm).
 *   - As the truck drives AWAY from the sensor toward the pile of cars, the
 *     measured distance increases.
 *   - The buzzer buzzes faster and the LEDs flash faster as distance INCREASES.
 *   - At 10 cm away (CRASH_DISTANCE_CM), the monster truck crashes into the
 *     cars! The system triggers a continuous crash siren, strobe light show,
 *     and celebratory crunch sound effects!
 * ==============================================================================
 */

#include <Arduino.h>

// ==============================================================================
// 1. PIN CONFIGURATION
// ==============================================================================
const int TRIG_PIN         = 9;   // HC-SR04 Ultrasonic Trigger
const int ECHO_PIN         = 10;  // HC-SR04 Ultrasonic Echo
const int BUZZER_PIN       = 3;   // Buzzer (Active or Passive PWM pin)

// LED indicators (supports 3-LED stoplight or single warning LED)
const int LED_GREEN_PIN    = 4;   // Green: Start line / Launch zone
const int LED_YELLOW_PIN   = 5;   // Yellow: Acceleration / Approaching impact
const int LED_RED_PIN      = 6;   // Red: Imminent impact / Crash alert
const int ONBOARD_LED_PIN  = 13;  // Arduino onboard LED for instant visual feedback

// ==============================================================================
// 2. DISTANCE CALIBRATION & GAME THRESHOLDS
// ==============================================================================
const float START_DISTANCE_CM  = 2.5f;   // Start position near sensor (cm)
const float CRASH_DISTANCE_CM  = 10.0f;  // Pile of cars is placed at 10 cm!
const float MAX_TRACK_DISTANCE = 35.0f;  // Filter out-of-range sensor glitches
const bool USE_PASSIVE_BUZZER  = true;   // Enables pitch shifting 650Hz -> 1750Hz

// ==============================================================================
// 3. GLOBAL VARIABLES & TIMING
// ==============================================================================
unsigned long lastBeepToggleTime = 0;
bool beepState = false;
bool hasCrashed = false;
float lastValidDistance = 2.5f;

// FUNCTION DECLARATIONS
float measureDistance();
void updateLeds(float distance, bool blinkState);
void playBeep(bool state, int frequency);
void triggerCrashSequence();
void printTelemetry(float distance, int beepInterval, float intensityPct);

void setup() {
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_GREEN_PIN, OUTPUT);
  pinMode(LED_YELLOW_PIN, OUTPUT);
  pinMode(LED_RED_PIN, OUTPUT);
  pinMode(ONBOARD_LED_PIN, OUTPUT);

  digitalWrite(TRIG_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(LED_GREEN_PIN, LOW);
  digitalWrite(LED_YELLOW_PIN, LOW);
  digitalWrite(LED_RED_PIN, LOW);
  digitalWrite(ONBOARD_LED_PIN, LOW);

  Serial.begin(115200);
  delay(200);

  Serial.println(F("=================================================="));
  Serial.println(F("🏎️💨  MONSTER TRUCK CRASH ARENA SENSOR READY!   "));
  Serial.println(F("=================================================="));

  // Power-on chirp sequence
  for (int f = 600; f <= 1200; f += 200) {
    if (USE_PASSIVE_BUZZER) tone(BUZZER_PIN, f, 50);
    digitalWrite(ONBOARD_LED_PIN, HIGH);
    digitalWrite(LED_GREEN_PIN, HIGH);
    delay(60);
    digitalWrite(ONBOARD_LED_PIN, LOW);
    digitalWrite(LED_GREEN_PIN, LOW);
  }
}

void loop() {
  float currentDistance = measureDistance();

  if (currentDistance <= 0.0f || currentDistance > MAX_TRACK_DISTANCE) {
    currentDistance = lastValidDistance;
  } else {
    lastValidDistance = currentDistance;
  }

  // CASE 1: TRUCK AT OR PAST THE CRASH POINT (10 cm)
  if (currentDistance >= CRASH_DISTANCE_CM && currentDistance < MAX_TRACK_DISTANCE) {
    triggerCrashSequence();
    return;
  }

  if (currentDistance < 4.0f) {
    hasCrashed = false;
  }

  // CASE 2: TRUCK APPROACHING THE CRASH POINT (2.0 cm -> 9.9 cm)
  // Distance increasing away from sensor -> Frequency & flash rate INCREASES!
  float progress = (currentDistance - START_DISTANCE_CM) / (CRASH_DISTANCE_CM - START_DISTANCE_CM);
  if (progress < 0.0f) progress = 0.0f;
  if (progress > 0.99f) progress = 0.99f;

  // Beep interval: 600ms (slow) down to 50ms (rapid impact)
  int beepInterval = (int)(600.0f - (progress * 550.0f));
  if (beepInterval < 40) beepInterval = 40;

  // Buzzer pitch: 650 Hz (calm rumble) up to 1750 Hz (high alert scream)
  int beepPitch = (int)(650.0f + (progress * 1100.0f));

  unsigned long now = millis();
  if (now - lastBeepToggleTime >= (unsigned long)beepInterval) {
    lastBeepToggleTime = now;
    beepState = !beepState;
    playBeep(beepState, beepPitch);
    updateLeds(currentDistance, beepState);
  }

  static unsigned long lastSerialTime = 0;
  if (millis() - lastSerialTime > 150) {
    lastSerialTime = millis();
    printTelemetry(currentDistance, beepInterval, progress * 100.0f);
  }

  delay(15);
}

float measureDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  unsigned long duration = pulseIn(ECHO_PIN, HIGH, 25000);
  if (duration == 0) return -1.0f;
  return (duration * 0.0343f) / 2.0f;
}

void updateLeds(float distance, bool blinkState) {
  digitalWrite(ONBOARD_LED_PIN, blinkState ? HIGH : LOW);

  if (distance < 5.0f) {
    digitalWrite(LED_GREEN_PIN, blinkState ? HIGH : LOW);
    digitalWrite(LED_YELLOW_PIN, LOW);
    digitalWrite(LED_RED_PIN, LOW);
  } else if (distance < 8.0f) {
    digitalWrite(LED_GREEN_PIN, LOW);
    digitalWrite(LED_YELLOW_PIN, blinkState ? HIGH : LOW);
    digitalWrite(LED_RED_PIN, LOW);
  } else {
    digitalWrite(LED_GREEN_PIN, LOW);
    digitalWrite(LED_YELLOW_PIN, LOW);
    digitalWrite(LED_RED_PIN, blinkState ? HIGH : LOW);
  }
}

void playBeep(bool state, int frequency) {
  if (state) {
    if (USE_PASSIVE_BUZZER) tone(BUZZER_PIN, frequency);
    else digitalWrite(BUZZER_PIN, HIGH);
  } else {
    if (USE_PASSIVE_BUZZER) noTone(BUZZER_PIN);
    else digitalWrite(BUZZER_PIN, LOW);
  }
}

void triggerCrashSequence() {
  Serial.println(F("\\n💥💥💥 BOOOOOOM! CRASH IMPACT AT 10 CM! 💥💥💥\\n"));

  // Phase 1: Rapid Strobe Light & Siren Impact
  for (int i = 0; i < 15; i++) {
    digitalWrite(LED_GREEN_PIN, HIGH);
    digitalWrite(LED_YELLOW_PIN, HIGH);
    digitalWrite(LED_RED_PIN, HIGH);
    digitalWrite(ONBOARD_LED_PIN, HIGH);
    if (USE_PASSIVE_BUZZER) tone(BUZZER_PIN, 2000);
    else digitalWrite(BUZZER_PIN, HIGH);
    delay(25);

    digitalWrite(LED_GREEN_PIN, LOW);
    digitalWrite(LED_YELLOW_PIN, LOW);
    digitalWrite(LED_RED_PIN, LOW);
    digitalWrite(ONBOARD_LED_PIN, LOW);
    if (USE_PASSIVE_BUZZER) tone(BUZZER_PIN, 1200);
    else digitalWrite(BUZZER_PIN, LOW);
    delay(25);
  }

  // Phase 2: Engine Rumble Crunch
  if (USE_PASSIVE_BUZZER) {
    for (int freq = 1200; freq >= 180; freq -= 40) {
      tone(BUZZER_PIN, freq);
      digitalWrite(LED_RED_PIN, (freq % 80 == 0) ? HIGH : LOW);
      delay(20);
    }
    noTone(BUZZER_PIN);
  }

  // Phase 3: Hold Red crash light solid for 1 second of victory
  digitalWrite(LED_RED_PIN, HIGH);
  digitalWrite(ONBOARD_LED_PIN, HIGH);
  delay(800);

  digitalWrite(LED_RED_PIN, LOW);
  digitalWrite(ONBOARD_LED_PIN, LOW);
  if (USE_PASSIVE_BUZZER) noTone(BUZZER_PIN);
  else digitalWrite(BUZZER_PIN, LOW);

  hasCrashed = true;
  lastValidDistance = START_DISTANCE_CM;
  delay(400);
}

void printTelemetry(float distance, int beepInterval, float intensityPct) {
  Serial.print(F("Distance: "));
  Serial.print(distance, 1);
  Serial.print(F(" cm | Speed: "));
  Serial.print(beepInterval);
  Serial.print(F("ms | ["));

  int bars = (int)(intensityPct / 10.0f);
  if (bars > 10) bars = 10;
  for (int i = 0; i < 10; i++) {
    if (i < bars) Serial.print(F("="));
    else if (i == bars) Serial.print(F("🚛"));
    else Serial.print(F(" "));
  }
  Serial.print(F("] 🚗💥 "));
  Serial.print((int)intensityPct);
  Serial.println(F("%"));
}`;

export const PLATFORMIO_INI_CONTENT = `; ==============================================================================
; PlatformIO Project Configuration File
; Project: 01_monster_truck_crash
; Target: Arduino Uno / Arduino Nano (ATmega328P)
; Description: Ultrasonic Monster Truck Crash Intensity Sensor with Buzzer & LEDs
; ==============================================================================

[platformio]
default_envs = uno
description = Monster Truck Crash Sensor: Buzzer and LEDs speed up as truck drives away toward the crash pile at 10cm!

[env:uno]
platform = atmelavr
board = uno
framework = arduino
monitor_speed = 115200
monitor_filters = time, colorize

[env:nano]
platform = atmelavr
board = nanoatmega328new
framework = arduino
monitor_speed = 115200
monitor_filters = time, colorize

[env:nano_old_bootloader]
platform = atmelavr
board = nanoatmega328
framework = arduino
monitor_speed = 115200
monitor_filters = time, colorize`;

export const SUNFOUNDER_ORIGINAL_CONTENT = `/**
 * Original SunFounder Parking Sensor (Reference Source)
 * Source URL: https://www.sunfounder.com/pages/arduino-parking-sensor-with-ultrasonic-sensor-v5
 *
 * In the standard parking sensor concept:
 * CLOSER = FASTER BEEPS (Obstacle approaching bumper)
 */

#include <Arduino.h>

const int trigPin = 9;
const int echoPin = 10;
const int buzzerPin = 3;
const int ledPin = 6;

long duration;
float distance;

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(buzzerPin, OUTPUT);
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  duration = pulseIn(echoPin, HIGH, 30000);
  distance = (duration * 0.034) / 2.0;

  if (distance > 0 && distance <= 10) {
    digitalWrite(ledPin, HIGH);
    digitalWrite(buzzerPin, HIGH);
    delay(50);
    digitalWrite(ledPin, LOW);
    digitalWrite(buzzerPin, LOW);
    delay(50);
  } else if (distance > 10 && distance <= 20) {
    digitalWrite(ledPin, HIGH);
    digitalWrite(buzzerPin, HIGH);
    delay(100);
    digitalWrite(ledPin, LOW);
    digitalWrite(buzzerPin, LOW);
    delay(150);
  } else if (distance > 20 && distance <= 35) {
    digitalWrite(ledPin, HIGH);
    digitalWrite(buzzerPin, HIGH);
    delay(150);
    digitalWrite(ledPin, LOW);
    digitalWrite(buzzerPin, LOW);
    delay(350);
  } else {
    digitalWrite(ledPin, LOW);
    digitalWrite(buzzerPin, LOW);
    delay(500);
  }
}`;

export const PROJECTS_LIST: ArduinoProject[] = [
  {
    id: '01_monster_truck_crash',
    number: '01',
    title: 'Monster Truck Crash Detector',
    folderName: '01_monster_truck_crash',
    tagline: 'HC-SR04 proximity intensity buzzer & crash alert at 10cm',
    difficulty: 'Beginner',
    sensorUsed: 'HC-SR04 Ultrasonic Distance Sensor',
    status: 'Ready to Flash',
    basedOnUrl: 'https://www.sunfounder.com/pages/arduino-parking-sensor-with-ultrasonic-sensor-v5',
    description:
      'Inverts the traditional parking sensor logic. As the monster truck rolls away from the starting block toward the pile of cars, the buzzer buzzes faster and the LEDs escalate in urgency until impacting at 10cm with a full crash strobe alarm!',
    files: [
      {
        name: 'main.cpp',
        path: 'src/main.cpp',
        language: 'cpp',
        description: 'Main Arduino C++ sketch with non-blocking timing, pitch scaling, and crash sequence.',
        content: MAIN_CPP_CONTENT
      },
      {
        name: 'platformio.ini',
        path: 'platformio.ini',
        language: 'ini',
        description: 'PlatformIO configuration for Arduino Uno and Arduino Nano boards.',
        content: PLATFORMIO_INI_CONTENT
      },
      {
        name: 'original_sunfounder_parking_sensor.ino',
        path: 'docs/original_sunfounder_parking_sensor.ino',
        language: 'cpp',
        description: 'Original extracted SunFounder Parking Sensor reference code for comparison.',
        content: SUNFOUNDER_ORIGINAL_CONTENT
      }
    ]
  },
  {
    id: '02_upcoming_toy_project',
    number: '02',
    title: 'Next Toy / Game Project',
    folderName: '02_kids_game_toy',
    tagline: 'Ready for your next kid toy idea (Laser tripwire, Reflex timer, etc.)',
    difficulty: 'Fun for All',
    sensorUsed: 'Selectable',
    status: 'Planned',
    description:
      'Reserved slot for your subsequent Arduino toy requests in this series.',
    files: []
  }
];
