export default class Shape {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.isSelected = false;
    }
    getColor() {
        return this.color;
    }
}