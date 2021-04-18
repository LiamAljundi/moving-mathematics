const serviceUuid = "555a0002-0000-467a-9538-01f0652c74e8";
const characteristicsUUID = {
  prox: "555a0002-0017-467a-9538-01f0652c74e8",
  gyro: "555a0002-0012-467a-9538-01f0652c74e8",
  acce: "555a0002-0011-467a-9538-01f0652c74e8",
  rgba: "555a0002-0018-467a-9538-01f0652c74e8",
};

let myBLE;

let gyroCharacteristic;
let acceCharacteristic;

let proxCharacteristic;
let rgbaCharacteristic;

let gyroValue = new Array(3);
let acceValue = new Array(3);
let proxValue = 0;
let rgbaValue = new Array(4);

let sensorArray = new Array(11);

let cnv;
let screenWidth;
let screenHeight;
let controlMenuWidth = 25 / 100;

let shapes;
let selected3D = "box";
let shapeSelection = document.querySelector("#dropdown-3d");

let xRotationSelection = document.querySelector("#dropdown-xRotation");
let yRotationSelection = document.querySelector("#dropdown-yRotation");
let zRotationSelection = document.querySelector("#dropdown-zRotation");

let xStretchSelection = document.querySelector("#dropdown-xStretch");
let yStretchSelection = document.querySelector("#dropdown-yStretch");
let zStretchSelection = document.querySelector("#dropdown-zStretch");

let xTranslationSelection = document.querySelector("#dropdown-xTranslation");
let yTranslationSelection = document.querySelector("#dropdown-yTranslation");
let zTranslationSelection = document.querySelector("#dropdown-zTranslation");

let xRotationIndex;
let yRotationIndex;
let zRotationIndex;

let xStretchIndex;
let yStretchIndex;
let zStretchIndex;

let xTranslationIndex;
let yTranslationIndex;
let zTranslationIndex;


shapeSelection.addEventListener("change", () => {
  selected3D = shapeSelection.options[shapeSelection.selectedIndex].value;
});
xRotationSelection.addEventListener("change", () => {
  xRotationIndex =
    xRotationSelection.options[xRotationSelection.selectedIndex].value;
});
yRotationSelection.addEventListener("change", () => {
  yRotationIndex =
    yRotationSelection.options[yRotationSelection.selectedIndex].value;
});
zRotationSelection.addEventListener("change", () => {
  zRotationIndex =
    zRotationSelection.options[zRotationSelection.selectedIndex].value;
});
xStretchSelection.addEventListener("change", () => {
  xStretchIndex = xStretchSelection.options[xStretchSelection.selectedIndex].value;
});
yStretchSelection.addEventListener("change", () => {
  yStretchIndex = yStretchSelection.options[yStretchSelection.selectedIndex].value;
});
zStretchSelection.addEventListener("change", () => {
  zStretchIndex = zStretchSelection.options[zStretchSelection.selectedIndex].value;
});
xTranslationSelection.addEventListener("change", () => {
  xTranslationIndex = xTranslationSelection.options[xTranslationSelection.selectedIndex].value;
});
yTranslationSelection.addEventListener("change", () => {
  yTranslationIndex = yTranslationSelection.options[yTranslationSelection.selectedIndex].value;
});
zTranslationSelection.addEventListener("change", () => {
  zTranslationIndex = zTranslationSelection.options[zTranslationSelection.selectedIndex].value;
});

function handleCanvas() {
  let controlMenuSize = windowWidth * controlMenuWidth;
  cnv = createCanvas(windowWidth - controlMenuSize, windowHeight, WEBGL);
  cnv.position(controlMenuSize, 0);

  screenHeight= windowHeight;
  screenWidth= windowWidth;
}

function setup() {
  // Create a p5ble class
  myBLE = new p5ble();

  handleCanvas();
  shapes = new Shapes();

  background("#ffff");

}

function draw() {
  background(255);
  normalMaterial();

  push();

  translateShape();
  rotateShape();
  stretchShape();
  shapes.draw3D();

  pop();
}

function windowResized() {
  handleCanvas();
}

function connectAndStartNotify() {
  // Connect to a device by passing the service UUID
  myBLE.connect(serviceUuid, gotCharacteristics);
}

// A function that will be called once got characteristics
function gotCharacteristics(error, characteristics) {
  if (error) console.log("error: ", error);
  console.log(characteristics[1].uuid);
  for (let i = 0; i < characteristics.length; i++) {
    if (characteristics[i].uuid == characteristicsUUID.prox) {
      proxCharacteristic = characteristics[i];
      myBLE.startNotifications(proxCharacteristic, handleProx);
    } else if (characteristics[i].uuid == characteristicsUUID.gyro) {
      gyroCharacteristic = characteristics[i];
      myBLE.startNotifications(gyroCharacteristic, handleGyro, "string");
    } else if (characteristics[i].uuid == characteristicsUUID.acce) {
      acceCharacteristic = characteristics[i];
      myBLE.startNotifications(acceCharacteristic, handleAcce, "string");
    } else if (characteristics[i].uuid == characteristicsUUID.rgba) {
      rgbaCharacteristic = characteristics[i];
      myBLE.startNotifications(rgbaCharacteristic, handleRgba, "string");
    } else {
      console.log("nothing");
    }
  }
  // Start notifications on the first characteristic by passing the characteristic
  // And a callback function to handle notifications
}

function handleGyro(data) {
  //console.log("GYRO: "+abs(gyroValue[0])+ " | "+ abs(gyroValue[1])+" | "+ abs(gyroValue[2]));
  gyroValue = data.split("|");
  sensorArray[0] = gyroValue[0];
  sensorArray[1] = gyroValue[1];
  sensorArray[2] = gyroValue[2];
}

function handleAcce(data) {
  //console.log("ACCE: "+acceValue[0]+ " | "+ acceValue[1]+" | "+ acceValue[2]);
  acceValue = data.split("|");
  sensorArray[3] = acceValue[0];
  sensorArray[4] = acceValue[1];
  sensorArray[5] = acceValue[2];
}

function handleProx(data) {
  //console.log('Prox: ', data);
  proxValue = Number(data);
  sensorArray[6] = proxValue;
}

function handleRgba(data) {
  //console.log("color: "+rgbaValue[0]+ " | "+ rgbaValue[1]+" | "+ rgbaValue[2]+" | "+ rgbaValue[3]);
  rgbaValue = data.split("|");
  sensorArray[7] = rgbaValue[0];
  sensorArray[8] = rgbaValue[1];
  sensorArray[9] = rgbaValue[2];
  sensorArray[10] = rgbaValue[3];
}

function mapMyData(selectedIndex, sensorData, defaultValue, min, max) {
  let mappedData;

  if (selectedIndex == "0" || selectedIndex == "1" || selectedIndex == "2") {
    mappedData = map(sensorData, -2000, 2000, min, max);
  } else if (
    selectedIndex == "3" ||
    selectedIndex == "4" ||
    selectedIndex == "5"
  ) {
    mappedData = map(sensorData, -4, 4, min, max);
  } else if (selectedIndex == "6") {
    mappedData = map(sensorData, 0, 255, min, max);
  } else if (selectedIndex == "10") {
    mappedData = map(sensorData, 0, 4097, min, max);
  } else {
    mappedData = defaultValue;
  }
  return mappedData;
}

class Shapes{
  constructor(){
    this.defaultSize = 100;

  }

  draw3D(){

    if (selected3D === "box") {
      box(this.defaultSize);
    } else if (selected3D === "plane") {
      plane(this.defaultSize);
    } else if (selected3D === "sphere") {
      sphere(this.defaultSize);
    } else if (selected3D === "cone") {
      cone(this.defaultSize, this.defaultSize);
    } else if (selected3D === "cylinder") {
      cylinder(this.defaultSize, this.defaultSize);
    } else if (selected3D === "torus") {
      torus(this.defaultSize, this.defaultSize / 4);
    }

  }
}

function translateShape() {

  let defaultTranslation= 0;
  
    if (myBLE.isConnected()) {
      let xTranslation = sensorArray[xTranslationIndex];
      let yTranslation = sensorArray[yTranslationIndex];
      let zTranslation = sensorArray[zTranslationIndex];
  
  
      let mappedXtranslation = mapMyData(xTranslationIndex, xTranslation, defaultTranslation, -((screenWidth/2)+controlMenuWidth) , (screenWidth/2));
      let mappedYtranslation = mapMyData(yTranslationIndex, yTranslation, defaultTranslation, -(screenHeight/2) , (screenHeight/2));
      let mappedZtranslation = mapMyData(zTranslationIndex, zTranslation, defaultTranslation, - (screenWidth*2), screenWidth*0.5);
  
      translate(mappedXtranslation ,mappedYtranslation, mappedZtranslation);
  
    } 
  }

function stretchShape() {

let defaultStretch= 1;

  if (myBLE.isConnected()) {
    let xStretch = sensorArray[xStretchIndex];
    let yStretch = sensorArray[yStretchIndex];
    let zStretch = sensorArray[zStretchIndex];


    let mappedXstretch = mapMyData(xStretchIndex, xStretch, defaultStretch, 0.4, 5);
    let mappedYstretch = mapMyData(yStretchIndex, yStretch, defaultStretch, 0.4, 5);
    let mappedZstretch = mapMyData(zStretchIndex, zStretch, defaultStretch, 0.4, 5);

    scale(mappedXstretch ,mappedYstretch, mappedZstretch);

  } 
}

function rotateShape() {

  let defaultRotation = (frameCount * 0.01);

  if (myBLE.isConnected()) {
    let xRotation = sensorArray[xRotationIndex];
    let yRotation = sensorArray[yRotationIndex];
    let zRotation = sensorArray[zRotationIndex];

    let mappedXrotation = mapMyData(xRotationIndex, xRotation, defaultRotation, 0, (2*PI));
    let mappedYrotation = mapMyData(yRotationIndex, yRotation, defaultRotation, 0, (2*PI));
    let mappedZrotation = mapMyData(zRotationIndex, zRotation, defaultRotation, 0, (2*PI));

    rotateX(mappedXrotation);
    rotateY(mappedYrotation);
    rotateZ(mappedZrotation);


  }else{

      rotateX(defaultRotation);
      rotateY(defaultRotation);
      rotateZ(defaultRotation);  

  }


}
