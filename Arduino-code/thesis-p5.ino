#include "LowPower.h"
#include <arm_math.h>

#include <Arduino_APDS9960.h>
#include <Arduino_HTS221.h>
#include <Arduino_LPS22HB.h>
#include <Arduino_LSM9DS1.h>
#include <PDM.h>

#include <ArduinoBLE.h>

const int VERSION = 0x00000001;
const String groupNumber = "03"; 

#define SCIENCE_KIT_UUID(val) ("555a0002-" val "-467a-9538-01f0652c74e8")
#define RESISTANCE_PIN A0
#define VOLTAGE_BUFFER_SIZE 16

//#define DEBUG 0

BLEService                     service                    (SCIENCE_KIT_UUID("0000"));
BLEUnsignedIntCharacteristic   versionCharacteristic      (SCIENCE_KIT_UUID("0001"), BLERead);

BLEStringCharacteristic        accelerationCharacteristic (SCIENCE_KIT_UUID("0011"), BLENotify, 50);
BLEStringCharacteristic        gyroscopeCharacteristic    (SCIENCE_KIT_UUID("0012"), BLENotify, 50);
BLEUnsignedIntCharacteristic   proximityCharacteristic    (SCIENCE_KIT_UUID("0017"), BLENotify);
BLEStringCharacteristic        colorCharacteristic        (SCIENCE_KIT_UUID("0018"), BLENotify, 80);




void onPDMdata() {
  // query the number of bytes available
  int bytesAvailable = PDM.available();
}




// String to calculate the local and device name
String name;
unsigned long lastNotify = 0;

void printSerialMsg(const char * msg) {
  #ifdef DEBUG
  if (Serial) {
    Serial.println(msg);
  }
  #endif
}

void blinkLoop() {
  while (1) {
    digitalWrite(LED_BUILTIN, HIGH);
    delay(500);
    digitalWrite(LED_BUILTIN, LOW);
    delay(500);
  }
}

void setup() {
  
  #ifdef DEBUG
  Serial.begin(9600);
  while (!Serial);
  Serial.println("Started");
  #endif

  delay(2000);

  pinMode(RESISTANCE_PIN, INPUT); // Used for reading resistance

  if (!APDS.begin()) {
    printSerialMsg("Failed to initialized APDS!");
    blinkLoop();
  }

  if (!HTS.begin()) {
    printSerialMsg("Failed to initialized HTS!");
    blinkLoop();
  }

  if (!BARO.begin()) {
    printSerialMsg("Failed to initialized BARO!");
    blinkLoop();
  }

  if (!IMU.begin()) {
    printSerialMsg("Failed to initialized IMU!");
    blinkLoop();
  }

  PDM.onReceive(onPDMdata);
  if (!PDM.begin(1, 16000)) {
    printSerialMsg("Failed to start PDM!");
    blinkLoop();
  }

  if (!BLE.begin()) {
    printSerialMsg("Failed to initialized BLE!");
    blinkLoop();
  }

  String address = BLE.address();
  #ifdef DEBUG
  if (Serial) {
    Serial.print("address = ");
    Serial.println(address);
  }
  
  #endif
  
  address.toUpperCase();

  name = "Group - " + groupNumber;


  #ifdef DEBUG
  if (Serial) {
    Serial.print("name = ");
    Serial.println(name);
    
  }
  #endif


  BLE.setLocalName(name.c_str());
  BLE.setDeviceName(name.c_str());
  BLE.setAdvertisedService(service);

  service.addCharacteristic(versionCharacteristic);
  service.addCharacteristic(accelerationCharacteristic);
  service.addCharacteristic(gyroscopeCharacteristic);
  service.addCharacteristic(proximityCharacteristic);
  service.addCharacteristic(colorCharacteristic);

  versionCharacteristic.setValue(VERSION);

  BLE.addService(service);
  BLE.advertise();

  lowPower();
}

void loop() {
  
  BLE.poll(1000);
  while (BLE.connected()) {
    lowPowerBleWait(100);
    updateSubscribedCharacteristics();
  }
  
}

void updateSubscribedCharacteristics() {

  
  if (accelerationCharacteristic.subscribed()) {
     float x, y, z;
     
    if (IMU.accelerationAvailable()) {
      IMU.readAcceleration(x, y, z);
      String accelerometerData = String(x)+"|"+String(y)+"|"+String(z);
      accelerationCharacteristic.writeValue(accelerometerData);      
    } 
  }


  
  if (gyroscopeCharacteristic.subscribed()) {
     float x, y, z;
     
    if (IMU.gyroscopeAvailable()) {
        IMU.readGyroscope(x, y, z);
       String gyroscopeData = String(x)+"|"+String(y)+"|"+String(z);
      gyroscopeCharacteristic.writeValue(gyroscopeData);
    } 
  }


  
  if (proximityCharacteristic.subscribed() && APDS.proximityAvailable()) {
    uint32_t proximity = APDS.readProximity();
    proximityCharacteristic.writeValue(proximity);
  }


  
  if (colorCharacteristic.subscribed()) {
    int r, g, b, a;
    
    if(APDS.colorAvailable()){
      APDS.readColor(r, g, b, a);
      String colorData = String(r)+"|"+String(g)+"|"+String(b)+"|"+String(a);
      colorCharacteristic.writeValue(colorData);
      }
  }



}
