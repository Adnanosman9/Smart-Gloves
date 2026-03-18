#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <ArduinoJson.h>

#define thumbPin  0
#define indexPin  1
#define middlePin 2
#define ringPin   3
#define pinkyPin  4
#define i2cSda    6
#define i2cScl    7

#define serviceId  "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define charId     "beb5483e-36e1-4688-b7f5-ea07361b26a8"
#define gloveName  "SIGNO-L"

const int openVals[5]   = {400, 400, 400, 400, 400};
const int closedVals[5] = {900, 900, 900, 900, 900};

BLEServer*         server = nullptr;
BLECharacteristic* characteristic = nullptr;
bool isConnected  = false;
bool wasConnected = false;

Adafruit_MPU6050 mpu;

#define smooth 4
int buf[5][smooth];
int idx = 0;

class BleCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer*)    override { isConnected = true; }
  void onDisconnect(BLEServer*) override { isConnected = false; }
};

float getFlex(int pin, int slot) {
  buf[slot][idx % smooth] = analogRead(pin);
  long sum = 0;
  for (int i = 0; i < smooth; i++) sum += buf[slot][i];
  float v = (float)(sum / smooth - openVals[slot]) / (float)(closedVals[slot] - openVals[slot]);
  return constrain(v, 0.0f, 1.0f);
}

void setup() {
  analogReadResolution(12);
  analogSetAttenuation(ADC_11db);
  memset(buf, 0, sizeof(buf));
  Wire.begin(i2cSda, i2cScl);
  mpu.begin();
  mpu.setAccelerometerRange(MPU6050_RANGE_2_G);
  mpu.setGyroRange(MPU6050_RANGE_250_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);

  BLEDevice::init(gloveName);
  server = BLEDevice::createServer();
  server->setCallbacks(new BleCallbacks());
  BLEService* svc = server->createService(serviceId);
  characteristic = svc->createCharacteristic(charId,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY);
  characteristic->addDescriptor(new BLE2902());
  svc->start();
  BLEAdvertising* adv = BLEDevice::getAdvertising();
  adv->addServiceUUID(serviceId);
  adv->setScanResponse(true);
  adv->setMinPreferred(0x06);
  BLEDevice::startAdvertising();
}

unsigned long lastTime = 0;
const int pace = 50;

void loop() {
  if (!isConnected && wasConnected) { delay(500); server->startAdvertising(); wasConnected = false; }
  if (isConnected && !wasConnected)  wasConnected = true;

  if (isConnected && millis() - lastTime >= pace) {
    lastTime = millis();
    idx++;

    float flex[5] = {
      getFlex(thumbPin,0), getFlex(indexPin,1), getFlex(middlePin,2),
      getFlex(ringPin,3),  getFlex(pinkyPin,4)
    };
    sensors_event_t a, g, temp;
    mpu.getEvent(&a, &g, &temp);

    StaticJsonDocument<200> doc;
    doc["h"] = "L";
    JsonArray f = doc.createNestedArray("f");
    for (int i = 0; i < 5; i++) f.add(round(flex[i] * 1000) / 1000.0);
    JsonArray aArr = doc.createNestedArray("a");
    aArr.add(round(a.acceleration.x / 9.81f * 1000) / 1000.0);
    aArr.add(round(a.acceleration.y / 9.81f * 1000) / 1000.0);
    aArr.add(round(a.acceleration.z / 9.81f * 1000) / 1000.0);
    JsonArray gArr = doc.createNestedArray("g");
    gArr.add(round(g.gyro.x * 1000) / 1000.0);
    gArr.add(round(g.gyro.y * 1000) / 1000.0);
    gArr.add(round(g.gyro.z * 1000) / 1000.0);
    doc["t"] = millis();

    char out[200];
    serializeJson(doc, out);
    characteristic->setValue(out);
    characteristic->notify();
  }
}
