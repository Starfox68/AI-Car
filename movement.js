class Controls {
  constructor(carType) {
    //internal info
    //car direction controls
    this.forward = carType === "TrafficCar" ? true : false;
    this.backwards = false;
    this.left = false;
    this.right = false;
  }
}
