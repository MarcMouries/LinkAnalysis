// End-to-end POLE example: ServiceNow data → engine graph → radial layout →
// POLE styling → SVG.
//   bun run examples/pole-graph.js > examples/img/pole-graph.svg
import { Graph, RadialLayout } from "graphjs";
import { transformServiceNowData, applyPOLEEdgeStyles, poleLegend } from "../src/index.js";
import { renderPOLE } from "./render-pole.js";

// A small person-of-interest network in ServiceNow / POLE shape.
const source = {
	nodes: [
		{ id: "S", type: "person", is_subject: true, first_name: "Eric", last_name: "Fox" },
		{ id: "w", type: "person", first_name: "Jane", last_name: "Fox" },
		{ id: "b", type: "person", first_name: "Sam", last_name: "Fox" },
		{ id: "a", type: "person", first_name: "Rick", last_name: "Vale" },
		{ id: "loc", type: "location", name: "3260 Jay St" },
		{ id: "car", type: "vehicle", name: "Plate ABC-123" },
		{ id: "rap", type: "rap_sheet", name: "2020-01-30" },
	],
	edges: [
		{ source: "S", target: "w", type: "family", label: "Wife" },
		{ source: "S", target: "b", type: "family", label: "Brother" },
		{ source: "S", target: "a", type: "associate", label: "Associate" },
		{ source: "S", target: "loc", type: "address", label: "Known Address" },
		{ source: "S", target: "car", type: "other", label: "Registered" },
		{ source: "S", target: "rap", type: "arrest", label: "Arrest" },
		{ source: "a", target: "loc", type: "address", label: "Address" },
	],
};

// Domain: validate + normalise.
const graphData = transformServiceNowData(source);

// Engine: load + lay out with the subject at the center.
const graph = new Graph();
graph.loadJSON(graphData);
new RadialLayout(graph, { centerNode: "S", ringSpacing: 180, center: { x: 0, y: 0 } }).run();

// Domain: colour the edges by relationship type (writes Link metadata).
applyPOLEEdgeStyles(graph);

// Domain: a legend derived from the entity/relationship types in this graph.
process.stdout.write(renderPOLE(graph, { legend: poleLegend({ graph }) }) + "\n");
