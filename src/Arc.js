import Shape from './Shape.js';

export default class Arc extends Shape {
  constructor(x, y, radius, radians) {
    super(x, y);
    this.radius = radius;
    this.radians = radians;
  }
  isHit(x, y) {
    var dx = this.x - x;
    var dy = this.y - y;
    if (dx * dx + dy * dy < this.radius * this.radius) {
      return true;
    }
  }
  render(ctx) {
    ctx.save();

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, this.radians, false);

    if (this.fillStyle) {
      ctx.fillStyle = this.fillStyle;
      ctx.fill();
    }

    if (this.isSelected) {
      console.log("circle strokeStyle = " + this.strokeStyle);
      if (this.strokeStyle) {

        ctx.strokeStyle = this.strokeStyle;
        ctx.lineWidth = this.lineWidth;
        ctx.arc(this.x+22, this.y+22, this.radius, 0, this.radians, false);

        ctx.stroke();
      }

    }
    
    ctx.restore();
  }
}