const INF = 1000000;

class Road {
  constructor(x, canvasWidth, numLanes = 3) {
    //for creation
    //dimensions
    this.x = x;
    this.width = canvasWidth;
    this.middle = canvasWidth / 2;
    this.numLanes = numLanes;

    //internal info
    //coordinates
    this.bottom = INF;
    this.top = -INF;
    this.leftHalf = x - this.middle;
    this.rightHalf = x + this.middle;

    this.borders = [
      [
        //top left, bottom left
        { x: this.leftHalf, y: this.top },
        { x: this.leftHalf, y: this.bottom },
      ],
      [
        //top right, bottom right
        { x: this.rightHalf, y: this.top },
        { x: this.rightHalf, y: this.bottom },
      ],
    ];
  }

  draw(ctx) {
    ctx.strokeStyle = "white";
    ctx.lineWidth = 7;

    //solid border
    for (let i = 0; i < this.borders.length; i++) {
      ctx.beginPath();
      ctx.moveTo(this.borders[i][0].x, this.borders[i][0].y);
      ctx.lineTo(this.borders[i][1].x, this.borders[i][1].y);
      ctx.stroke();
    }

    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 5;

    //dashes lane dividers
    for (let i = 1; i <= this.numLanes - 1; i++) {
      const x = linExtrap(this.leftHalf, this.rightHalf, i / this.numLanes);

      ctx.setLineDash([30, 30]);
      ctx.beginPath();
      ctx.moveTo(x, this.bottom);
      ctx.lineTo(x, this.top);
      ctx.stroke();
    }
  }

  //use number of lanes and total width to find the middle pixels of a given lane
  getMiddleofLane(laneNum) {
    return (
      this.leftHalf +
      this.width / this.numLanes / 2 +
      Math.min(laneNum, this.numLanes - 1) * (this.width / this.numLanes)
    );
  }
}
