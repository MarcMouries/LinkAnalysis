// End-to-end: LinkAnalysis's POLE domain layer feeding the GraphJS engine's
// layout algorithms, imported from the published `graphjs` package.
import { test, expect, describe } from "bun:test";
import { Graph, RadialLayout, ForceDirected } from "graphjs";
import * as LinkAnalysis from "../src/index.js";
import { transformServiceNowData } from "../src/data-adapter.js";

describe("public barrel", () => {
	test("re-exports the GraphJS engine layouts alongside the domain API", () => {
		expect(typeof LinkAnalysis.RadialLayout).toBe("function");
		expect(typeof LinkAnalysis.ForceDirected).toBe("function");
		expect(typeof LinkAnalysis.TreeLayout).toBe("function");
		// domain layer
		expect(typeof LinkAnalysis.Graph).toBe("function");
		expect(typeof LinkAnalysis.transformServiceNowData).toBe("function");
	});
});

const POLE_INPUT = {
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

describe("LinkAnalysis domain adapter + GraphJS engine", () => {
	test("POLE data loads into the engine's Graph with edge metadata", () => {
		const g = new Graph();
		g.loadJSON(transformServiceNowData(POLE_INPUT));
		expect(g.getNodeCount()).toBe(3);
		expect(g.getLinkCount()).toBe(2);
		// Link metadata parsed by the engine from the adapter's output.
		const address = g.linkList.find((l) => l.target.id === "2");
		expect(address.type).toBe("address");
		expect(address.label).toBe("Known Address");
	});

	test("GraphJS RadialLayout centers the subject and rings its relations", () => {
		const g = new Graph();
		g.loadJSON(transformServiceNowData(POLE_INPUT));
		const center = { x: 400, y: 300 };
		new RadialLayout(g, { centerNode: "1", ringSpacing: 150, center }).run();

		const subject = g.getNode("1");
		expect(subject.x).toBe(400);
		expect(subject.y).toBe(300);
		for (const id of ["2", "3"]) {
			const r = Math.hypot(g.getNode(id).x - center.x, g.getNode(id).y - center.y);
			expect(Math.abs(r - 150)).toBeLessThan(1e-6);
		}
	});

	test("GraphJS ForceDirected converges on the adapted POLE graph", () => {
		const g = new Graph();
		g.loadJSON(transformServiceNowData(POLE_INPUT));
		const layout = new ForceDirected(g, { center: { x: 0, y: 0 } });
		let ended = false;
		layout.on("end", () => (ended = true));
		layout.pinNode("1", 0, 0); // pin the subject
		layout.start();
		expect(ended).toBe(true);
		expect(g.getNode("1").x).toBe(0); // stayed pinned
	});
});
