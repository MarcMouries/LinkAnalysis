// =============================================================
//                          TRIGO FUNCTIONS
// -------------------------------------------------------------
//  Pure trigonometry / geometry helpers (ES module).
// =============================================================

/** Convert a mouse (x, y) to coordinates relative to the center of a circle. */
export function convertMousePositionToCoordinateGraph(mousePos, center) {
	return {
		x: mousePos.x - center.x,
		y: -1 * (mousePos.y - center.y),
	};
}

export function to_radians(degrees) {
	return degrees * (Math.PI / 180);
}

export function to_degrees(radians) {
	return radians * (180 / Math.PI);
}

export function distanceXY(x0, y0, x1, y1) {
	const dx = x1 - x0;
	const dy = y1 - y0;
	return Math.sqrt(dx * dx + dy * dy);
}

export function pointInCircle(point, circle) {
	return distanceXY(point.x, point.y, circle.x, circle.y) < circle.radius;
}

/**
 * Point on a circle of radius `r` centered at (cx, cy) at the given angle.
 */
export function getPointOnArc(cx, cy, r, angle) {
	return {
		x: cx + r * Math.cos(angle),
		y: cy + r * Math.sin(angle),
	};
}

/** Rotate the vector (x, y) by `angle` radians about the origin. */
export function rotate(x, y, angle) {
	return {
		x: x * Math.cos(angle) - y * Math.sin(angle),
		y: x * Math.sin(angle) + y * Math.cos(angle),
	};
}

/** Angle (radians) of the vector from p1 to p2. */
export function findAngle(p1, p2) {
	return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

/** Midpoint between (x1, y1) and (x2, y2). */
export function midpoint(x1, y1, x2, y2) {
	return {
		x: (x1 + x2) / 2,
		y: (y1 + y2) / 2,
	};
}
