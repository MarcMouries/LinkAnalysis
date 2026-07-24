import { test, expect, describe } from "bun:test";
import { Graph } from "graphjs";
import { poleLegend, POLE_NODE_STYLES, POLE_EDGE_STYLES } from "../src/pole-presets.js";
import { transformServiceNowData } from "../src/data-adapter.js";

describe("poleLegend", () => {
	test("with no graph lists every known type", () => {
		const legend = poleLegend();
		expect(legend.nodes.map((n) => n.type)).toEqual(Object.keys(POLE_NODE_STYLES));
		expect(legend.edges.map((e) => e.type)).toEqual(Object.keys(POLE_EDGE_STYLES));
		expect(legend.subject).toBeNull();
	});

	test("uses preset colours and human-readable labels", () => {
		const legend = poleLegend();
		const person = legend.nodes.find((n) => n.type === "person");
		expect(person.label).toBe("Person");
		expect(person.color).toBe(POLE_NODE_STYLES.person.fill);
		const arrest = legend.edges.find((e) => e.type === "arrest");
		expect(arrest.label).toBe("Arrest");
		expect(arrest.dashArray).toBe("5,3");
	});

	test("derives only the types present in a graph (canonical order)", () => {
		const g = new Graph();
		g.loadJSON(
			transformServiceNowData({
				nodes: [
					{ id: "1", type: "person", is_subject: true },
					{ id: "2", type: "location" },
				],
				edges: [{ source: "1", target: "2", type: "address" }],
			}),
		);
		const legend = poleLegend({ graph: g });
		expect(legend.nodes.map((n) => n.type)).toEqual(["person", "location"]);
		expect(legend.edges.map((e) => e.type)).toEqual(["address"]);
	});

	test("includes a Subject entry when the graph has a subject", () => {
		const g = new Graph();
		g.loadJSON(transformServiceNowData({ nodes: [{ id: "1", type: "person", is_subject: true }], edges: [] }));
		expect(poleLegend({ graph: g }).subject).toMatchObject({ label: "Subject" });

		const g2 = new Graph();
		g2.loadJSON(transformServiceNowData({ nodes: [{ id: "1", type: "person" }], edges: [] }));
		expect(poleLegend({ graph: g2 }).subject).toBeNull();
	});
});
