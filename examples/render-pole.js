// Headless SVG renderer for the POLE example. Reads node positions (set by a
// GraphJS layout), colours nodes via poleNodeStyle and draws links from the
// GraphJS Link metadata (color / width / dashArray) set by applyPOLEEdgeStyles.
import { poleNodeStyle } from "../src/pole-presets.js";

const esc = (s) =>
	String(s).replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]));

const nameOf = (n) => (n.data && n.data.name) || n.name || n.id;

export function renderPOLE(graph, options = {}) {
	const nodes = graph.getNodes();
	const links = graph.linkList || graph.getLinks();
	const padding = options.padding ?? 90;
	const baseRadius = options.radius ?? 18;
	const background = options.background ?? "#0a0e14";

	const xs = nodes.map((n) => n.x);
	const ys = nodes.map((n) => n.y);
	const minX = Math.min(...xs);
	const minY = Math.min(...ys);
	const contentWidth = Math.round(Math.max(...xs) - minX + padding * 2);
	const legendWidth = options.legend ? 170 : 0;
	const width = contentWidth + legendWidth;
	const height = Math.round(Math.max(...ys) - minY + padding * 2);
	const X = (n) => (n.x - minX + padding).toFixed(1);
	const Y = (n) => (n.y - minY + padding).toFixed(1);

	const out = [];
	out.push(
		`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="-apple-system, Segoe UI, Roboto, sans-serif">`,
	);
	out.push(`<rect width="${width}" height="${height}" rx="12" fill="${background}"/>`);

	// Links (styled from Link metadata).
	for (const link of links) {
		const s = link.source;
		const t = link.target;
		if (!s || !t) continue;
		const dash = link.dashArray ? ` stroke-dasharray="${link.dashArray}"` : "";
		out.push(
			`<line x1="${X(s)}" y1="${Y(s)}" x2="${X(t)}" y2="${Y(t)}" stroke="${link.color || "#8b949e"}" stroke-width="${link.width || 1.5}"${dash} opacity="0.85"/>`,
		);
		if (link.label) {
			const mx = ((+X(s) + +X(t)) / 2).toFixed(1);
			const my = ((+Y(s) + +Y(t)) / 2).toFixed(1);
			out.push(`<text x="${mx}" y="${my}" fill="#adbac7" font-size="9.5" text-anchor="middle" dy="-3">${esc(link.label)}</text>`);
		}
	}

	// Nodes (coloured by POLE entity type; subject enlarged with a glow ring).
	for (const node of nodes) {
		const style = poleNodeStyle(node);
		const r = style.subject ? baseRadius * (style.sizeMultiplier || 1.3) : baseRadius;
		if (style.subject && style.glow) {
			out.push(`<circle cx="${X(node)}" cy="${Y(node)}" r="${r + 6}" fill="none" stroke="${style.stroke}" stroke-width="2" opacity="0.4"/>`);
		}
		out.push(
			`<circle cx="${X(node)}" cy="${Y(node)}" r="${r}" fill="${style.fill}" stroke="${style.stroke}" stroke-width="2"/>`,
		);
		out.push(
			`<text x="${X(node)}" y="${Y(node)}" fill="#e6edf3" font-size="11" text-anchor="middle" dy="${r + 14}">${esc(nameOf(node))}</text>`,
		);
	}

	// Optional legend panel on the right.
	if (options.legend) {
		const lx = contentWidth + 16;
		let ly = 40;
		const heading = (text) => {
			out.push(`<text x="${lx}" y="${ly}" fill="#768390" font-size="10" letter-spacing="0.5" font-weight="600">${esc(text.toUpperCase())}</text>`);
			ly += 18;
		};
		const row = (label) => {
			out.push(`<text x="${lx + 22}" y="${ly + 4}" fill="#e6edf3" font-size="11">${esc(label)}</text>`);
			ly += 22;
		};

		out.push(`<text x="${lx}" y="20" fill="#e6edf3" font-size="13" font-weight="700">Legend</text>`);

		heading("Entities");
		for (const item of options.legend.nodes) {
			out.push(`<circle cx="${lx + 7}" cy="${ly}" r="7" fill="${item.color}" stroke="#0d1117" stroke-width="1.5"/>`);
			row(item.label);
		}
		if (options.legend.subject) {
			out.push(`<circle cx="${lx + 7}" cy="${ly}" r="7" fill="none" stroke="${options.legend.subject.stroke}" stroke-width="2"/>`);
			row(options.legend.subject.label);
		}

		ly += 6;
		heading("Relationships");
		for (const item of options.legend.edges) {
			const dash = item.dashArray ? ` stroke-dasharray="${item.dashArray}"` : "";
			out.push(`<line x1="${lx}" y1="${ly}" x2="${lx + 16}" y2="${ly}" stroke="${item.color}" stroke-width="2.5"${dash}/>`);
			row(item.label);
		}
	}

	out.push(`</svg>`);
	return out.join("\n");
}
