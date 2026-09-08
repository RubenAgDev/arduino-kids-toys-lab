/**
 * ==============================================================================
 * Project: Monster Truck Crash Detector (Arduino Kids Games & Toys)
 * Based on: SunFounder Ultrasonic Parking Sensor V5
 * 
 * CONCEPT & MODIFICATIONS:
 * In a traditional parking sensor, alerts get faster as an obstacle gets closer.
 * For this Monster Truck project, the setup is inverted for dramatic action:
 *   - The HC-SR04 ultrasonic sensor is placed at the starting gate/ramp.
 *   - The monster truck starts near the sensor (0-3 cm).
 *   - As the truck drives AWAY from the sensor toward the pile of cars, the
 *     measured distance increases.
 *   - The buzzer buzzes faster and the LEDs flash faster as distance INCREASES.
 *   - At 30 cm away (CRASH_DISTANCE_CM), the monster truck crashes into the
 *     cars! The system triggers 3 siren repeats, then leaves the LEDs ON solidly
 *     until the truck is returned to the start zone (0-3 cm).
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
// Start position near sensor (cm) - SILENT ZONE
const float START_DISTANCE_CM  = 3.0f;

// Crash impact point: Pile of cars is placed at this exact distance from the sensor!
const float CRASH_DISTANCE_CM  = 30.0f;

// Maximum distance before assuming the truck drove completely off the track
const float MAX_TRACK_DISTANCE = 60.0f;

// Set to true if using a PASSIVE buzzer (enables pitch shifting from 600Hz -> 1800Hz)
// Set to false if using a simple 5V ACTIVE buzzer (beeps on/off via HIGH/LOW)
const bool USE_PASSIVE_BUZZER  = true;

// ==============================================================================
// 3. GLOBAL VARIABLES & TIMING
// ==============================================================================
unsigned long lastBeepToggleTime = 0;
bool beepState = false;
bool hasCrashed = false;
unsigned long crashTriggerTime = 0;

// Filter buffer for ultrasonic readings
float lastValidDistance = 2.5f;

// ==============================================================================
// FUNCTION DECLARATIONS
// ==============================================================================
float measureDistance();
void updateLeds(float distance, bool blinkState);
void playBeep(bool state, int frequency);
void triggerCrashSequence();
void printTelemetry(float distance, int beepInterval, float intensityPct);

// ==============================================================================
// SETUP: Pin Modes and Serial Communication
// ==============================================================================
void setup() {
  // Configure Ultrasonic Sensor pins
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  // Configure Output indicators
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_GREEN_PIN, OUTPUT);
  pinMode(LED_YELLOW_PIN, OUTPUT);
  pinMode(LED_RED_PIN, OUTPUT);
  pinMode(ONBOARD_LED_PIN, OUTPUT);

  // Initial pin states (low)
  digitalWrite(TRIG_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(LED_GREEN_PIN, LOW);
  digitalWrite(LED_YELLOW_PIN, LOW);
  digitalWrite(LED_RED_PIN, LOW);
  digitalWrite(ONBOARD_LED_PIN, LOW);

  // Start Serial Monitor for debug and kids play telemetry
  Serial.begin(115200);
  delay(200);

  Serial.println(F("=================================================="));
  Serial.println(F("🏎️💨  MONSTER TRUCK CRASH ARENA SENSOR READY!   "));
  Serial.println(F("=================================================="));
  Serial.println(F("Place sensor behind the truck at start line (0-3cm)."));
  Serial.println(F("Pile of crushable cars target: 30 cm away."));
  Serial.println(F("Driving away will increase sound & light speed!"));
  Serial.println(F("--------------------------------------------------"));

  // Fun power-on chirp sequence
  for (int f = 600; f <= 1200; f += 200) {
    if (USE_PASSIVE_BUZZER) tone(BUZZER_PIN, f, 50);
    digitalWrite(ONBOARD_LED_PIN, HIGH);
    digitalWrite(LED_GREEN_PIN, HIGH);
    delay(60);
    digitalWrite(ONBOARD_LED_PIN, LOW);
    digitalWrite(LED_GREEN_PIN, LOW);
  }
}

// ==============================================================================
// MAIN LOOP
// ==============================================================================
void loop() {
  float currentDistance = measureDistance();

  // If distance measurement failed or out of range, hold previous distance
  if (currentDistance <= 0.0f || currentDistance > MAX_TRACK_DISTANCE) {
    currentDistance = lastValidDistance;
  } else {
    lastValidDistance = currentDistance;
  }

  // --------------------------------------------------------------------------
  // CASE 1: RESET / START ZONE (0 - 3 cm)
  // Silent ready state. Only moves past this when motion is detected > 3cm
  // --------------------------------------------------------------------------
  if (currentDistance <= START_DISTANCE_CM) {
    hasCrashed = false;
    digitalWrite(LED_GREEN_PIN, HIGH); // Solid green means ready
    digitalWrite(LED_YELLOW_PIN, LOW);
    digitalWrite(LED_RED_PIN, LOW);
    digitalWrite(ONBOARD_LED_PIN, LOW);
    playBeep(false, 0); // Ensure silence
    delay(50);
    return;
  }

  // --------------------------------------------------------------------------
  // CASE 2: POST-CRASH HOLD
  // --------------------------------------------------------------------------
  if (hasCrashed) {
    // LEDs stay ON solidly until the truck is returned to the 0-3cm start zone
    digitalWrite(LED_GREEN_PIN, HIGH);
    digitalWrite(LED_YELLOW_PIN, HIGH);
    digitalWrite(LED_RED_PIN, HIGH);
    digitalWrite(ONBOARD_LED_PIN, HIGH);
    playBeep(false, 0); // Ensure silence
    delay(50);
    return;
  }

  // --------------------------------------------------------------------------
  // CASE 3: TRUCK AT OR PAST THE CRASH POINT (30 cm)
  // --------------------------------------------------------------------------
  if (currentDistance >= CRASH_DISTANCE_CM) {
    // TRIGGER CRASH EXPLOSION!
    triggerCrashSequence();
    return;
  }

  // --------------------------------------------------------------------------
  // CASE 4: TRUCK APPROACHING THE CRASH POINT (3.1 cm -> 29.9 cm)
  // Distance is increasing away from sensor -> Frequency & flash rate INCREASES!
  // --------------------------------------------------------------------------
  // Calculate proximity intensity from 0.0 (start) to 1.0 (crash)
  float progress = (currentDistance - START_DISTANCE_CM) / (CRASH_DISTANCE_CM - START_DISTANCE_CM);
  if (progress < 0.0f) progress = 0.0f;
  if (progress > 0.99f) progress = 0.99f;

  // Beep interval: 600ms (slow) down to 40ms (ultra-fast near impact)
  int beepInterval = (int)(600.0f - (progress * 560.0f));
  if (beepInterval < 40) beepInterval = 40;

  // Buzzer pitch: 650 Hz (calm rumble) up to 1750 Hz (high alert scream)
  int beepPitch = (int)(650.0f + (progress * 1100.0f));

  // Non-blocking timer for blinking & beeping
  unsigned long now = millis();
  if (now - lastBeepToggleTime >= (unsigned long)beepInterval) {
    lastBeepToggleTime = now;
    beepState = !beepState;

    // Toggle buzzer and LEDs
    playBeep(beepState, beepPitch);
    updateLeds(currentDistance, beepState);
  }

  // Periodic telemetry readout to Serial Monitor (every 150ms)
  static unsigned long lastSerialTime = 0;
  if (millis() - lastSerialTime > 150) {
    lastSerialTime = millis();
    printTelemetry(currentDistance, beepInterval, progress * 100.0f);
  }

  delay(15); // Sensor recovery delay
}

// ==============================================================================
// MEASURE DISTANCE VIA HC-SR04 (cm)
// ==============================================================================
float measureDistance() {
  // Ensure trigger pin is low
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);

  // Send 10 microsecond HIGH pulse to initiate measurement
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  // Read echo pulse duration in microseconds (timeout 25ms ~ 4.2m)
  unsigned long duration = pulseIn(ECHO_PIN, HIGH, 25000);

  if (duration == 0) {
    return -1.0f; // Timeout or no echo
  }

  // Speed of sound = 343 m/s = 0.0343 cm/us
  // Distance = (Time * Speed) / 2 (round trip)
  float dist = (duration * 0.0343f) / 2.0f;
  return dist;
}

// ==============================================================================
// LED STATUS CONTROLLER
// ==============================================================================
void updateLeds(float distance, bool blinkState) {
  // Always mirror blink state to onboard Arduino pin 13
  digitalWrite(ONBOARD_LED_PIN, blinkState ? HIGH : LOW);

  // Adjusting zones for the new 30cm track
  if (distance < 12.0f) {
    // ZONE 1: Green Zone (Safe, near sensor / starting line)
    digitalWrite(LED_GREEN_PIN, blinkState ? HIGH : LOW);
    digitalWrite(LED_YELLOW_PIN, LOW);
    digitalWrite(LED_RED_PIN, LOW);
  } else if (distance < 22.0f) {
    // ZONE 2: Yellow Zone (Approaching danger, speeding up)
    digitalWrite(LED_GREEN_PIN, LOW);
    digitalWrite(LED_YELLOW_PIN, blinkState ? HIGH : LOW);
    digitalWrite(LED_RED_PIN, LOW);
  } else {
    // ZONE 3: Red Zone (Imminent crash, 22.0cm -> 30.0cm)
    digitalWrite(LED_GREEN_PIN, LOW);
    digitalWrite(LED_YELLOW_PIN, LOW);
    digitalWrite(LED_RED_PIN, blinkState ? HIGH : LOW);
  }
}

// ==============================================================================
// BUZZER CONTROLLER
// ==============================================================================
void playBeep(bool state, int frequency) {
  if (state) {
    if (USE_PASSIVE_BUZZER) {
      tone(BUZZER_PIN, frequency);
    } else {
      digitalWrite(BUZZER_PIN, HIGH);
    }
  } else {
    if (USE_PASSIVE_BUZZER) {
      noTone(BUZZER_PIN);
    } else {
      digitalWrite(BUZZER_PIN, LOW);
    }
  }
}

// ==============================================================================
// CRASH SEQUENCE: 3 Blasts, then LEDs hold solid ON
// ==============================================================================
void triggerCrashSequence() {
  Serial.println(F("\n========================================================"));
  Serial.println(F("💥💥💥 BOOOOOOM! CRASH IMPACT AT 30 CM! 💥💥💥"));
  Serial.println(F("   MONSTER TRUCK TOTALLY SMASHED THE PILE OF CARS!     "));
  Serial.println(F("========================================================\n"));

  // Phase 1: Sound repeats exactly 3 times!
  for (int i = 0; i < 3; i++) {
    // Blast ON
    digitalWrite(LED_GREEN_PIN, HIGH);
    digitalWrite(LED_YELLOW_PIN, HIGH);
    digitalWrite(LED_RED_PIN, HIGH);
    digitalWrite(ONBOARD_LED_PIN, HIGH);
    if (USE_PASSIVE_BUZZER) tone(BUZZER_PIN, 2000);
    else digitalWrite(BUZZER_PIN, HIGH);
    delay(300);

    // Blast OFF
    digitalWrite(LED_GREEN_PIN, LOW);
    digitalWrite(LED_YELLOW_PIN, LOW);
    digitalWrite(LED_RED_PIN, LOW);
    digitalWrite(ONBOARD_LED_PIN, LOW);
    if (USE_PASSIVE_BUZZER) tone(BUZZER_PIN, 1200);
    else digitalWrite(BUZZER_PIN, LOW);
    delay(300);
  }

  // Phase 2: Silence the buzzer permanently after 3 blasts
  if (USE_PASSIVE_BUZZER) noTone(BUZZER_PIN);
  else digitalWrite(BUZZER_PIN, LOW);

  // Phase 3: LEDs stay ON solidly until the truck is returned to 0-3cm
  digitalWrite(LED_GREEN_PIN, HIGH);
  digitalWrite(LED_YELLOW_PIN, HIGH);
  digitalWrite(LED_RED_PIN, HIGH);
  digitalWrite(ONBOARD_LED_PIN, HIGH);

  // Set crash flag so main loop holds this state
  hasCrashed = true;
}

// ==============================================================================
// TELEMETRY: ASCII Arena Visualizer for Serial Monitor
// ==============================================================================
void printTelemetry(float distance, int beepInterval, float intensityPct) {
  Serial.print(F("Distance: "));
  if (distance < 10.0f) Serial.print(F(" "));
  Serial.print(distance, 1);
  Serial.print(F(" cm | Speed: "));
  Serial.print(beepInterval);
  Serial.print(F("ms | Intensity: ["));

  // 10-step progress bar
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
}
