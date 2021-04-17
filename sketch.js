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

let gyroValue = [0, 0, 0];
let acceValue = [0, 0, 0];
let proxValue = 0;
let rgbaValue = [0, 0, 0, 0];

let sensorArray = new Array(11);

let cnv;
let controlMenuWidth = 25 / 100;

let selected3D = "box";
let shapeSelection = document.querySelector("#dropdown-3d");

let xRotationSelection = document.querySelector("#dropdown-xRotation");
let yRotationSelection = document.querySelector("#dropdown-yRotation");
let zRotationSelection = document.querySelector("#dropdown-zRotation");

let radiusSelection = document.querySelector("#dropdown-radius");
let heightSelection = document.querySelector("#dropdown-height");

let xRotationValue = "default";
let yRotationValue = "default";
let zRotationValue = "default";

let radiusValue ;
let heightValue ;

let shapes3D;

shapeSelection.addEventListener("change", () => {
  selected3D = shapeSelection.options[shapeSelection.selectedIndex].value;
});
xRotationSelection.addEventListener("change", () => {
  xRotationValue =
    xRotationSelection.options[xRotationSelection.selectedIndex].value;
});
yRotationSelection.addEventListener("change", () => {
  yRotationValue =
    yRotationSelection.options[yRotationSelection.selectedIndex].value;
});
zRotationSelection.addEventListener("change", () => {
  zRotationValue =
    zRotationSelection.options[zRotationSelection.selectedIndex].value;
});
radiusSelection.addEventListener("change", () => {
  radiusValue = radiusSelection.options[radiusSelection.selectedIndex].value;
});
heightSelection.addEventListener("change", () => {
  heightValue = heightSelection.options[heightSelection.selectedIndex].value;
});

function handleCanvas() {
  let controlMenuSize = windowWidth * controlMenuWidth;
  cnv = createCanvas(windowWidth - controlMenuSize, windowHeight, WEBGL);
  cnv.position(controlMenuSize, 0);
}

function setup() {
  // Create a p5ble class
  myBLE = new p5ble();

  handleCanvas();

  background("#FFF");

  /*   // Create a 'Connect and Start Notifications' button
  const connectButton = createButton("CONNECT");
  connectButton.mousePressed(connectAndStartNotify); */
}

function draw() {
  background(250);
  normalMaterial();

  push();

  rotateShape();
  selectShape();

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
  sensorArray[0] = acceValue[0];
  sensorArray[1] = acceValue[1];
  sensorArray[2] = acceValue[2];
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


function selectShape() {
  let mappedRadiusValue;
  let defaultRadius=100;
  let defaultHeight= 100;

  if (myBLE.isConnected()) {
    let radius = sensorArray[radiusValue];
    let height = sensorArray[heightValue];

    if (radiusValue == "0" || radiusValue == "1" || radiusValue == "2") {
      mappedRadiusValue = map(radius, -2000, 2000, 10, 500);
    }else if (radiusValue == "3" || radiusValue == "4" || radiusValue == "5") {
      mappedRadiusValue = map(radius, -4, 4, 10, 500);
    }else if (radiusValue == "6" ) {
      mappedRadiusValue = map(radius, 0, 255, 10, 500);
    }else if (radiusValue == "10" ) {
      mappedRadiusValue = map(radius, 0, 4097, 10, 500);
    } else{
      mappedRadiusValue= defaultRadius;
    }
    console.log(mappedRadiusValue);

    if (selected3D === "box") {
      box(mappedRadiusValue);
    } else if (selected3D === "plane") {
      plane(mappedRadiusValue);
    } else if (selected3D === "sphere") {
      sphere(radius);
    } else if (selected3D === "cone") {
      cone(radius, height);
    } else if (selected3D === "cylinder") {
      cylinder(radius, height);
    } else if (selected3D === "torus") {
      torus(radius, height / 4);
    }

  } else {
    if (selected3D === "box") {
      box(defaultRadius);
    } else if (selected3D === "plane") {
      plane(defaultRadius);
    } else if (selected3D === "sphere") {
      sphere(defaultRadius);
    } else if (selected3D === "cone") {
      cone(defaultRadius, defaultHeight);
    } else if (selected3D === "cylinder") {
      cylinder(defaultRadius, defaultHeight);
    } else if (selected3D === "torus") {
      torus(defaultRadius, defaultRadius / 4);
    }
  }
}


function rotateShape() {
  if (xRotationValue === "default") {
    rotateX(frameCount * 0.01);
  } else {
    for (let i = 0; i < sensorArray.length; i++) {
      rotateX(sensorArray[xRotationValue]);
    }
  }
  if (yRotationValue === "default") {
    rotateY(frameCount * 0.01);
  } else {
    for (let i = 0; i < sensorArray.length; i++) {
      rotateY(sensorArray[yRotationValue]);
    }
  }
  if (zRotationValue === "default") {
    rotateZ(frameCount * 0.01);
  } else {
    for (let i = 0; i < sensorArray.length; i++) {
      rotateZ(sensorArray[zRotationValue]);
    }
  }
}
