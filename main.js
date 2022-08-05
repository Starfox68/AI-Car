//set up car background and road
const carBackground = document.getElementById("carSim");
carBackground.width = 200;
const road = new Road(carBackground.width / 2, carBackground.width * 0.9);

//for neural network - save
function keepBrain() {
  localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

//for neural network - delete
function dumpBrain() {
  localStorage.removeItem("bestBrain");
}

//car traffic
let traffic = [];
const trafficPos = [
  -100, -300, -300, -500, -500, -700, -700, -770, -850, -965, -1080, -1080,
  -1350, -1350,
];

//make traffic cars
function generateTraffic(N) {
  for (let i = 0; i < N; i++) {
    let lane = Math.floor(Math.random() * road.numLanes);
    if (i == 0) {
      //first traffic car should always be in the 1st lane
      lane = 1;
    }
    let randomColour = "hsl(" + (290 + Math.random() * 260) + ", 100%, 60%)";
    //put traffic in a lane
    let tempCar = new Car(
      road.getMiddleofLane(lane),
      trafficPos[i],
      30,
      50,
      "TrafficCar",
      2,
      randomColour
    );
    traffic.push(tempCar);
  }
}

//make AI cars
function generateCars(N) {
  const cars = [];
  for (let i = 0; i <= N - 1; i++) {
    //add AI cars
    let aiCar = new Car(road.getMiddleofLane(1), 100, 30, 50, "AI");
    cars.push(aiCar);
  }
  return cars;
}

function animate(time) {
  //get information for traffic and AI cars
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].update(road.borders, []);
  }
  for (let i = 0; i < cars.length; i++) {
    cars[i].update(road.borders, traffic);
  }

  //bestCar has the highest y coordinate
  let carYArr = cars.map((c) => c.y);
  bestCar = cars.find((c) => c.y == Math.min(...carYArr));

  carBackground.height = window.innerHeight;
  const carCanvas = carBackground.getContext("2d");
  carCanvas.save();
  carCanvas.translate(0, -bestCar.y + carBackground.height * 0.7);

  carCanvas.globalAlpha = 1;
  //draw road and traffic cars first - dark colour
  road.draw(carCanvas);
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].draw(carCanvas);
  }
  //draw best car on top of both
  bestCar.draw(carCanvas, true);


  //draw AI cars in lighter colour
  carCanvas.globalAlpha = 0.2;
  for (let i = 0; i < cars.length; i++) {
    cars[i].draw(carCanvas);
  }

  carCanvas.restore();
  requestAnimationFrame(animate);
}

//number of cars to generate
const trafficCars = 14;
const aiCars = 200;
const cars = generateCars(aiCars);
generateTraffic(trafficCars);

//start bestCar as the first one
let bestCar = cars[0];
//if brain is saved in storage
if (localStorage.getItem("bestBrain")) {
  for (let i = 0; i < cars.length; i++) {
    cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
    if (i != 0) {
      //adapt car brains to be little closer to bestCar brain
      NeuralNetwork.adapt(cars[i].brain, 0.1);
    }
  }
}

animate();
