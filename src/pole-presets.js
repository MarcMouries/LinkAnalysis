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

// Entity glyphs as SVG inner markup on a 24x24 grid, filled with `currentColor`.
// (fill-rule:evenodd where a shape needs a hole, e.g. handcuffs / briefcase handle.)
export const POLE_NODE_ICONS = {
	person: `<circle cx="12" cy="8.4" r="4"/><path d="M4.6 20.4c0-4.2 3.3-6.8 7.4-6.8s7.4 2.6 7.4 6.8z"/>`,
	location: `<path d="M12 3 2.8 11.2H5.6V20.4h4.4V15.2h3.9v5.2h4.4V11.2h2.8z"/>`,
	vehicle: `<path d="M2.8 14.4v-1l1.6-4.3A2.4 2.4 0 0 1 6.7 7.5h1.5l1.4-2A2.2 2.2 0 0 1 11.4 4.6h1.9a2.2 2.2 0 0 1 1.8.9l1.5 2h1.5a2.4 2.4 0 0 1 2.3 1.6l1.5 4.3v1a.9.9 0 0 1-.9.9h-1.2a2.5 2.5 0 0 1-5 0H10a2.5 2.5 0 0 1-5 0H3.7a.9.9 0 0 1-.9-.9z"/>`,
	rap_sheet: `<g fill-rule="evenodd"><path d="M7.4 8.6a3.7 3.7 0 1 0 0 7.4 3.7 3.7 0 0 0 0-7.4zm0 2.1a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2z"/><path d="M16.6 8.6a3.7 3.7 0 1 0 0 7.4 3.7 3.7 0 0 0 0-7.4zm0 2.1a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2z"/></g><rect x="9.4" y="7.2" width="5.2" height="2.3" rx="1.15"/>`,
	case: `<path fill-rule="evenodd" d="M9.2 6V5.2A2.2 2.2 0 0 1 11.4 3h1.2a2.2 2.2 0 0 1 2.2 2.2V6H18a2.2 2.2 0 0 1 2.2 2.2V17A2.2 2.2 0 0 1 18 19.2H6A2.2 2.2 0 0 1 3.8 17V8.2A2.2 2.2 0 0 1 6 6zm1.9 0h3.8V5.2a.4.4 0 0 0-.4-.4h-3a.4.4 0 0 0-.4.4z"/>`,
	other: `<circle cx="12" cy="12" r="4.4"/>`,
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
	const base = { ...(POLE_NODE_STYLES[type] || POLE_NODE_STYLES.other), icon: POLE_NODE_ICONS[type] || POLE_NODE_ICONS.other };
	return isSubject(node) ? { ...base, ...POLE_SUBJECT_STYLE, subject: true } : base;
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
