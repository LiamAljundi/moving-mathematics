const serviceUuid = "555a0002-0000-467a-9538-01f0652c74e8";
const characteristicsUUID = {
  temp: "555a0002-0014-467a-9538-01f0652c74e8",
  prox: "555a0002-0017-467a-9538-01f0652c74e8",
  gyro: "555a0002-0012-467a-9538-01f0652c74e8",
  acce: "555a0002-0011-467a-9538-01f0652c74e8",
};

let tempCharacteristic;
let proxCharacteristic;
let gyroCharacteristic;
let acceCharacteristic;

let myBLE;

let tempValue = 0;
let proxValue = 0;

let gyroValue = [0, 0, 0];
let acceValue = [0, 0, 0];

let sensorArray = [
  gyroValue[0],
  gyroValue[1],
  gyroValue[1],
  acceValue[0],
  acceValue[1],
  acceValue[2],
  proxValue,
];

let cnv;
let controlMenuWidth = 25 / 100;

let shapeSelection = document.querySelector("#dropdown-3d");
let selected3D = "box";

let xRotationSelection = document.querySelector("#dropdown-xRotation");
let yRotationSelection = document.querySelector("#dropdown-yRotation");
let zRotationSelection = document.querySelector("#dropdown-zRotation");

let xRotation = "auto";
let yRotation = "auto";
let zRotation = "auto";

let shapes3D;

shapeSelection.addEventListener("change", () => {
  selected3D = shapeSelection.options[shapeSelection.selectedIndex].value;
});
xRotationSelection.addEventListener("change", () => {
  xRotation =
    xRotationSelection.options[xRotationSelection.selectedIndex].value;
});
yRotationSelection.addEventListener("change", () => {
  yRotation =
    yRotationSelection.options[yRotationSelection.selectedIndex].value;
});
zRotationSelection.addEventListener("change", () => {
  zRotation =
    zRotationSelection.options[zRotationSelection.selectedIndex].value;
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
  shapes3D = new Shapes3D();

  background("#FFF");

  // Create a 'Connect and Start Notifications' button
  const connectButton = createButton("CONNECT");
  connectButton.mousePressed(connectAndStartNotify);
}

function draw() {
  background(250);

  normalMaterial();
  push();

  shapes3D.rotate();
  shapes3D.select();

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
    if (characteristics[i].uuid == characteristicsUUID.temp) {
      tempCharacteristic = characteristics[i];
      myBLE.startNotifications(tempCharacteristic, handleTemp, "float32");
    } else if (characteristics[i].uuid == characteristicsUUID.prox) {
      proxCharacteristic = characteristics[i];
      myBLE.startNotifications(proxCharacteristic, handleProx);
    } else if (characteristics[i].uuid == characteristicsUUID.gyro) {
      gyroCharacteristic = characteristics[i];
      myBLE.startNotifications(gyroCharacteristic, handleGyro, "string");
    } else if (characteristics[i].uuid == characteristicsUUID.acce) {
      acceCharacteristic = characteristics[i];
      myBLE.startNotifications(acceCharacteristic, handleAcce, "string");
    } else {
      console.log("nothing");
    }
  }
  // Start notifications on the first characteristic by passing the characteristic
  // And a callback function to handle notifications
}

// A function that will be called once got characteristics
function handleTemp(data) {
  //console.log(tempValue);
  tempValue = Number(data);
}

function handleProx(data) {
  //console.log('Prox: ', data);
  proxValue = Number(data);
}

function handleGyro(data) {
  //console.log("GYRO: "+gyroValue[0]+ " | "+ gyroValue[1]+" | "+ gyroValue[2]);
  gyroValue = data.split("|");
}

function handleAcce(data) {
  //console.log("ACCE: "+acceValue[0]+ " | "+ acceValue[1]+" | "+ acceValue[2]);
  acceValue = data.split("|");
}

class Shapes3D {
  constructor() {
    this.width = 100;
    this.height = 100;
    this.depth = 100;

    this.radius = 100;
  }

  select() {
    if (selected3D === "box") {
      box(this.width, this.height, this.depth);
    } else if (selected3D === "plane") {
      plane(this.width, this.height, this.depth);
    } else if (selected3D === "sphere") {
      sphere(this.radius);
    } else if (selected3D === "cone") {
      cone(this.radius, this.height);
    } else if (selected3D === "cylinder") {
      cylinder(this.radius, this.height);
    } else if (selected3D === "torus") {
      torus(this.radius, this.radius / 4);
    }
  }

  rotate() {
    if (xRotation === "auto") {
      rotateX(frameCount * 0.01);
    } else {
        for (let i = 0; i < sensorArray.length; i++) {
            rotateX(sensorArray[xRotation]);
          }
    }
    if (yRotation === "auto") {
      rotateY(frameCount * 0.01);
    } else {
      for (let i = 0; i < sensorArray.length; i++) {
        rotateY(sensorArray[yRotation]);
      }
    }
    if (zRotation === "auto") {
      rotateZ(frameCount * 0.01);
    } else {
        for (let i = 0; i < sensorArray.length; i++) {
            rotateZ(sensorArray[zRotation]);
          }
    }
  }
}
