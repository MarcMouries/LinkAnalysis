import { test, expect, describe } from "bun:test";
import { to_radians, to_degrees, distanceXY, rotate, midpoint, getPointOnArc, findAngle } from "../src/trigo.js";

const close = (a, b, eps = 1e-9) => Math.abs(a - b) < eps;

describe("trigo", () => {
	test("degree/radian conversions round-trip", () => {
		expect(close(to_radians(180), Math.PI)).toBe(true);
		expect(close(to_degrees(Math.PI), 180)).toBe(true);
	});

	test("distanceXY is Euclidean", () => {
		expect(distanceXY(0, 0, 3, 4)).toBe(5);
	});

	test("rotate by 90 degrees maps (1,0) -> (0,1)", () => {
		const r = rotate(1, 0, Math.PI / 2);
		expect(close(r.x, 0)).toBe(true);
		expect(close(r.y, 1)).toBe(true);
	});

	test("midpoint averages coordinates", () => {
		expect(midpoint(0, 0, 10, 20)).toEqual({ x: 5, y: 10 });
	});

	test("getPointOnArc places a point at radius r", () => {
		const p = getPointOnArc(0, 0, 10, 0);
		expect(close(p.x, 10)).toBe(true);
		expect(close(p.y, 0)).toBe(true);
	});

	test("findAngle returns the direction between two points", () => {
		expect(close(findAngle({ x: 0, y: 0 }, { x: 0, y: 5 }), Math.PI / 2)).toBe(true);
	});
});
