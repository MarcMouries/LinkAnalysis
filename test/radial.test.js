import { test, expect, describe } from "bun:test";
import { Graph } from "../src/Graph.js";
import { MRadialLayout } from "../src/layout/MRadialLayout.js";

function starGraph(childCount) {
	const nodes = [{ id: "root" }];
	const links = [];
	for (let i = 0; i < childCount; i++) {
		nodes.push({ id: "c" + i });
		links.push({ source: "root", target: "c" + i });
	}
	const g = new Graph();
	g.loadJSON({ nodes, links });
	return g;
}

describe("MRadialLayout", () => {
	test("places the root at the center", () => {
		const g = starGraph(4);
		const layout = new MRadialLayout();
		const center = { x: 500, y: 300 };
		layout.Calculate_Positions(g, g.getNode("root"), center);
		const root = g.getNode("root");
		expect(root.x).toBe(500);
		expect(root.y).toBe(300);
	});

	test("places first-ring children one level-distance from the center", () => {
		const g = starGraph(4);
		const layout = new MRadialLayout();
		const center = { x: 0, y: 0 };
		layout.Calculate_Positions(g, g.getNode("root"), center);

		const D = layout.DISTANCE_BETWEEN_LEVELS;
		for (let i = 0; i < 4; i++) {
			const child = g.getNode("c" + i);
			const r = Math.hypot(child.x - center.x, child.y - center.y);
			// Even siblings sit at D, odd siblings are nudged outward to 1.3*D.
			const expected = i % 2 === 1 ? D * 1.3 : D;
			expect(Math.abs(r - expected)).toBeLessThan(1e-6);
		}
	});

	test("does nothing useful on an empty graph (guards, no throw)", () => {
		const layout = new MRadialLayout();
		expect(() => layout.Calculate_Positions(new Graph(), null, { x: 0, y: 0 })).not.toThrow();
	});
});
