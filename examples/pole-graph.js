// End-to-end POLE example: ServiceNow data → engine graph → radial layout →
// POLE styling → SVG.
//   bun run examples/pole-graph.js > examples/img/pole-graph.svg
import { Graph, RadialLayout } from "graphjs";
import { transformServiceNowData, applyPOLEEdgeStyles, poleLegend } from "../src/index.js";
import { renderPOLE } from "./render-pole.js";

// A person-of-interest network in ServiceNow / POLE shape, exercising the full
// entity taxonomy (People · Objects · Locations · Events).
const source = {
	nodes: [
		{ id: "S", type: "person", is_subject: true, first_name: "Eric", last_name: "Fox" },
		{ id: "w", type: "person", first_name: "Jane", last_name: "Fox" },
		{ id: "a", type: "person", first_name: "Rick", last_name: "Vale" },
		{ id: "loc", type: "location", name: "3260 Jay St" },
		{ id: "car", type: "vehicle", name: "Plate ABC-123" },
		{ id: "ph", type: "phone", name: "Burner 555-0142" },
		{ id: "gun", type: "weapon", name: "Glock 19" },
		{ id: "acct", type: "account", name: "Account 7731" },
		{ id: "org", type: "organization", name: "Harbor Holdings" },
		{ id: "whse", type: "premises", name: "Pier 42 Whse" },
		{ id: "rap", type: "rap_sheet", name: "Arrest 2020-01" },
		{ id: "seiz", type: "seizure", name: "Seizure 2022" },
	],
	edges: [
		{ source: "S", target: "w", type: "family", label: "Wife" },
		{ source: "S", target: "a", type: "associate", label: "Associate" },
		{ source: "S", target: "loc", type: "address", label: "Known Address" },
		{ source: "S", target: "car", type: "other", label: "Registered" },
		{ source: "S", target: "acct", type: "other", label: "Account" },
		{ source: "S", target: "org", type: "other", label: "Director" },
		{ source: "S", target: "rap", type: "arrest", label: "Arrest" },
		{ source: "a", target: "ph", type: "other", label: "Phone" },
		{ source: "a", target: "gun", type: "other", label: "Weapon" },
		{ source: "a", target: "whse", type: "address", label: "Operates" },
		{ source: "rap", target: "seiz", type: "arrest", label: "Seizure" },
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
