// Headless SVG renderer for the POLE example — a holographic intelligence look.
// Nodes are dark chips ringed and iconed in their entity colour (icons from the
// POLE presets); links are drawn from the GraphJS Link metadata (color / width /
// dashArray) set by applyPOLEEdgeStyles. Pass { legend } to add a side panel.
import { poleNodeStyle } from "../src/pole-presets.js";

const esc = (s) =>
	String(s).replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]));
const nameOf = (n) => (n.data && n.data.name) || n.name || n.id;

export function renderPOLE(graph, options = {}) {
	const nodes = graph.getNodes();
	const links = graph.linkList || graph.getLinks();
	const padding = options.padding ?? 96;
	const baseRadius = options.radius ?? 22;
	const bg = options.background ?? "#0a0e17";

	const xs = nodes.map((n) => n.x);
	const ys = nodes.map((n) => n.y);
	const minX = Math.min(...xs);
	const minY = Math.min(...ys);
	const contentWidth = Math.round(Math.max(...xs) - minX + padding * 2);
	const legendWidth = options.legend ? 180 : 0;
	const width = contentWidth + legendWidth;
	const height = Math.round(Math.max(...ys) - minY + padding * 2);
	const X = (n) => +(n.x - minX + padding).toFixed(1);
	const Y = (n) => +(n.y - minY + padding).toFixed(1);
	const rOf = (n) => (poleNodeStyle(n).subject ? baseRadius * 1.35 : baseRadius);

	// centre of mass (for the ambient glow behind the subject)
	const subject = nodes.find((n) => poleNodeStyle(n).subject) || nodes[0];

	const out = [];
	out.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="-apple-system, Segoe UI, Roboto, sans-serif">`);
	out.push(`<defs>
    <filter id="glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="softglow" x="-120%" y="-120%" width="340%" height="340%"><feGaussianBlur stdDeviation="9"/></filter>
    <radialGradient id="vign" cx="${((X(subject)) / width * 100).toFixed(1)}%" cy="${((Y(subject)) / height * 100).toFixed(1)}%" r="75%">
      <stop offset="0%" stop-color="#0f1830"/><stop offset="55%" stop-color="${bg}"/><stop offset="100%" stop-color="#05070e"/></radialGradient>
    <pattern id="grid" width="42" height="42" patternUnits="userSpaceOnUse">
      <path d="M42 0H0V42" fill="none" stroke="#37e0ff" stroke-opacity="0.06" stroke-width="1"/></pattern>
  </defs>`);
	out.push(`<rect width="${width}" height="${height}" rx="14" fill="url(#vign)"/>`);
	out.push(`<rect width="${contentWidth}" height="${height}" fill="url(#grid)"/>`);
	// ambient glow behind the subject
	out.push(`<circle cx="${X(subject)}" cy="${Y(subject)}" r="150" fill="#37e0ff" opacity="0.10" filter="url(#softglow)"/>`);

	// ---- links ----
	for (const link of links) {
		const s = link.source, t = link.target;
		if (!s || !t) continue;
		const color = link.color || "#56708f";
		const dash = link.dashArray ? ` stroke-dasharray="${link.dashArray}"` : "";
		// soft glow underlay + crisp line
		out.push(`<line x1="${X(s)}" y1="${Y(s)}" x2="${X(t)}" y2="${Y(t)}" stroke="${color}" stroke-width="${(link.width || 1.6) * 3}" opacity="0.13" stroke-linecap="round"/>`);
		out.push(`<line x1="${X(s)}" y1="${Y(s)}" x2="${X(t)}" y2="${Y(t)}" stroke="${color}" stroke-width="${link.width || 1.6}"${dash} opacity="0.9" stroke-linecap="round"/>`);
	}
	// link labels (drawn above the lines, below the nodes)
	for (const link of links) {
		if (!link.label) continue;
		const s = link.source, t = link.target;
		const mx = (X(s) + X(t)) / 2, my = (Y(s) + Y(t)) / 2;
		const w = link.label.length * 5.6 + 12;
		out.push(`<rect x="${(mx - w / 2).toFixed(1)}" y="${(my - 8).toFixed(1)}" width="${w.toFixed(1)}" height="15" rx="7.5" fill="#0a0e17" opacity="0.82"/>`);
		out.push(`<text x="${mx.toFixed(1)}" y="${my.toFixed(1)}" fill="#9fc6dd" font-size="9.5" text-anchor="middle" dominant-baseline="central" font-family="ui-monospace, monospace">${esc(link.label)}</text>`);
	}

	// ---- nodes ----
	for (const node of nodes) {
		const style = poleNodeStyle(node);
		const color = style.stroke; // bright ring/icon colour
		const r = rOf(node);
		const nx = X(node), ny = Y(node);

		out.push(`<circle cx="${nx}" cy="${ny}" r="${r + 8}" fill="${color}" opacity="0.12" filter="url(#softglow)"/>`);
		if (style.subject) {
			out.push(`<circle cx="${nx}" cy="${ny}" r="${r + 7}" fill="none" stroke="${style.stroke}" stroke-width="1.4" opacity="0.7"/>`);
		}
		out.push(`<circle cx="${nx}" cy="${ny}" r="${r}" fill="#0e1626" stroke="${color}" stroke-width="2.4"/>`);
		out.push(`<g filter="url(#glow)"><circle cx="${nx}" cy="${ny}" r="${r}" fill="none" stroke="${color}" stroke-width="2.4" opacity="0.85"/></g>`);

		// icon
		const iconSize = r * 1.25;
		out.push(`<g transform="translate(${(nx - iconSize / 2).toFixed(1)} ${(ny - iconSize / 2).toFixed(1)}) scale(${(iconSize / 24).toFixed(3)})" fill="${color}">${style.icon}</g>`);

		// label
		out.push(`<text x="${nx}" y="${ny + r + 15}" fill="#dcebf7" font-size="12" text-anchor="middle" font-weight="600">${esc(nameOf(node))}</text>`);
		if (style.subject) {
			out.push(`<text x="${nx}" y="${ny + r + 28}" fill="${style.stroke}" font-size="8.5" text-anchor="middle" letter-spacing="2" font-family="ui-monospace, monospace">◆ SUBJECT</text>`);
		}
	}

	// ---- legend ----
	if (options.legend) {
		const lx = contentWidth + 18;
		let ly = 44;
		const heading = (text) => { out.push(`<text x="${lx}" y="${ly}" fill="#768390" font-size="10" letter-spacing="1.5" font-weight="700" font-family="ui-monospace, monospace">${esc(text.toUpperCase())}</text>`); ly += 20; };
		const label = (text) => { out.push(`<text x="${lx + 26}" y="${ly + 4}" fill="#dcebf7" font-size="11.5">${esc(text)}</text>`); ly += 24; };

		out.push(`<line x1="${contentWidth}" y1="0" x2="${contentWidth}" y2="${height}" stroke="#37e0ff" stroke-opacity="0.14"/>`);
		out.push(`<text x="${lx}" y="22" fill="#eaf6ff" font-size="13" font-weight="800" letter-spacing="1">LEGEND</text>`);

		heading("Entities");
		for (const item of options.legend.nodes) {
			const icon = require_icon(item.type);
			out.push(`<circle cx="${lx + 8}" cy="${ly}" r="9" fill="#0e1626" stroke="${POLE_ring(item)}" stroke-width="1.8"/>`);
			out.push(`<g transform="translate(${lx + 8 - 5.5} ${ly - 5.5}) scale(${(11 / 24).toFixed(3)})" fill="${POLE_ring(item)}">${icon}</g>`);
			label(item.label);
		}
		if (options.legend.subject) {
			out.push(`<circle cx="${lx + 8}" cy="${ly}" r="9" fill="none" stroke="${options.legend.subject.stroke}" stroke-width="2"/>`);
			label(options.legend.subject.label);
		}
		ly += 8;
		heading("Relationships");
		for (const item of options.legend.edges) {
			const dash = item.dashArray ? ` stroke-dasharray="${item.dashArray}"` : "";
			out.push(`<line x1="${lx}" y1="${ly}" x2="${lx + 17}" y2="${ly}" stroke="${item.color}" stroke-width="2.6"${dash} stroke-linecap="round"/>`);
			label(item.label);
		}
	}

	out.push(`</svg>`);
	return out.join("\n");
}

// The legend items carry only { type, color, ... }; recover icon + ring colour.
import { POLE_NODE_ICONS, POLE_NODE_STYLES } from "../src/pole-presets.js";
const require_icon = (type) => POLE_NODE_ICONS[type] || POLE_NODE_ICONS.other;
const POLE_ring = (item) => (POLE_NODE_STYLES[item.type] || POLE_NODE_STYLES.other).stroke;
