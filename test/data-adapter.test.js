import { test, expect, describe } from "bun:test";
import { Graph } from "../src/Graph.js";
import { transformServiceNowData, validatePOLEData, POLE_NODE_TYPES, POLE_EDGE_TYPES } from "../src/data-adapter.js";

const validData = {
	nodes: [
		{ id: "1", type: "person", is_subject: true, first_name: "Eric", last_name: "Fox", relationship: "Subject" },
		{ id: "2", type: "location", name: "3260 Jay St, Santa Clara, CA" },
		{ id: "3", type: "rap_sheet", name: "2020-01-30" },
	],
	edges: [
		{ source: "1", target: "2", label: "Known Address", type: "address" },
		{ source: "1", target: "3", label: "Arrest", type: "arrest" },
	],
};

describe("validatePOLEData", () => {
	test("accepts a well-formed dataset", () => {
		const result = validatePOLEData(validData);
		expect(result.valid).toBe(true);
		expect(result.errors).toEqual([]);
	});

	test("flags a node with no id", () => {
		const result = validatePOLEData({ nodes: [{ type: "person" }], edges: [] });
		expect(result.valid).toBe(false);
		expect(result.errors.join()).toContain("missing an id");
	});

	test("flags duplicate node ids", () => {
		const result = validatePOLEData({ nodes: [{ id: "x" }, { id: "x" }], edges: [] });
		expect(result.errors.join()).toContain("Duplicate node id");
	});

	test("flags an invalid node type", () => {
		const result = validatePOLEData({ nodes: [{ id: "1", type: "alien" }], edges: [] });
		expect(result.errors.join()).toContain("invalid type");
	});

	test("flags an edge referencing an unknown node", () => {
		const result = validatePOLEData({ nodes: [{ id: "1" }], edges: [{ source: "1", target: "ghost" }] });
		expect(result.errors.join()).toContain('unknown target "ghost"');
	});

	test("flags an invalid edge type", () => {
		const result = validatePOLEData({
			nodes: [{ id: "1" }, { id: "2" }],
			edges: [{ source: "1", target: "2", type: "nonsense" }],
		});
		expect(result.errors.join()).toContain("invalid type");
	});

	test("exposes the known POLE vocabularies", () => {
		expect(POLE_NODE_TYPES).toContain("person");
		expect(POLE_EDGE_TYPES).toContain("arrest");
	});
});

describe("transformServiceNowData", () => {
	test("normalises edges -> links and derives names", () => {
		const { nodes, links } = transformServiceNowData(validData);
		expect(links).toHaveLength(2);
		expect(links[0]).toMatchObject({ source: "1", target: "2", label: "Known Address", type: "address" });
		// name derived from first + last when `name` is absent
		expect(nodes[0].name).toBe("Eric Fox");
		expect(nodes[0].is_subject).toBe(true);
	});

	test("defaults missing types to 'other' and keeps a stable name", () => {
		const { nodes, links } = transformServiceNowData(
			{ nodes: [{ id: "42" }], edges: [] },
			{ validate: false },
		);
		expect(nodes[0].type).toBe("other");
		expect(nodes[0].name).toBe("42");
		expect(links).toEqual([]);
	});

	test("throws with a helpful message on invalid data", () => {
		expect(() => transformServiceNowData({ nodes: [{ type: "person" }] })).toThrow(/Invalid POLE data/);
	});

	test("validate:false skips validation", () => {
		expect(() => transformServiceNowData({ nodes: [{ id: "1", type: "bogus" }], edges: [] }, { validate: false })).not.toThrow();
	});

	test("output loads cleanly into the graph engine's loadJSON", () => {
		const graphData = transformServiceNowData(validData);
		const g = new Graph();
		g.loadJSON(graphData);
		expect(g.getNodes()).toHaveLength(3);
		expect(g.getLinks()).toHaveLength(2);
		expect(g.getNode("1").data.name).toBe("Eric Fox");
	});
});
