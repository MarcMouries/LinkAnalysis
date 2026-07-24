// =============================================================
//                     POLE style presets
// -------------------------------------------------------------
//  Domain layer: how POLE entities and relationships look.
//   * node styles by entity type (person / location / ...)
//   * edge styles by relationship type (family / associate / ...)
//  The edge styles map onto the GraphJS `Link` metadata fields
//  (color / width / dashArray), so `applyPOLEEdgeStyles(graph)` themes a graph
//  that was loaded from `transformServiceNowData(...)` output.
// =============================================================

// Edge appearance per relationship type (dark-theme intelligence palette).
export const POLE_EDGE_STYLES = {
	family: { color: "#58a6ff", width: 2.5, dashArray: null },
	associate: { color: "#3fb950", width: 2, dashArray: null },
	address: { color: "#d29922", width: 1.5, dashArray: null },
	arrest: { color: "#f85149", width: 2, dashArray: "5,3" },
	other: { color: "#8b949e", width: 1.5, dashArray: null },
};

// Node appearance per entity type.
export const POLE_NODE_STYLES = {
	person: { shape: "rect", fill: "#1f6feb", stroke: "#58a6ff" },
	location: { shape: "hexagon", fill: "#238636", stroke: "#3fb950" },
	rap_sheet: { shape: "circle", fill: "#9e6a03", stroke: "#d29922" },
	vehicle: { shape: "rect", fill: "#8957e5", stroke: "#a371f7" },
	case: { shape: "circle", fill: "#6e7681", stroke: "#c9d1d9" },
	other: { shape: "circle", fill: "#30363d", stroke: "#8b949e" },
};

// Extra emphasis applied to the investigation's subject node.
export const POLE_SUBJECT_STYLE = { sizeMultiplier: 1.3, glow: true, stroke: "#f78166" };

// Read a `type` from either a flat object (adapter output) or a GraphJS
// node/link where the payload sits under `.data`.
function typeOf(entity) {
	return entity?.type ?? entity?.data?.type ?? "other";
}
function isSubject(node) {
	return !!(node?.is_subject ?? node?.data?.is_subject);
}

/** Resolve the edge style for a link (falls back to the "other" preset). */
export function poleEdgeStyle(link) {
	const type = typeOf(link);
	return POLE_EDGE_STYLES[type] || POLE_EDGE_STYLES.other;
}

/**
 * Resolve the node style for a node (falls back to "other"). Subject nodes get
 * the subject emphasis merged in (larger, glow, distinct stroke).
 */
export function poleNodeStyle(node) {
	const type = typeOf(node);
	const base = POLE_NODE_STYLES[type] || POLE_NODE_STYLES.other;
	return isSubject(node) ? { ...base, ...POLE_SUBJECT_STYLE, subject: true } : { ...base };
}

/**
 * Theme a graph's links in place from their relationship type, writing the
 * GraphJS `Link` metadata fields (color / width / dashArray). Returns the graph.
 */
export function applyPOLEEdgeStyles(graph) {
	const links = graph.linkList || (graph.getLinks && graph.getLinks()) || [];
	for (const link of links) {
		const style = poleEdgeStyle(link);
		link.color = style.color;
		link.width = style.width;
		link.dashArray = style.dashArray;
	}
	return graph;
}
