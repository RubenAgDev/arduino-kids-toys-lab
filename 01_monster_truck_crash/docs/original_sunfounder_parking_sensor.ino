/**
 * ==============================================================================
 * Original SunFounder Parking Sensor (Reference Source)
 * Source URL: https://www.sunfounder.com/pages/arduino-parking-sensor-with-ultrasonic-sensor-v5
 * 
 * In this standard automotive parking assist concept:
 *   - The closer an obstacle is to the sensor (distance decreasing),
 *     the faster the buzzer beeps and the LED flashes.
 *   - Used for backing a car into a garage or parking space.
 * ==============================================================================
 */

#include <Arduino.h>

const int trigPin = 9;     // Ultrasonic sensor TRIG pin
const int echoPin = 10;    // Ultrasonic sensor ECHO pin
const int buzzerPin = 3;   // Buzzer pin
const int ledPin = 6;      // Warning LED pin

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
  // Clear trigPin
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);

  // Send 10us ultrasonic pulse
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  // Read the echo return time (microseconds)
  duration = pulseIn(echoPin, HIGH, 30000); // 30ms timeout (~5m max)

  // Calculate distance in centimeters (speed of sound = 0.034 cm/us)
  distance = (duration * 0.034) / 2.0;

  Serial.print("Parking Distance: ");
  Serial.print(distance);
  Serial.println(" cm");

  // Standard parking sensor logic:
  // CLOSER = FASTER BEEPS (Danger approaching wall)
  if (distance > 0 && distance <= 10) {
    // Very close: Continuous tone / rapid flash
    digitalWrite(ledPin, HIGH);
    digitalWrite(buzzerPin, HIGH);
    delay(50);
    digitalWrite(ledPin, LOW);
    digitalWrite(buzzerPin, LOW);
    delay(50);
  } else if (distance > 10 && distance <= 20) {
    // Close: Fast beeps
    digitalWrite(ledPin, HIGH);
    digitalWrite(buzzerPin, HIGH);
    delay(100);
    digitalWrite(ledPin, LOW);
    digitalWrite(buzzerPin, LOW);
    delay(150);
  } else if (distance > 20 && distance <= 35) {
    // Medium distance
    digitalWrite(ledPin, HIGH);
    digitalWrite(buzzerPin, HIGH);
    delay(150);
    digitalWrite(ledPin, LOW);
    digitalWrite(buzzerPin, LOW);
    delay(350);
  } else {
    // Safe distance: idle
    digitalWrite(ledPin, LOW);
    digitalWrite(buzzerPin, LOW);
    delay(500);
  }
}
