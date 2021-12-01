import Shape from '../src/Shape.js';


export default class Connector extends Shape {
    constructor(a, b) {
        super();
        this.a = a;
        this.b = b;
    }


    isHit(x, y) {
        if (
            x > this.x &&
            x < this.x + this.width &&
            y > this.y &&
            y < this.y + this.height
        ) {
            return true;
        }
    }
    render(ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(
            this.x,
            this.y,
            this.width,
            this.height
        );

        if (this.fillStyle) {
            ctx.fillStyle = this.fillStyle;
            ctx.fill();
        }
        if (this.strokeStyle) {
            ctx.strokeStyle = this.strokeStyle; 
            ctx.lineWidth = this.lineWidth;
            ctx.stroke();
        }
        ctx.restore();
    }
}