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

// Human-readable labels for the legend.
export const POLE_NODE_LABELS = {
	person: "Person",
	location: "Location",
	rap_sheet: "Rap Sheet",
	vehicle: "Vehicle",
	case: "Case",
	other: "Other",
};
export const POLE_EDGE_LABELS = {
	family: "Family",
	associate: "Associate",
	address: "Address",
	arrest: "Arrest",
	other: "Other",
};

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

// Return the entity/relationship types present in a graph, in canonical order.
function presentTypes(entities, styleMap) {
	const seen = new Set((entities || []).map(typeOf));
	return Object.keys(styleMap).filter((t) => seen.has(t));
}

/**
 * Build a legend from the POLE presets. Pass a `graph` to include only the
 * entity/relationship types actually present (plus a Subject entry when the
 * graph has one); otherwise every known type is listed.
 *
 * @returns {{ nodes: Array, edges: Array, subject: object|null }}
 */
export function poleLegend(options = {}) {
	const { graph } = options;
	let nodeTypes = options.nodeTypes;
	let edgeTypes = options.edgeTypes;
	let hasSubject = false;

	if (graph) {
		const nodes = graph.getNodes ? graph.getNodes() : [];
		const links = graph.linkList || (graph.getLinks && graph.getLinks()) || [];
		nodeTypes = nodeTypes || presentTypes(nodes, POLE_NODE_STYLES);
		edgeTypes = edgeTypes || presentTypes(links, POLE_EDGE_STYLES);
		hasSubject = nodes.some(isSubject);
	}
	nodeTypes = nodeTypes || Object.keys(POLE_NODE_STYLES);
	edgeTypes = edgeTypes || Object.keys(POLE_EDGE_STYLES);

	return {
		nodes: nodeTypes.map((type) => {
			const style = POLE_NODE_STYLES[type] || POLE_NODE_STYLES.other;
			return { type, label: POLE_NODE_LABELS[type] || type, color: style.fill, shape: style.shape };
		}),
		edges: edgeTypes.map((type) => {
			const style = POLE_EDGE_STYLES[type] || POLE_EDGE_STYLES.other;
			return { type, label: POLE_EDGE_LABELS[type] || type, color: style.color, dashArray: style.dashArray };
		}),
		subject: hasSubject ? { label: "Subject", stroke: POLE_SUBJECT_STYLE.stroke } : null,
	};
}
