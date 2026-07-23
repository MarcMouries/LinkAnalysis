// =============================================================
//  link-analysis — public API (ES module barrel)
// -------------------------------------------------------------
//  Layout algorithms (ForceDirected, RadialLayout, TreeLayout) live in the
//  GraphJS engine and are consumed from there, e.g.
//      import { RadialLayout, ForceDirected } from "graphjs";
//  LinkAnalysis owns the domain layer: the data model, geometry helpers and
//  (upcoming) POLE templates, presets and the ServiceNow data adapter.
// =============================================================
export { Graph, Node, Link } from "./Graph.js";
export { NONE, pi } from "./Constants.js";
export * from "./trigo.js";
export {
	transformServiceNowData,
	validatePOLEData,
	POLE_NODE_TYPES,
	POLE_EDGE_TYPES,
} from "./data-adapter.js";

export const version = "1.0.0";
