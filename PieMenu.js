DEBUG_TEXT_RIGHT_X = 390;
DEBUG_TEXT_LEFT_X = 10;

var PI = Math.PI;
var TWO_PI = PI * 2;
var RAD_TO_DEG = 180 / PI;
var RADIAN = 180 / PI;

/**
 * Returns the distance between two points = √((x2 - x1)² + (y2 - y1)²)
 */
function distance(p1, p2) {
  var x = p2.x - p1.x;
  var xSq = x * x;
  var y = p2.y - p1.y;
  var ySq = y * y;
  return Math.sqrt(xSq + ySq);
}

/**
 * Returns the angle in radians relative to (0,0) at the center of the circle
 */
function getAngleUsingXAndY(x, y) {
  var adjacent = x;
  var opposite = y;

  return Math.atan2(opposite, adjacent);
}

function drawTextAtPoint(ctx, text, x, y, textAlign) {
  ctx.font = "16px Times";
  ctx.textAlign = textAlign;
  ctx.fillText(text, x, y);
}
function getMousePosition(evt) {
  // Get the canvas size and position relative to the web page
  var canvasDimensions = canvas.getBoundingClientRect();
  // Get canvas x & y position
  var x = Math.floor(evt.clientX - canvasDimensions.left);
  var y = Math.floor(evt.clientY - canvasDimensions.top);

  return { x: x, y: y };
}

/**
 * Concernt mouse (x, y) relative to the center of the circle
 */
function screenToGraphPos(mousePos, center) {
  return {
    x: mousePos.x - center.x,
    y: mousePos.y - center.y,
  };
}

function radians_to_degrees(radians) {
  return radians * RAD_TO_DEG;
}

// REMPLACER
function radiansToDegrees(rad) {
  // return (rad * (RADIAN)).toFixed(2);

  if (rad < 0) {
    // Correct the bottom error by adding the negative
    // angle to 360 to get the correct result around
    // the whole circle
    return (360.0 + rad * RAD_TO_DEG).toFixed(2);
  } else {
    return (rad * RAD_TO_DEG).toFixed(2);
  }
}

function drawCircle(ctx, cX, cY, radius, color, lineWidth) {
  drawArc(ctx, cX, cY, radius, 0, TWO_PI, color, lineWidth);
}
function drawArc(ctx, cX, cY, radius, startAngle, endAngle, color, lineWidth) {
  var counterClockwise = false;
  ctx.beginPath();
  ctx.arc(cX, cY, radius, startAngle, endAngle, counterClockwise);
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.closePath();
}

/**
 * Circle sector represent one sector of a circle or wedge, slice.
 * @param {*} name
 * @param {*} startAngle
 * @param {*} endAngle
 * @param {*} color
 * @param {*} lineWidth
 */
var CircleSector = function (name, radius, startAngle, endAngle, color, lineWidth) {
  this.name = name;
  this.radius = radius;
  this.startAngle = startAngle;
  this.endAngle = endAngle;
  this.color = color;
  this.lineWidth = lineWidth;

  CircleSector.prototype.draw = function (ctx, center) {
	  console.log("in draw sector " + this.color);
    drawArc(
      ctx,
      center.x,
      center.y,
      this.radius,
      this.startAngle,
      this.endAngle,
      this.color,
      this.lineWidth
    );
  };
};

/**
 * PieMenu
 *
 */
(function () {
  /**
   * Shorthands for radians
   *  0   =   0 = East
   *  π/2 =  90 = North
   *  π   = 180 = West
   * 3π/2 = 270 = South
   */
  var NORTH_IN_RAD = PI / 2;
  var WEST_IN_RAD = PI;
  var SOUTH_IN_RAD = (3 * PI) / 2;

  var ctx ;
  PieMenu = function (options) {
    var name = options.name || "default";
    this.options = options;
    this.canvas = options.canvas;
     ctx = this.canvas.getContext("2d");
    this.menu_items = this.options.menu.items;
    this.center = options.center;
    this.radius = options.radius;
    this.sectorArcWidth = 20;
    var half_sectorArcWidth = this.sectorArcWidth / 2;
    this.sector_count = this.menu_items.length;
    this.slice_angle = (2 * Math.PI) / this.sector_count;
    /**
     * starting_angle: angle at which the first sector start
     *  0   =   0 = East
     *  π/2 =  90 = North
     *  π   = 180 = West
     * 3π/2 = 270 = South
     */
    var starting_angle = 0;
    //var starting_angle =  Math.PI/2;
    this.starting_angleDEG = radiansToDegrees(starting_angle);

    /**
     * Event listeners to push events to.
     */
    this.eventListeners = [];

    pieMenu = this;

    var redrawCanvas = function (e) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      var mouseScreenPos = getMousePosition(e);
      drawTextAtPoint(ctx, "X : " + mouseScreenPos.x, 10, 20);
      drawTextAtPoint(ctx, "Y : " + mouseScreenPos.y, 10, 40);
      var mouseGraphPos = screenToGraphPos(mouseScreenPos, pieMenu.center);
      drawTextAtPoint(ctx, "X : " + mouseGraphPos.x, DEBUG_TEXT_RIGHT_X, 20);
      drawTextAtPoint(ctx, "Y : " + mouseGraphPos.y, DEBUG_TEXT_RIGHT_X, 40);

      var angleRAD = getAngleUsingXAndY(mouseGraphPos.x, mouseGraphPos.y);
      var angleDEG = radiansToDegrees(angleRAD);
      drawTextAtPoint(ctx, "Angle : " + angleDEG + "°", 10, 60);

      var dist = distance(mouseScreenPos, pieMenu.center);

      var insidePieMenu = dist < pieMenu.radius;
      var insidePieSectors =
        dist > pieMenu.radius - half_sectorArcWidth &&
        dist < pieMenu.radius + half_sectorArcWidth;
      drawTextAtPoint(ctx, "Inside : " + insidePieMenu, 10, 80);
      drawTextAtPoint(ctx, "insidePieSectors : " + insidePieSectors, 10, 100);

      /*
       * Simplification of:
       * var sectorID = (angleDEG / 360) / (1 / pieMenu.sector_count );
       */
      var sectorID = (angleDEG / 360) * pieMenu.sector_count;

      /*
       * Truncate the decimal part
       */
      sectorID = ~~sectorID;

      drawTextAtPoint(ctx, "Sector ID  : " + sectorID, 10, 120);

      var currentSector = pieMenu.sectors[sectorID];
      drawTextAtPoint(ctx, "Sector Name: " + currentSector.name, 10, 140);
      drawTextAtPoint(
        ctx,
        "Sector sAngle: " + currentSector.startAngle,
        10,
        160
      );
      drawTextAtPoint(ctx, "Sector eAngle: " + currentSector.endAngle, 10, 180);

      var sectorHighlight_width = 10;
      drawArc(
        ctx,
        pieMenu.center.x,
        pieMenu.center.y,
        pieMenu.radius + 18,
        currentSector.startAngle,
        currentSector.endAngle,
        currentSector.color,
        sectorHighlight_width
      );

      /*
	  console.log("this.item_count: " + pieMenu.item_count);
		  for (var i = 0; i < pieMenu.item_count; i++) {
			  sector = pieMenu.sectors[i];
	  console.log("sector: " + sector);
  
		  }
	  */
      pieMenu.draw();
    };

    this.sectors = createSectors();
    this.canvas.addEventListener("mousemove", redrawCanvas);

    function createSectors() {
      var sectors = [];
      for (var i = 0; i < pieMenu.sector_count; i++) {
        var startAngle = pieMenu.slice_angle * i - starting_angle;
        var endAngle = pieMenu.slice_angle * (i + 1) - starting_angle;
        var color = pieMenu.menu_items[i].color;
        var name = pieMenu.menu_items[i].name;

        sector = new CircleSector(
		  name,
		  pieMenu.radius,
          startAngle,
          endAngle,
          color,
          pieMenu.sectorArcWidth
        );
        console.log(
          "sector " + i + " " + name + " " + startAngle + " - " + endAngle
        );

        sectors.push(sector);
      }
      return sectors;
    }

	PieMenu.prototype.draw = function () {
		for (var i = 0; i < this.sector_count; i++) {
		  //var startAngle = (this.slice_angle * i) + (starting_angle);
		  //var endAngle = (this.slice_angle * (i + 1))+ (starting_angle);
		  //var color = this.menu_items[i].color;
		  //drawArc(ctx,  centerX,  centerY, radius, startAngle, endAngle, color, lineWidth);
	
		  // Using Sector
		  sector = this.sectors[i];
		  //drawArc(ctx,  centerX,  centerY, radius, sector.startAngle, sector.endAngle, sector.color, lineWidth);
	
		  sector.draw(ctx, this.center);
		}
		drawCircle(ctx, pieMenu.center.x, pieMenu.center.y, pieMenu.radius, "black", 1);
	  };


    /**
     * PieMenu.addGraphListener(this)
     * @param {*} obj
     */

    PieMenu.prototype.addGraphListener = function (obj) {
      this.eventListeners.push(obj);
    };

    PieMenu.prototype.getName = function () {
      return name;
    };
  };
  return this;
})();
