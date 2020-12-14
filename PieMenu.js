var PI = Math.PI;
var TWO_PI = PI * 2;
var RADIAN = 180 / PI;

  /**
   * Shorthands for radians
   *  0   =   0 = East
   *  π/2 =  90 = North
   *  π   = 180 = West
   * 3π/2 = 270 = South
   */
var NORTH_IN_RAD = PI/2;
var WEST_IN_RAD = PI;
var SOUTH_IN_RAD = (3 * PI) / 2;


function PieMenu(options) {
    this.options = options;
    this.canvas = options.canvas;
    this.ctx = this.canvas.getContext("2d");
    this.menu_items = this.options.menu.items;
    this.center = options.center;
    this.radius = options.radius;
    this.sectorArcWidth = 20;
    this.sector_count = this.menu_items.length;
    this.slice_angle = (2 * Math.PI) / this.sector_count;
    pieMenu = this;
    
    
    createSectors = function () {

	}
	
	this.draw = function () {

	}
	
}