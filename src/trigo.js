// =============================================================
//                          TRIGO FUNCTIONS
// =============================================================

/**
 * Concernt mouse (x, y) relative to the center of the circle
 */
function ConvertMousePositionToCoordinateGraph(mousePos, center) {
  return {
    x: mousePos.x - center.x,
    y: -1 * (mousePos.y - center.y)
  }
}

function to_radians(degrees) {
  return degrees * (Math.PI / 180);
}

function to_degrees(radians) {
  return radians * (180 / Math.PI);
}

function distanceXY(x0, y0, x1, y1) {
  var dx = x1 - x0;
  var dy = y1 - y0;
  return Math.sqrt(dx * dx + dy * dy);
}

function pointInCircle(point, circle) {
  return distanceXY(point.x, point.y, circle.x, circle.y) < circle.radius;
}

/**
 * Convert from cartesian coordinates (x, y) to polar coordinates (r, θ).
 * @param {*} cx 
 * @param {*} cy 
 * @param {*} r 
 * @param {*} angle 
 * @returns 
 */
function getPointOnArc(cx, cy, r, angle) {
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle)
  };
}
function __getPointOnArc(point, r, angle) {
  return {
    x: point.x + r * Math.cos(angle),
    y: point.y + r * Math.sin(angle)
  };

}
function rotate(x, y, angle) {
  return {
    x: x * Math.cos(angle) - y * Math.sin(angle),
    y: x * Math.sin(angle) + y * Math.cos(angle)
  };
}

/*
 * Returns the angle θ between 2 points
 */
function findAngle(p1, p2) {
  var angleRAD = Math.atan2(p2.y - p1.y, p2.x - p1.x);
  return angleRAD;
}

/**
 * Calculates the midpoint between two points [x1,y1] &  [x2,y2]
 */
function midpoint(x1, y1, x2, y2) {
  return {
    x: (x1 + x2) / 2, 
    y: (y1 + y2) / 2
  };
}


//bearing between the compass'center point and the specified point
function __getBearing(point) {
  var compass_points = ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "N"];
  var bearing = findAngle(
    { x: this.cx, y: -this.cy },
    { x: point.x, y: -point.y });

  if (bearing < 0) var bearingTT = 360 + bearing; else
    var bearingTT = bearing;

  var compass_lookup = Math.round(bearingTT / 45);
  log(bearingTT + " " + compass_lookup + " - " + bearing);
  return compass_points[compass_lookup];
}



/**
 *
 *
 *    x,y
 *    ┌────────────────────────┐ width
 *    │  x,y             width │
 *    │  ┌──────────────────┐  │
 *    │  │                  │  │
 *    │  │                  │  │
 *    │  │                  │  │
 *    │  └──────────────────┘  │
 *    │                  heigth│
 *    └────────────────────────┘ heigth

 * @param {*} rect1 
 * @param {*} rect2 
 * @returns 
 */
function rectContainsRect(shape1, rect2) {
  console.log("rectContainsRect");
 // console.log(rect1.toStringCoordinates());
 // console.log(rect2.toStringCoordinates());

  var result_X = (rect1.getX()) < (rect2.getX()) &&
  (rect1.getX() + rect1.getWidth()) < (rect2.getX() + rect2.getWidth());

  var result_Y = (rect1.getY()) > (rect2.getY()) &&
    (rect1.getY() + rect1.getHeight()) <= (rect2.getY() + rect2.getHeight());
  

  return result_X & result_Y;
}