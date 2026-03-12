#include <Arduino.h>

const int pins[5]    = {0, 1, 2, 3, 4};
const char* names[5] = {"THUMB", "INDEX", "MIDDLE", "RING", "PINKY"};

int openVals[5]   = {4095, 4095, 4095, 4095, 4095};
int closedVals[5] = {0, 0, 0, 0, 0};

void setup() {
  Serial.begin(115200);
  analogReadResolution(12);
  analogSetAttenuation(ADC_11db);

  Serial.println("Hold ALL fingers OPEN...");
  int tmp[5] = {0};
  for (int t = 0; t < 100; t++) {
    for (int i = 0; i < 5; i++) tmp[i] += analogRead(pins[i]);
    delay(50);
  }
  for (int i = 0; i < 5; i++) {
    openVals[i] = tmp[i] / 100;
    Serial.printf("  %s: %d\n", names[i], openVals[i]);
  }

  Serial.println("Now CLOSE all fingers...");
  delay(3000);

  int tmp2[5] = {0};
  for (int t = 0; t < 100; t++) {
    for (int i = 0; i < 5; i++) tmp2[i] += analogRead(pins[i]);
    delay(50);
  }
  for (int i = 0; i < 5; i++) {
    closedVals[i] = tmp2[i] / 100;
    Serial.printf("  %s: %d\n", names[i], closedVals[i]);
  }

  Serial.print("const int openVals[5] = {");
  for (int i = 0; i < 5; i++) { Serial.print(openVals[i]); if (i < 4) Serial.print(", "); }
  Serial.println("};");
  Serial.print("const int closedVals[5] = {");
  for (int i = 0; i < 5; i++) { Serial.print(closedVals[i]); if (i < 4) Serial.print(", "); }
  Serial.println("};");
}

void loop() {
  for (int i = 0; i < 5; i++) {
    float v = (float)(analogRead(pins[i]) - openVals[i]) / (float)(closedVals[i] - openVals[i]);
    Serial.printf("%s:%.2f  ", names[i], constrain(v, 0.0f, 1.0f));
  }
  Serial.println();
  delay(200);
}

