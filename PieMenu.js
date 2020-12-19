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

  PieMenu = function (options) {
    var name = options.name || "default";
    this.options = options;
    this.canvas = options.canvas;
    var ctx = this.canvas.getContext("2d");
    this.menu_items = this.options.menu.items;
    this.center = options.center;
    this.radius = options.radius;
    this.sectorArcWidth = 20;
    var half_sectorArcWidth = this.sectorArcWidth / 2;
    this.sector_count = this.menu_items.length;
    this.slice_angle = (2 * Math.PI) / this.sector_count;
	this.eventListeners = [];

    pieMenu = this;

    var redrawCanvas = function (e) {
      console.log("in redrawCanvas");
      ctx.clearRect(0, 0, canvas.width, canvas.height);



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
    };
    console.log(this.canvas);
    this.canvas.addEventListener("mousemove", redrawCanvas);
    console.log("2 addEventListener");

    createSectors = function () {};

    this.draw = function () {
      console.log("in draw");
    };

    var getNamePrivate = function () {
      return name;
	};
	
	/**
	 * PieMenu.addGraphListener(this)
	 * @param {*} obj 
	 */
	
	PieMenu.prototype.addGraphListener = function(obj) {
		this.eventListeners.push(obj);
	};
	
    PieMenu.prototype.getName = function () {
      return name;
    };
  };
  return this;
})();
