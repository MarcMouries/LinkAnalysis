import InputDeviceTracker from './InputDeviceTracker.js'
import Circle from './Circle.js'
import Rectangle from './Rectangle.js'

export default class MChart {

  constructor(container, options) {
    console.log("MChart container()");
    console.log(container);
    this.container = container;
    this.startX = 0, this.startY = 0;
    this.lastMoveX = 0, this.lastMoveY = 0;
    this.selection = new Rectangle(100, 100, 100, 100);



    const DEFAULTS = {
      display_grid: false,
    }
    this.options = Object.assign({}, DEFAULTS, options);

    /* The list of ojbects to draw */
    this.objects = [];

    /* The Selection Box */
    this.SELECTION = {
      color: '#CC0000', 
      lineWidth: 3
    }


    this.canvas = document.getElementById("canvas");
    this.ctx = canvas.getContext("2d");

    self = this;

    var selecting = false;
    this.isDragging = false;

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
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    // this.objects.forEach((object) => object.render(this.ctx));
    this.objects.forEach((object) => {
      object.render(this.ctx);
      if (object.isSelected) {
        var selection;
        var width , height= 0;

        if (object instanceof Circle) {
          var bbox = object.getBBox();
          selection = new Rectangle(bbox.x, bbox.y, bbox.width, bbox.height);
        }
        else {
          selection = new Rectangle(object.x, object.y, object.width, object.height);
        }
        
        
        selection.strokeStyle = this.SELECTION.color;
        selection.lineWidth = this.SELECTION.lineWidth;
        selection.render(this.ctx);
      }


      if (this.selecting == true) {
        this.selection = new Rectangle(
          this.selection_startX,
          this.selection_startY,
          this.lastMoveX - this.selection_startX,
          this.lastMoveY - this.selection_startY);
        this.selection.strokeStyle = 'rgba(0,128,255,1)';
        this.selection.fillStyle = 'rgba(0,128,255, 0.2)';
        this.selection.render(this.ctx);
        //console.log(this.selection);
      }
    })
  }

  manageInputEvents(evtType, x, y) {
    switch (evtType) {
      case "down":
        this.startX = x;
        this.startY = y;
        this.lastMoveX = x;
        this.lastMoveY = y;


        var clicked_on_the_canvas = true;
        // we start from last to check the shape that is on top first
        for (var i = this.objects.length - 1; i >= 0; i--) {
          var object = this.objects[i];
          //    console.log ("checking for hit object = " + object.color);
          if (object.isHit(x, y)) {
            object.isSelected = true;
            console.log("Clicked on : " + object.constructor.name  + "/" + object.fillStyle);
            moveObjectToLastPosition(this.objects, object);
            clicked_on_the_canvas = false;
            this.selecting = false;
            this.isDragging = true;


            this.selection = new Rectangle(
              this.selection_startX,
              this.selection_startY,
              this.lastMoveX - this.selection_startX,
              this.lastMoveY - this.selection_startY);

          }
          else {
            //
            // DEBUG
            //
            //
            //
            //object.isSelected = false;

          }
        }
        if (clicked_on_the_canvas) {
          console.log("clicked on the canvas");
          this.selecting = true;
          this.selection_startX = x;
          this.selection_startY = y;

          /* reset selection if user clicked on the canvas */
          this.objects.forEach((object) => {
            console.log("testing object " + object.fillStyle + " is Circle ? " + (object instanceof Circle));
            object.isSelected = false;
          });
        }
        break;

      case "up":
        console.log("MOUSE UP");
        console.log(" isDragging : " + this.isDragging);
        console.log(" selecting : " + this.selecting);


        this.selecting = false;
        this.isDragging = false;

        // console.log("SELECTION startX : " + this.selection_startX);
        // console.log("SELECTION startY : " + this.selection_startY);
        // console.log("SELECTION last X : " + this.lastMoveX);
        // console.log("SELECTION last Y : " + this.lastMoveY);
        var selectionWidth = Math.abs(this.selection_startX - this.lastMoveX);
        var selectionHeight = Math.abs(this.selection_startY - this.lastMoveY);
        var selectionRectangle = new Rectangle(
          Math.floor(this.selection_startX),
          Math.floor(this.selection_startY),
          selectionWidth, selectionHeight);
        //  console.log("selectionRectangle");
        //  console.log(selectionRectangle);

        break;

      case "move":

        this.lastMoveX = x;
        this.lastMoveY = y;

        var dx = x - this.startX;
        var dy = y - this.startY;

        this.startX = x;
        this.startY = y;

        if (this.isDragging) {
          this.objects.forEach((object) => {
            if (object.isSelected) {
              object.x += dx;
              object.y += dy;
            }
          });
        }
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
