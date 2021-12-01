import {NONE} from './Constants.js';

export default class Shape {
    constructor(x, y, type) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.isSelected = false;
        this.strokeStyle = NONE;

    }
    getColor() {
        return this.color;
    }
}