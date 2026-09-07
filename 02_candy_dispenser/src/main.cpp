#include <Arduino.h>
#include <Servo.h>

// --- Pin Definitions ---
const int trigPin = 9;
const int echoPin = 10;
const int servoPin = 8;

// --- Configuration ---
const int thresholdDistance = 10; // Trigger distance in cm (hands within 10cm)
const int servoClosed = 0;        // Angle where the trapdoor is fully closed
const int servoOpen = 90;         // Angle where the trapdoor is pulled open

Servo trapdoorServo;

void setup() {
  // Initialize pins
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  
  // Initialize servo
  trapdoorServo.attach(servoPin);
  trapdoorServo.write(servoClosed); // Ensure the door starts closed
  
  // Start serial communication for debugging
  Serial.begin(9600);
  Serial.println("Dispenser Ready!");
}

void loop() {
  long duration;
  int distance;

  // 1. Send a 10-microsecond ping from the Ultrasonic Sensor
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  // 2. Read the time it takes for the ping to bounce back
  duration = pulseIn(echoPin, HIGH);

  // 3. Convert the time into distance (cm)
  // The speed of sound is 0.034 cm/microsecond
  distance = duration * 0.034 / 2;

  // Debugging output to your VS Code serial monitor
  Serial.print("Distance: ");
  Serial.println(distance);

  // 4. Dispense Logic
  // If an object is detected closer than the threshold distance (and ignore 0 readings)
  if (distance > 0 && distance <= thresholdDistance) {
    Serial.println("Hand detected! Dispensing...");
    
    trapdoorServo.write(servoOpen);   // Pull the trapdoor open
    delay(400);                       // Keep open for 0.4 seconds (adjust based on candy size!)
    trapdoorServo.write(servoClosed); // Push the trapdoor closed
    
    // Wait 3 seconds before allowing the next dispense to prevent a continuous flood
    delay(3000); 
  }

  // A tiny delay between standard pings keeps the sensor stable
  delay(50); 
}