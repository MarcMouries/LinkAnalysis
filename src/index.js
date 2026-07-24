// =============================================================
//  link-analysis — public API (ES module barrel)
// -------------------------------------------------------------
//  LinkAnalysis owns the domain layer (data model, geometry helpers, POLE
//  data adapter). Layout algorithms live in the GraphJS engine and are
//  re-exported here for convenience, so consumers can write either
//      import { RadialLayout } from "link-analysis";   // re-exported
//      import { RadialLayout } from "graphjs";          // straight from the engine
// =============================================================
export { ForceDirected, RadialLayout, TreeLayout } from "graphjs";
export { Graph, Node, Link } from "./Graph.js";
export { NONE, pi } from "./Constants.js";
export * from "./trigo.js";
export {
	transformServiceNowData,
	validatePOLEData,
	POLE_NODE_TYPES,
	POLE_EDGE_TYPES,
} from "./data-adapter.js";
export {
	poleNodeStyle,
	poleEdgeStyle,
	applyPOLEEdgeStyles,
	POLE_NODE_STYLES,
	POLE_EDGE_STYLES,
	POLE_SUBJECT_STYLE,
} from "./pole-presets.js";

export const version = "1.0.0";
