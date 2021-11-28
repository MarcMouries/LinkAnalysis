import Arc from './Arc.js';


export default class Circle extends Arc {
    constructor(x, y, radius) {
      super(x, y, radius, Math.PI *2);
    }
    isHit(x, y) {
      var dx = this.x - x;
      var dy = this.y - y;
      if (dx * dx + dy * dy < this.radius * this.radius) {
        return true;
      }
    }

    getBBox() {
      return {
        x: this.x - this.radius,
        y: this.y - this.radius,
        width : this.radius * 2,
        height : this.radius * 2
      }
    }
  }