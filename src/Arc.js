import Shape from './Shape.js';
import { NONE } from './Constants.js';

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

    if (this.strokeStyle != NONE) {
      ctx.strokeStyle = this.strokeStyle;
      ctx.lineWidth = this.lineWidth;
      ctx.stroke();
    }

    ctx.restore();
  }
}