var PieMenu = function (options) {
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
    
    
    this.createSectors = function () {

    }
}