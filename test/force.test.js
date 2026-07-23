import { test, expect, describe } from "bun:test";
import { Graph } from "../src/Graph.js";
import { ForceLayout } from "../src/layout/ForceLayout.js";

function twoLinkedNodes(distance = 180) {
	const g = new Graph();
	g.loadJSON({
		nodes: [{ id: "a" }, { id: "b" }],
		links: [{ source: "a", target: "b" }],
	});
	return new ForceLayout(g, { linkDistance: distance, center: { x: 0, y: 0 } });
}

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

describe("ForceLayout — lifecycle & events", () => {
	test("start() converges headlessly and fires start/tick/end", () => {
		const layout = twoLinkedNodes();
		const events = { start: 0, tick: 0, end: 0 };
		layout.on("start", () => events.start++);
		layout.on("tick", () => events.tick++);
		layout.on("end", () => events.end++);

		layout.start();

		expect(events.start).toBe(1);
		expect(events.tick).toBeGreaterThan(1);
		expect(events.end).toBe(1);
		expect(layout.alpha).toBeLessThan(layout.options.alphaMin);
	});

	test("tick passes nodes and links to listeners", () => {
		const layout = twoLinkedNodes();
		let received = null;
		layout.on("tick", (nodes, links) => (received = { nodes, links }));
		layout.tick();
		expect(received.nodes).toHaveLength(2);
		expect(received.links).toHaveLength(1);
	});

	test("off() removes a listener", () => {
		const layout = twoLinkedNodes();
		let ticks = 0;
		const onTick = () => ticks++;
		layout.on("tick", onTick);
		layout.tick();
		layout.off("tick", onTick);
		layout.tick();
		expect(ticks).toBe(1);
	});
});

describe("ForceLayout — forces", () => {
	test("a linked pair settles near the configured link distance", () => {
		const D = 180;
		const layout = twoLinkedNodes(D);
		layout.start();
		const [a, b] = layout.graph.getNodes();
		const settled = dist(a, b);
		expect(settled).toBeGreaterThan(D * 0.4);
		expect(settled).toBeLessThan(D * 2);
	});

	test("repulsion pushes two disconnected nodes apart", () => {
		const g = new Graph();
		g.loadJSON({ nodes: [{ id: "a" }, { id: "b" }], links: [] });
		const layout = new ForceLayout(g, { center: { x: 0, y: 0 } });
		const [a, b] = layout.graph.getNodes();
		a.x = 0; a.y = 0; a.vx = 0; a.vy = 0;
		b.x = 5; b.y = 0; b.vx = 0; b.vy = 0;
		const before = dist(a, b);
		layout.start();
		expect(dist(a, b)).toBeGreaterThan(before + 10);
	});
});

describe("ForceLayout — pinning", () => {
	test("pinNode holds a node fixed for the whole run", () => {
		const layout = twoLinkedNodes();
		layout.pinNode("a", 500, 400);
		layout.start();
		const a = layout.graph.getNode("a");
		expect(a.x).toBe(500);
		expect(a.y).toBe(400);
		expect(a.pos.x).toBe(500);
	});

	test("unpinNode lets forces move the node again", () => {
		const layout = twoLinkedNodes();
		layout.pinNode("a", 500, 400);
		layout.tick();
		expect(layout.graph.getNode("a").x).toBe(500);
		layout.unpinNode("a");
		layout.restart(1);
		expect(layout.graph.getNode("a").x).not.toBe(500);
	});
});

describe("ForceLayout — options", () => {
	test("linkDistance accepts a per-link function", () => {
		const layout = twoLinkedNodes();
		layout.options.linkDistance = (link) => (link.source.id === "a" ? 90 : 300);
		expect(layout._resolveLinkDistance(layout.graph.linkList[0])).toBe(90);
	});
});
