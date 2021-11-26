//import  {MCanvas} from './MCanvas.js';

import InputDeviceTracker from './InputDeviceTracker.js'

export default class MChart {

  constructor(container, options) {
    console.log("MChart container()");
    console.log(container);
    this.container = container;
    var startX = 0;
    var startY = 0;



    const DEFAULTS = {
      display_grid: false,
    }
    this.options = Object.assign({}, DEFAULTS, options);

    this.objects = [];

    this.canvas = document.getElementById("canvas");
    this.ctx = canvas.getContext("2d");

    self = this;
  }
  dump() {
    console.log("MChart container= ");
    console.log("- objects= ");
    console.log(this.objects);

  }

  addObject(object) {
    this.objects.push(object);
    this.draw();
  }

  draw() {
    this.objects.forEach((object) => object.render(this.ctx));
  }

  manageInputEvents(evtType, x, y) {
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    switch (evtType) {
      case "down":
        this.startX = x;
        this.startY = y;

        var clicked_on_the_canvas = true;
        // we start from last to check the shape that is on top first
        for (var i = this.objects.length - 1; i >= 0; i--) {
          var object = this.objects[i];
          //    console.log ("checking for hit object = " + object.color);
          if (object.isHit(x, y)) {
            object.isSelected = true;
            console.log("Clicked on : " + object.color);
            moveObjectToLastPosition(this.objects, object);
            clicked_on_the_canvas = false;
            break;
          }
        }
        if (clicked_on_the_canvas) {
          console.log("clicked on the canvas");
        }

        break;

      case "up":
        this.objects.forEach((object) => {
          object.isSelected = false;
        });
        break;

      case "move":
        var dx = x - this.startX;
        var dy = y - this.startY;
        this.startX = x;
        this.startY = y;

        this.objects.forEach((object) => {
          if (object.isSelected) {
            object.x += dx;
            object.y += dy;
          }
        });
        break;
    }
    this.draw();
  }

  init() {

    this.inputDeviceTracker = new InputDeviceTracker(this.canvas, this.manageInputEvents.bind(this));

  
  }


}

/**
 *  We move the node selection to the last position so that it is drawn above the other shapes on the canvas
 */
function moveObjectToLastPosition(object_list, object_to_move) {
  object_list.forEach(function (object, index) {
    if (object === object_to_move) {
      object_list.splice(index, 1);
      object_list.push(object_to_move);
      return;
    }
  });
}
