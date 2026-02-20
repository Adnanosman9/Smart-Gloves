#include <Wire.h>
#include <MPU6050.h>

#define FLEX_1 5
#define FLEX_2 4
#define FLEX_3 3
#define FLEX_4 2
#define FLEX_5 1
#define SDA_PIN 8
#define SCL_PIN 9

int16_t ax, ay, az;
int16_t gx, gy, gz;

int thumb, index, middle, ring, pinky;

void setup() {
  Serial.begin(115200);

  pinMode(FLEX_1, INPUT);
  pinMode(FLEX_2, INPUT);
  pinMode(FLEX_3, INPUT);
  pinMode(FLEX_4, INPUT);
  pinMode(FLEX_5, INPUT);

  analogReadResolution(12);
  analogSetAttenuation(ADC_11db);

  Wire.begin(SDA_PIN, SCL_PIN);
  mpu.initialize();
  
  delay(100);
  
  Serial.println("Thumb,Index,Middle,Ring,Pinky,Ax,Ay,Az,Gx,Gy,Gz");
}

void loop() {
  thumb = analogRead(FLEX_1);
  index = analogRead(FLEX_2);
  middle = analogRead(FLEX_3);
  ring = analogRead(FLEX_4);
  pinky = analogRead(FLEX_5);

  mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);

  //Printing DAta in CSV Format
  Serial.print(thumb);  Serial.print(",");
  Serial.print(index);  Serial.print(",");
  Serial.print(middle); Serial.print(",");
  Serial.print(ring);   Serial.print(",");
  Serial.print(pinky);  Serial.print(",");
  Serial.print(ax); Serial.print(",");
  Serial.print(ay); Serial.print(",");
  Serial.print(az); Serial.print(",");
  Serial.print(gx); Serial.print(",");
  Serial.print(gy); Serial.print(",");
  Serial.println(gz); 

  delay(50); 
}