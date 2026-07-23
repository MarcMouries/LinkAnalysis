// =============================================================
//                     POLE data adapter
// -------------------------------------------------------------
//  Domain layer: validate ServiceNow / POLE (People, Objects, Locations,
//  Events) data and transform it into the { nodes, links } shape consumed by
//  the GraphJS engine's `graph.loadJSON(...)`.
// =============================================================

export const POLE_NODE_TYPES = ["person", "location", "rap_sheet", "vehicle", "case"];
export const POLE_EDGE_TYPES = ["family", "associate", "address", "arrest", "other"];

function fullName(node) {
	const parts = [node.first_name, node.last_name].filter(Boolean);
	return parts.length ? parts.join(" ") : undefined;
}

/**
 * Validate a POLE dataset.
 * Checks: every node has an id, ids are unique, node/edge types are known,
 * and every edge references existing node ids.
 *
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validatePOLEData(input) {
	const errors = [];
	if (!input || typeof input !== "object") {
		return { valid: false, errors: ["Input must be an object with `nodes` and `edges`/`links`."] };
	}

	const nodes = input.nodes;
	const edges = input.edges ?? input.links;
	if (!Array.isArray(nodes)) errors.push("`nodes` must be an array.");
	if (edges !== undefined && !Array.isArray(edges)) errors.push("`edges`/`links` must be an array.");

	const ids = new Set();
	(Array.isArray(nodes) ? nodes : []).forEach((node, i) => {
		if (node == null || typeof node !== "object") {
			errors.push(`Node at index ${i} must be an object.`);
			return;
		}
		if (node.id === undefined || node.id === null || node.id === "") {
			errors.push(`Node at index ${i} is missing an id.`);
		} else if (ids.has(node.id)) {
			errors.push(`Duplicate node id: "${node.id}".`);
		} else {
			ids.add(node.id);
		}
		if (node.type != null && !POLE_NODE_TYPES.includes(node.type)) {
			errors.push(`Node "${node.id ?? i}" has invalid type "${node.type}". Expected one of: ${POLE_NODE_TYPES.join(", ")}.`);
		}
	});

	(Array.isArray(edges) ? edges : []).forEach((edge, i) => {
		if (edge == null || typeof edge !== "object") {
			errors.push(`Edge at index ${i} must be an object.`);
			return;
		}
		if (edge.source === undefined || edge.source === null) {
			errors.push(`Edge at index ${i} is missing a source.`);
		} else if (!ids.has(edge.source)) {
			errors.push(`Edge at index ${i} references unknown source "${edge.source}".`);
		}
		if (edge.target === undefined || edge.target === null) {
			errors.push(`Edge at index ${i} is missing a target.`);
		} else if (!ids.has(edge.target)) {
			errors.push(`Edge at index ${i} references unknown target "${edge.target}".`);
		}
		if (edge.type != null && !POLE_EDGE_TYPES.includes(edge.type)) {
			errors.push(`Edge at index ${i} has invalid type "${edge.type}". Expected one of: ${POLE_EDGE_TYPES.join(", ")}.`);
		}
	});

	return { valid: errors.length === 0, errors };
}

/**
 * Transform a ServiceNow / POLE dataset into `{ nodes, links }` ready for
 * `graph.loadJSON(...)`. `edges` are normalised to `links`, node names are
 * derived from first/last name when absent, and types default sensibly.
 *
 * @param {object} input
 * @param {{ validate?: boolean }} [options] validate defaults to true and
 *        throws an Error listing every problem when the data is invalid.
 * @returns {{ nodes: object[], links: object[] }}
 */
export function transformServiceNowData(input, options = {}) {
	const { validate = true } = options;
	if (validate) {
		const result = validatePOLEData(input);
		if (!result.valid) {
			throw new Error("Invalid POLE data:\n - " + result.errors.join("\n - "));
		}
	}

	const rawNodes = (input && input.nodes) || [];
	const rawEdges = (input && (input.edges ?? input.links)) || [];

	const nodes = rawNodes.map((node) => ({
		id: node.id,
		type: node.type || "other",
		is_subject: !!node.is_subject,
		name: node.name || fullName(node) || String(node.id),
		first_name: node.first_name,
		last_name: node.last_name,
		photo: node.photo,
		relationship: node.relationship,
		table: node.table,
	}));

	const links = rawEdges.map((edge) => ({
		source: edge.source,
		target: edge.target,
		label: edge.label ?? "",
		type: edge.type || "other",
	}));

	return { nodes, links };
}
