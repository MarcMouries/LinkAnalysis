// =============================================================
//                          MCanvas
// =============================================================
var MCanvas = (function () {

  COLORS = [
    "#4e79a7",
    "#f28e2c",
    "#e15759",
    "#76b7b2",
    "#59a14f",
    "#edc949",
    "#af7aa1",
    "#ff9da7",
    "#9c755f",
    "#bab0ab",
  ];

  var MCanvas = function (container, options) {

    if (container == null) {
      console.error("MCanvas error: check that the container provided to MCanvas exist");
      return;
    }

    options || (options = {});

    this.canvas = document.createElement("canvas");
    mcanvas = this;


    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";

    container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    var bc_rect = this.canvas.getBoundingClientRect();
    this.canvas.width = bc_rect.width * this.dpr;
    this.canvas.height = bc_rect.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
    this.canvas.style.width = bc_rect.width + "px";
    this.canvas.style.height = bc_rect.height + "px";

    console.log(" -  offsetLeft : " + this.canvas.offsetLeft);
    console.log(" -  offsetTop : " + this.canvas.offsetTop);


    console.log("MCanvas = " + this.getWidth() + " x " + this.getHeight());

    this.margin = {
      top: 00,
      right: 00,
      bottom: 00,
      left: 00,
    };
    this.width = this.canvas.width - this.margin.left - this.margin.right;
    this.height = this.canvas.height - this.margin.top - this.margin.bottom - this.canvas.offsetTop;
  }

  MCanvas.prototype.resize = function () {
    var rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * this.dpr;
    this.canvas.height = rect.height * this.dpr;
    var mcanvas = this;
    this.ctx.scale(this.dpr, this.dpr);
    //     this.canvas.style.width = this.rect.width + 'px';
    //    this.canvas.style.height = this.rect.height + 'px';

    var rect_info = "rect width: " + rect.width + "x" + rect.height;
    console.log(rect_info);
    console.log(mcanvas.canvas);

    //Redraw & reposition content
    var width = rect.width;
    var height = rect.height;
    mcanvas.ctx.font = "50px Calibri";
    mcanvas.ctx.fillStyle = "#DDDDDD"; //black
    //this.ctx.fillRect(0, 0, width, height); //fill the canvas

    var resizeText =
      "Canvas (px): " + mcanvas.getWidth() + " x " + mcanvas.getHeight();
    console.log(resizeText);
    mcanvas.ctx.textAlign = "center";
    mcanvas.ctx.fillStyle = "white"; //white
    mcanvas.ctx.fillText(resizeText, width / 2, height / 2);

    this.drawLine(0, 0, width, height);
    this.drawLine(0, height, width, 0);

  }


  MCanvas.prototype.getContext = function () {
    return this.ctx;
  };

  MCanvas.prototype.getHeight = function () {
    return this.canvas.height / this.dpr;
  };

  MCanvas.prototype.getOffset = function () {
    return {
      x: this.canvas.offsetLeft,
      y: this.canvas.offsetTop
    }
  };

  MCanvas.prototype.getWidth = function () {
    return this.canvas.width / this.dpr;
  };

  MCanvas.prototype.getCenter = function () {
    var cx = this.getWidth() / 2;
    var cy = this.getHeight() / 2;
    return {
      x: cx,
      y: cy,
    };
  };

  /**
   * oX : Origin X
   * oY : Origin Y
   */
  MCanvas.prototype._drawGrid = function (oX, oY, width, height, opt_increment, line_color, font) {
    this.ctx.save();
    this.ctx.font = font || '12px Monospace';
    this.ctx.fillStyle = line_color || "DarkGrey";
    this.ctx.lineWidth = 0.35;
    increment = opt_increment || 100;

    console.log("DRAW GRID oX = " + oX);


    var offset_text = 10;
    /* vertical lines */
    for (var x = oX; x < width; x += increment) {
      // this.ctx.beginPath()
      this.ctx.moveTo(x, oY);
      this.ctx.lineTo(x, height);
      //x % increment == 0 ? this.ctx.strokeStyle = "red" : this.ctx.strokeStyle = "DarkGrey";
      this.ctx.stroke();


      this.ctx.fillText(x, x, oY + offset_text);


    }

    /* horizontal lines */
    for (var y = oY; y < height; y += increment) {
      // this.ctx.beginPath()
      this.ctx.moveTo(oX, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();

      this.ctx.fillText(y, oX, y);
    }


    //this.ctx.restore();
  }


  MCanvas.prototype.drawGrid = function () {
    var width = 200;
    var height = 200;
    var increment = 50;
    var line_color = "black";


    this._drawGrid(0, 0, this.width, this.height, increment, line_color);
  };


  MCanvas.prototype.drawLine_BE = function(begin, end, stroke = 'black', width = 1) {
    this.ctx.save();
    if (stroke) {      this.ctx.strokeStyle = stroke;    }
    if (width) {      this.ctx.lineWidth = width;    }
    this.ctx.beginPath();
    this.ctx.moveTo(...begin);
    this.ctx.lineTo(...end);
    this.ctx.stroke();
    this.ctx.restore();
  }

  MCanvas.prototype.drawTextOnLine = function(start, end, text, stroke = 'black', width = 1) {
    this.ctx.save();
    if (stroke) {      this.ctx.strokeStyle = stroke;    }
    if (width) {      this.ctx.lineWidth = width;    }

    this.ctx.font = "24px sans-serif";
    this.ctx.translate(start.x,start.y);
    this.ctx.rotate(Math.PI / 4);
    this.ctx.fillText(text, 0,0);
    this.ctx.fill();
    this.ctx.restore();
  }


  MCanvas.prototype.drawLine = function (startX, startY,    endX,    endY,    strokeStyle,    lineWidth  ) {
    if (strokeStyle != null) this.ctx.strokeStyle = strokeStyle;
    if (lineWidth != null) this.ctx.lineWidth = lineWidth;
    this.ctx.beginPath();
    this.ctx.moveTo(startX, startY);
    this.ctx.lineTo(endX, endY);
    this.ctx.stroke();
    this.ctx.closePath();
  };

  MCanvas.prototype.drawTextBG = function (txt, x, y, font, padding, background_color) {
    this.ctx.font = font;
    this.ctx.textBaseline = "top";
    this.ctx.fillStyle = background_color;
    this.ctx.opacity = 0.2;

    var width = this.ctx.measureText(txt).width;
    var text_height = 25;

    this.ctx.fillRect(
      x - width / 2,
      y + text_height,
      width + padding,
      parseInt(font, 10) + padding
    );

    //this.ctx.lineWidth = 1;
    //this.ctx.strokeStyle = "#009ddf";
    //this.ctx.strokeRect(x - width /2, y + text_height, width + padding, parseInt(font, 10) + padding);

    this.ctx.fillStyle = "#000";
    //this.ctx.fillText(txt, x - width /2, y + padding / 2);
    this.ctx.fillText(txt, x - width / 2, y + text_height);
  };

  MCanvas.prototype.drawBackground = function (x, y, width, height, background_color) {
    this.ctx.fillStyle = "#F5F5F5";
    //  this.ctx.rect(this.margin.left, this.margin.top, this.width, this.height);
    this.ctx.fillRect(x, y, width, height);

    //this.ctx.shadowColor = "black";
    //this.ctx.shadowBlur = 2;
    //this.ctx.shadowOffsetX = 0;
    //this.ctx.shadowOffsetY = 0;
    this.ctx.fill();
  };

  function apply_styles(ctx, color_stroke, color_fill, line_width) {
    ctx.save();

    if (line_width != "") {
      ctx.lineWidth = line_width;
    }
    if (color_stroke != "") {
      ctx.strokeStyle = color_stroke;
      ctx.stroke();
    }
    if (color_fill != "") {
      ctx.fillStyle = color_fill;
      ctx.fill();
    }
    ctx.restore();

  }
  MCanvas.prototype.drawArc = function (
    center, radius,
    start_angle, end_angle,
    color_stroke,
    color_fill,
    line_width
  ) {
    this.ctx.beginPath();
    this.ctx.moveTo(center.x, center.y);
    this.ctx.arc(center.x, center.y, radius, start_angle, end_angle, true);

    apply_styles(this.ctx, color_stroke, color_fill, line_width);
  };

  MCanvas.prototype.drawCircle = function (x, y, radius, color_stroke, color_fill, line_width) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    apply_styles(this.ctx, color_stroke, color_fill, line_width);
  };

  MCanvas.prototype.drawRing = function (x, y, radius, color_stroke, color_fill, line_width) {
    this.drawCircle(x, y, radius, color_stroke, color_fill, line_width);
  };


  /**
   *   draw point with text and circle around it.
   */
  MCanvas.prototype.drawPoint = function (x, y, radius, text) {
    this.ctx.beginPath();
    this.ctx.strokeStyle = "grey";
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI, false);

    //draw the circle
    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = null; //"red";
    this.ctx.stroke();
    this.ctx.fillStyle = "darkgrey";
    this.ctx.fill();
    // text
    this.ctx.font = "12px sans-serif";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillStyle = "#384047"; // darkish
    this.ctx.fillText(text, x, y);
  };

  MCanvas.prototype.drawText = function (x, y, text, font, color, maxWidth, separator) {
    var word_separator = " ";
    if (separator) {
      word_separator = separator;
    }

    this.ctx.font = font;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillStyle = color;

    //  var alphabet = "M"; //"ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz";
    var lineHeight = getLineHeight(text, font);

    var words = text.split(word_separator);
    var line = "";

    for (var i = 0; i < words.length; i++) {
      var testLine = line + words[i] + " ";
      var metrics = this.ctx.measureText(testLine);
      var testWidth = metrics.width;
      if (testWidth > maxWidth && i > 0) {
        this.ctx.fillText(line, x, y);
        line = words[i] + " ";
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    this.ctx.fillText(line, x, y);
  };

  MCanvas.prototype.clear = function () {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };

  MCanvas.prototype.addEventListener = function (type, listener) {
    this.canvas.addEventListener(type, listener);
  };

  MCanvas.prototype.setCursor = function (cursor) {
    this.canvas.style.cursor = cursor;
  };

  // Return the constructor
  return MCanvas;
})();
/*
window.addEventListener("resize", resizeCanvas, false);
*/
window.addEventListener("load", function () {
  console.log("Canvas is fully loaded");
  //	resizeCanvas();
},
  false
);


/*
 *  Calculate the Height of text with the specified font
 *
 *
 *   [font style] [font weight] [font size] [font face]
 *
 *   Example: f
*/
function getLineHeight(txt, font) {
  var el = document.createElement("div");

  el.style.cssText =
    "position:fixed;padding:0;left:-9999px;top:-9999px;" +
    "font: " +
    font +
    ";";
  //console.log("cssText= " + el.style.cssText);
  el.textContent = txt;
  document.body.appendChild(el);
  var height = parseInt(getComputedStyle(el).getPropertyValue("height"), 10);
  document.body.removeChild(el);

  return height;
}

