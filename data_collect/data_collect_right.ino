#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

#define thumbPin  0
#define indexPin  1
#define middlePin 2
#define ringPin   3
#define pinkyPin  4
#define i2cSda    6
#define i2cScl    7

const int openVals[5]   = {400, 400, 400, 400, 400};
const int closedVals[5] = {900, 900, 900, 900, 900};

Adafruit_MPU6050 mpu;

const int count = 30;
const int pace  = 50;

float getFlex(int pin, int slot) {
  return constrain(
    (float)(analogRead(pin) - openVals[slot]) / (float)(closedVals[slot] - openVals[slot]),
    0.0f, 1.0f
  );
}

void setup() {
  Serial.begin(115200);
  analogReadResolution(12);
  analogSetAttenuation(ADC_11db);
  Wire.begin(i2cSda, i2cScl);
  mpu.begin();
  mpu.setAccelerometerRange(MPU6050_RANGE_2_G);
  mpu.setGyroRange(MPU6050_RANGE_250_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
  Serial.println("label,thumb,index,middle,ring,pinky,ax,ay,az,gx,gy,gz,timestamp");
}

void loop() {
  if (!Serial.available()) return;
  String label = Serial.readStringUntil('\n');
  label.trim();
  if (!label.length()) return;

  delay(500);
  for (int s = 0; s < count; s++) {
    sensors_event_t a, g, temp;
    mpu.getEvent(&a, &g, &temp);
    Serial.printf("%s,%.3f,%.3f,%.3f,%.3f,%.3f,%.3f,%.3f,%.3f,%.3f,%.3f,%.3f,%lu\n",
      label.c_str(),
      getFlex(thumbPin,0), getFlex(indexPin,1), getFlex(middlePin,2),
      getFlex(ringPin,3),  getFlex(pinkyPin,4),
      a.acceleration.x/9.81f, a.acceleration.y/9.81f, a.acceleration.z/9.81f,
      g.gyro.x, g.gyro.y, g.gyro.z,
      millis());
    delay(pace);
  }
}
