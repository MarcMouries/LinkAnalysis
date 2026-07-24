import { test, expect, describe } from "bun:test";
import { Graph } from "graphjs";
import {
	poleNodeStyle,
	poleEdgeStyle,
	applyPOLEEdgeStyles,
	poleRingOf,
	POLE_REL_RINGS,
	POLE_EDGE_STYLES,
	POLE_NODE_STYLES,
} from "../src/pole-presets.js";
import { RadialLayout } from "graphjs";
import { transformServiceNowData } from "../src/data-adapter.js";

describe("poleEdgeStyle", () => {
	test("returns the preset for a known relationship type", () => {
		expect(poleEdgeStyle({ type: "arrest" })).toEqual(POLE_EDGE_STYLES.arrest);
		expect(poleEdgeStyle({ type: "family" }).color).toBe(POLE_EDGE_STYLES.family.color);
	});

	test("arrest edges are dashed, family edges are not", () => {
		expect(poleEdgeStyle({ type: "arrest" }).dashArray).toBe("5,3");
		expect(poleEdgeStyle({ type: "family" }).dashArray).toBeNull();
	});

	test("falls back to 'other' for unknown / missing types", () => {
		expect(poleEdgeStyle({ type: "nonsense" })).toEqual(POLE_EDGE_STYLES.other);
		expect(poleEdgeStyle({})).toEqual(POLE_EDGE_STYLES.other);
	});

	test("reads the type from a GraphJS link (payload under .data)", () => {
		expect(poleEdgeStyle({ data: { type: "address" } }).color).toBe(POLE_EDGE_STYLES.address.color);
	});
});

describe("poleNodeStyle", () => {
	test("returns the preset for a known entity type", () => {
		expect(poleNodeStyle({ type: "location" }).shape).toBe("hexagon");
		expect(poleNodeStyle({ type: "person" }).fill).toBe(POLE_NODE_STYLES.person.fill);
	});

	test("falls back to 'other' for unknown types", () => {
		expect(poleNodeStyle({ type: "alien" })).toMatchObject(POLE_NODE_STYLES.other);
	});

	test("adds subject emphasis for the investigation subject", () => {
		const style = poleNodeStyle({ type: "person", is_subject: true });
		expect(style.subject).toBe(true);
		expect(style.sizeMultiplier).toBeGreaterThan(1);
		expect(style.glow).toBe(true);
	});

	test("non-subject nodes carry no subject emphasis", () => {
		expect(poleNodeStyle({ type: "person" }).subject).toBeUndefined();
	});

	test("includes an SVG icon for the entity type", () => {
		expect(poleNodeStyle({ type: "person" }).icon).toContain("<");
		expect(poleNodeStyle({ type: "vehicle" }).icon).toContain("path");
		expect(poleNodeStyle({ type: "weird" }).icon).toBe(POLE_NODE_STYLES.other && poleNodeStyle({ type: "other" }).icon);
	});

	test("styles the richer POLE classes with a colour + icon", () => {
		for (const t of ["weapon", "phone", "account", "organization", "premises", "seizure"]) {
			const s = poleNodeStyle({ type: t });
			expect(s.fill).toBeDefined();
			expect(s.stroke).toBeDefined();
			expect(s.icon).toContain("<");
		}
	});
});

describe("poleRingOf (POLE radial preset)", () => {
	test("maps a relationship type to its ring", () => {
		expect(poleRingOf({}, { link: { type: "family" }, depth: 9 })).toBe(POLE_REL_RINGS.family);
		expect(poleRingOf({}, { link: { type: "arrest" }, depth: 9 })).toBe(POLE_REL_RINGS.arrest);
	});

	test("reads the type from a GraphJS link payload (.data.type)", () => {
		expect(poleRingOf({}, { link: { data: { type: "associate" } }, depth: 9 })).toBe(POLE_REL_RINGS.associate);
	});

	test("falls back to BFS depth for unknown / missing link types", () => {
		expect(poleRingOf({}, { link: { type: "mystery" }, depth: 4 })).toBe(4);
		expect(poleRingOf({}, { link: null, depth: 2 })).toBe(2);
	});

	test("drives RadialLayout: kin and arrests land on their preset rings", () => {
		const g = new Graph();
		g.loadJSON({
			nodes: [{ id: "S", is_subject: true }, { id: "w" }, { id: "rap" }],
			links: [
				{ source: "S", target: "w", type: "family" },
				{ source: "S", target: "rap", type: "arrest" },
			],
		});
		const center = { x: 0, y: 0 };
		const ringSpacing = 100;
		new RadialLayout(g, { centerNode: "S", ringSpacing, center, ringOf: poleRingOf }).run();
		const r = (id) => Math.hypot(g.getNode(id).x, g.getNode(id).y);
		expect(Math.abs(r("w") - POLE_REL_RINGS.family * ringSpacing)).toBeLessThan(1e-6);
		expect(Math.abs(r("rap") - POLE_REL_RINGS.arrest * ringSpacing)).toBeLessThan(1e-6);
	});
});

describe("applyPOLEEdgeStyles (adapter → engine → styling)", () => {
	test("themes a loaded graph's links from their relationship type", () => {
		const graphData = transformServiceNowData({
			nodes: [
				{ id: "1", type: "person", is_subject: true },
				{ id: "2", type: "location" },
				{ id: "3", type: "rap_sheet" },
			],
			edges: [
				{ source: "1", target: "2", type: "address" },
				{ source: "1", target: "3", type: "arrest" },
			],
		});
		const graph = new Graph();
		graph.loadJSON(graphData);
		applyPOLEEdgeStyles(graph);

		const address = graph.linkList.find((l) => l.target.id === "2");
		const arrest = graph.linkList.find((l) => l.target.id === "3");
		expect(address.color).toBe(POLE_EDGE_STYLES.address.color);
		expect(arrest.color).toBe(POLE_EDGE_STYLES.arrest.color);
		expect(arrest.dashArray).toBe("5,3");
	});
});
