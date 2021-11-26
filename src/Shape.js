export default class Shape {
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