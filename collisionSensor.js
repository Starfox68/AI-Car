class Sensor {
  constructor(car) {
    //for creation
    this.car = car;

    //internal info
    this.numRays = 7;
    this.raySpread = 1.55;
    this.rayLength = 150;

    //ray position data
    this.rays = [];
    //collision data
    this.data = [];
  }

  draw(ctx) {
    for (let i = 0; i < this.numRays; i++) {
      let rayStart = this.rays[i][0];
      let rayMid = this.rays[i][1];
      let rayEnd = this.rays[i][1];

      //collision data
      if (this.data[i]) {
        rayEnd = this.data[i];
      }

      ctx.lineWidth = 2;

      //draw grey sensing part of ray
      ctx.strokeStyle = "grey";
      ctx.beginPath();
      ctx.moveTo(rayStart.x, rayStart.y);
      ctx.lineTo(rayMid.x, rayMid.y);
      ctx.stroke();

      //draw red collision detection part of ray
      ctx.strokeStyle = "red";
      ctx.beginPath();
      ctx.moveTo(rayMid.x, rayMid.y);
      ctx.lineTo(rayEnd.x, rayEnd.y);
      ctx.stroke();
    }
  }

  update(roadEdge, otherCars) {
    this.#drawRays();
    //clear old ray data
    this.data = [];
    for (let i = 0; i < this.rays.length; i++) {
      //update ray location
      let location = this.#findRayLocation(this.rays[i], roadEdge, otherCars);
      this.data.push(location);
    }
  }

  #drawRays() {
    this.rays = [];
    //use linear extrapolation to make rays all equidistant
    for (let i = 0; i < this.numRays; i++) {
      let ofSet = 0.5;
      if (this.numRays != 1) {
        ofSet = i / (this.numRays - 1);
      }
      const rayAngle =
        linExtrap(this.raySpread / 2, -this.raySpread / 2, ofSet) +
        this.car.angle;

      const rayBegin = { x: this.car.x, y: this.car.y };
      const rayEnd = {
        x: this.car.x - Math.sin(rayAngle) * this.rayLength,
        y: this.car.y - Math.cos(rayAngle) * this.rayLength,
      };
      //add full ray to array
      this.rays.push([rayBegin, rayEnd]);
    }
  }

  #findRayLocation(ray, roadEdge, otherCars) {
    let intersection = [];

    //check for intersection with other cars
    for (let i = 0; i < otherCars.length; i++) {
      const otherCarShape = otherCars[i].polygon;
      for (let j = 0; j < otherCarShape.length; j++) {
        const value = getIntersection(
          ray[0],
          ray[1],
          otherCarShape[j],
          otherCarShape[(j + 1) % otherCarShape.length]
        );
        if (value) {
          intersection.push(value);
        }
      }
    }

    //check for intersection with the road
    for (let i = 0; i < roadEdge.length; i++) {
      const touch = getIntersection(
        ray[0],
        ray[1],
        roadEdge[i][0],
        roadEdge[i][1]
      );
      if (touch) {
        intersection.push(touch);
      }
    }

    //return the intersection with the lowest offset/distance
    if (intersection.length == 0) {
      return null;
    } else {
      let offsetMap = intersection.map((e) => e.offset);
      return intersection.find((e) => e.offset == Math.min(...offsetMap));
    }
  }
}
