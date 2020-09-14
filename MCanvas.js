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

// =============================================================
//                          CANVAS
// =============================================================

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

function drawLine(x1, y1, x2, y2) {
	thisCanvas.ctx.beginPath();
	thisCanvas.ctx.moveTo(x1, y1);
	thisCanvas.ctx.lineTo(x2, y2);
	thisCanvas.ctx.stroke();
}

resizeCanvas = function () {
	var rect = thisCanvas.getBoundingClientRect();
	thisCanvas.width = rect.width * mcanvas.dpr;
	thisCanvas.height = rect.height * mcanvas.dpr;
	var mcanvas = this;
	//  this.canvas.width = this.rect.width;
	//  this.canvas.height = this.rect.height;
	thisCanvas.ctx.scale(mcanvas.dpr, mcanvas.dpr);
	//      this.canvas.style.width = this.rect.width + 'px';
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
		"Canvas (px): " + mcanvas.canvas.width + " x " + mcanvas.canvas.height;
	console.log(resizeText);
	mcanvas.ctx.textAlign = "center";
	mcanvas.ctx.fillStyle = "white"; //white
	mcanvas.ctx.fillText(resizeText, width / 2, height / 2);

	drawLine(0, 0, width, height);
	drawLine(0, height, width, 0);
};

function MCanvas({
	container
}) {
	var thisCanvas = (this.canvas = document.createElement("canvas"));
	this.canvas.style.width = "100%";
	this.canvas.style.height = "100%";
	container.appendChild(this.canvas);
	this.ctx = this.canvas.getContext("2d");
	this.dpr = window.devicePixelRatio || 1;
	//  this.dpr = 1;
	var rect = thisCanvas.getBoundingClientRect();
	thisCanvas.width = rect.width * this.dpr;
	thisCanvas.height = rect.height * this.dpr;
	this.ctx.scale(this.dpr, this.dpr);
	this.canvas.style.width = rect.width + "px";
	this.canvas.style.height = rect.height + "px";
	//
	console.log("MCanvas");
	console.log(container);
	console.log("MCanvas = " + thisCanvas.width + "x" + thisCanvas.height);

	this.margin = {
		top: 00,
		right: 00,
		bottom: 00,
		left: 00
	};
	this.width = this.canvas.width - this.margin.left - this.margin.right;
	this.height = this.canvas.height - this.margin.top - this.margin.bottom;
}

MCanvas.prototype.getContext = function () {
	return this.ctx;
};

MCanvas.prototype.getHeight = function () {
	return this.canvas.height / this.dpr;
};
MCanvas.prototype.getWidth = function () {
	return this.canvas.width / this.dpr;
};

MCanvas.prototype.getCenter = function () {
	var cx = this.getWidth() / 2;
	var cy = this.getHeight() / 2;
	return {
		x: cx,
		y: cy
	};
};

MCanvas.prototype.drawLine = function (
	startX,
	startY,
	endX,
	endY,
	strokeStyle,
	lineWidth
) {
	if (strokeStyle != null) this.ctx.strokeStyle = strokeStyle;
	if (lineWidth != null) this.ctx.lineWidth = lineWidth;
	this.ctx.beginPath();
	this.ctx.moveTo(startX, startY);
	this.ctx.lineTo(endX, endY);
	this.ctx.stroke();
	this.ctx.closePath();
};

MCanvas.prototype.drawTextBG = function (
	txt,
	x,
	y,
	font,
	padding,
	background_color
) {
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

MCanvas.prototype.drawBorder = function (background_color) {
	this.ctx.rect(this.margin.left, this.margin.top, this.width, this.height);
	this.ctx.fillStyle = "#F5F5F5";
	//this.ctx.shadowColor = "black";
	//this.ctx.shadowBlur = 2;
	//this.ctx.shadowOffsetX = 0;
	//this.ctx.shadowOffsetY = 0;
	this.ctx.fill();
};

function apply_styles(ctx, color_stroke, color_fill, line_width) {
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
}
MCanvas.prototype.drawArc = function (
	center,
	radius,
	start_angle,
	end_angle,
	color_stroke,
	color_fill,
	line_width
) {
	this.ctx.beginPath();
	this.ctx.moveTo(center.x, center.y);
	this.ctx.arc(center.x, center.y, radius, start_angle, end_angle, false);
	this.ctx.lineWidth = 3;

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

// draw point with text and circle around it.
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
	//this.ctx.textAlign = "center";
	this.ctx.textBaseline = "middle";
	this.ctx.fillStyle = "#384047"; // darkish
	this.ctx.fillText(text, x, y + radius + 20);
};
MCanvas.prototype.drawText = function (
	x,
	y,
	text,
	font,
	color,
	maxWidth,
	separator
) {
	var word_separator = " ";
	if (separator) {
		word_separator = separator;
	}

	this.ctx.font = font;
	this.ctx.textAlign = "center";
	this.ctx.textBaseline = "middle";
	this.ctx.fillStyle = color;

	//      var alphabet = "M"; //"ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz";
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

//this.resizeCanvas();

/*
window.addEventListener("resize", resizeCanvas, false);
*/
window.addEventListener(
	"load",
	function () {
		console.log("Canvas is fully loaded");
		//	resizeCanvas();
	},
	false
);