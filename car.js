//check if car polygons intersect
function polygonsTouch(poly1, poly2) {
  for (let i = 0; i < poly1.length; i++) {
    for (let j = 0; j < poly2.length; j++) {
      if (
        getIntersection(
          poly1[i],
          //modulo means last index + 1 will be the first index
          poly1[(i + 1) % poly1.length],
          poly2[j],
          poly2[(j + 1) % poly2.length]
        )
      ) {
        return true;
      }
    }
  }
  return false;
}

class Car {
  constructor(x, y, width, height, carType, maxSpeed = 3, colour = "blue") {
    //given for creation
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    if (carType == "AI") {
      this.sensor = new Sensor(this);
      this.brain = new NeuralNetwork([this.sensor.numRays, 6, 4]);
    }

    this.maxSpeed = maxSpeed;
    this.colour = colour;

    //internal controls
    this.damaged = false;
    this.speed = 0;
    this.acceleration = 0.2;

    //direction it's facing
    this.angle = 0;

    //crate mask for car shape
    this.mask = document.createElement("canvas");
    const maskCtx = this.mask.getContext("2d");
    this.mask.width = width;
    this.mask.height = height;
    maskCtx.fillStyle = colour;
    //create rectangle with mask dimensions
    maskCtx.rect(0, 0, this.width, this.height);
    maskCtx.fill();
    maskCtx.globalCompositeOperation = "destination-atop";

    //automatic controls or not
    if (carType == "AI") {
      this.useBrain = true;
    } else {
      this.useBrain = false;
    }

    this.controls = new Controls(carType);
  }

  draw(ctx, showSensor = false) {
    //only show sensor for the best car
    if (this.sensor && showSensor) {
      this.sensor.draw(ctx);
    }
    //get car direction and orientation information
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(-this.angle);
    //draw the car if it is still able to drive
    if (this.damaged == false) {
      ctx.drawImage(
        this.mask,
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      );
    }
    ctx.restore();
  }

  update(roadEdge, otherCars) {
    //if car is not damaged - move it - draw it - check for collision
    if (this.damaged == false) {
      this.#move();
      this.polygon = this.#makeOutline();
      this.damaged = this.#checkForDamage(roadEdge, otherCars);
    }
    //if this is not a traffic car update the sensor
    if (this.sensor) {
      this.sensor.update(roadEdge, otherCars);
      //calculate how far all obstacles are
      const offsetArr = this.sensor.data.map((s) =>
        s != null ? 1 - s.offset : 0
      );
      //give obstacle distance to the neural network to process
      const outputs = NeuralNetwork.transformInputs(offsetArr, this.brain);

      //let the neural network outputs control the car
      if (this.useBrain) {
        this.controls.forward = outputs[0];
        this.controls.backwards = outputs[3];
        this.controls.left = outputs[1];
        this.controls.right = outputs[2];
      }
    }
  }

  #move() {
    //forward and backward controls
    if (this.controls.forward) {
      this.speed += this.acceleration;
    }
    if (this.controls.backwards) {
      this.speed -= this.acceleration;
    }
    //left and right
    let dir = this.speed < 0 ? -1 : 1;
    if (this.controls.left) {
      this.angle += 0.03 * dir;
    }
    if (this.controls.right) {
      this.angle -= 0.03 * dir;
    }
    //cap max and min speed
    if (this.speed > this.maxSpeed) {
      this.speed = this.maxSpeed;
    }
    if (this.speed < -this.maxSpeed / 2) {
      this.speed = -this.maxSpeed / 2;
    }
    //calculate location w.r.t angle and speed
    this.x -= Math.sin(this.angle) * this.speed;
    this.y -= Math.cos(this.angle) * this.speed;
  }

  //outline for corners of the car
  #makeOutline() {
    const points = [];
    const rad = Math.hypot(this.width, this.height) / 2;
    const alpha = Math.atan2(this.width, this.height);
    points.push({
      x: this.x - Math.sin(this.angle - alpha) * rad,
      y: this.y - Math.cos(this.angle - alpha) * rad,
    });
    points.push({
      x: this.x - Math.sin(this.angle + alpha) * rad,
      y: this.y - Math.cos(this.angle + alpha) * rad,
    });
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
      y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad,
    });
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
      y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad,
    });
    return points;
  }

  #checkForDamage(roadEdge, otherCars) {
    for (let i = 0; i < otherCars.length; i++) {
      //check if car is touching other cars
      if (polygonsTouch(this.polygon, otherCars[i].polygon)) {
        return true;
      }
    }
    for (let i = 0; i < roadEdge.length; i++) {
      //check if car is touching the border
      if (polygonsTouch(this.polygon, roadEdge[i])) {
        return true;
      }
    }
    return false;
  }
}
