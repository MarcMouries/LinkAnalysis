export default class InputDeviceTracker {

    constructor(canvas, callback) {
        console.log("InputDeviceTracker ()");

        this.canvas = canvas;
        this.callback = callback;
        self = this;

        console.log("constructor this");
        console.log(this);

        this.canvas.addEventListener('mousedown', this.onDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onMove.bind(this));
        this.canvas.addEventListener('mouseup', this.onUp.bind(this));

        this.canvas.addEventListener('touchstart', this.onDown.bind(this));
        this.canvas.addEventListener('touchmove', this.onMove.bind(this));
        this.canvas.addEventListener('touchend', this.onUp.bind(this));
    }

    getCoordinatesFromEvent(evt) {
        var rect = self.canvas.getBoundingClientRect();
        var offsetTop = rect.top;
        var offsetLeft = rect.left;

        if (evt.touches) {
            return {
                x: evt.touches[0].clientX - offsetLeft,
                y: evt.touches[0].clientY - offsetTop
            };
        } else {
            return {
                x: evt.clientX - offsetLeft,
                y: evt.clientY - offsetTop
            };
        }
    }

    onDown(evt) {
        evt.preventDefault();
        var coords = self.getCoordinatesFromEvent(evt);
        self.callback("down", coords.x, coords.y);
    }

    onUp(evt) {
        evt.preventDefault();
        self.callback("up");
    }

    onMove(evt) {
        evt.preventDefault();
        var coords = self.getCoordinatesFromEvent(evt);
        self.callback("move", coords.x, coords.y);
    }
}