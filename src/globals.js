// Classic-<script>-loadable globals for the legacy example/test pages.
// -----------------------------------------------------------------------------
// The `examples/test_*.html` pages predate the ESM migration and expect a set of
// bare `window` globals (Graph, the trig helpers, a radial layout). Since some
// source files became ES modules (`export`), they can no longer be loaded via a
// classic <script> tag. This tiny entry re-exposes exactly those symbols on the
// global object; built as an IIFE (examples/la-globals.js) it is loaded first,
// and the still-global legacy scripts (MCanvas/LinkAnalysis/PieMenu/links_icons/
// image_utils) load alongside it unchanged.
//
//   Rebuild:  bun run examples:lib
import * as trigo from "./trigo.js";
import { Graph, Node, Link } from "./Graph.js";
import { RadialLayout } from "graphjs";

// Trig helpers used bare by MCanvas.js / LinkAnalysis.js / test_Icons.html
// (findAngle, midpoint, to_degrees, pointInCircle, to_radians, ...).
Object.assign(globalThis, trigo);
globalThis.Graph = Graph;
globalThis.Node = Node;
globalThis.Link = Link;

// The legacy LinkAnalysis viewer does `new MRadialLayout()` and later calls
// `layout.Calculate_Positions(graph, startVertex, center)` (capital C). Bridge
// to the engine's RadialLayout, whose method is `calculate_Positions`
// (lowercase, a compat shim that backfills graph/centerNode/center then runs).
class MRadialLayout extends RadialLayout {
	Calculate_Positions(graph, centerNode, center) {
		return this.calculate_Positions(graph, centerNode, center);
	}
}
globalThis.MRadialLayout = MRadialLayout;

export { Graph, Node, Link, MRadialLayout };
