class Shape {
    color = "#2793ef";
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.isSelected = false;
    }
    getColor() {
        return this.color;
    }
}

export default class Rectangle extends Shape {
    constructor(x, y, width, height) {
        super(x, y);
        this.width = width;
        this.height = height;
    }
    getArea() {
        return this.width * this.height;
    }

    isHit(x, y) {
        if (
            x > this.x - this.width * 0.5 &&
            x < this.x + this.width - this.width * 0.5 &&
            y > this.y - this.height * 0.5 &&
            y < this.y + this.height - this.height * 0.5
        ) {
            return true;
        }
    }
    render(ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(
            this.x - this.width * 0.5,
            this.y - this.height * 0.5,
            this.width,
            this.height
        );
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }
}