// =============================================================
//                          MRadialLayout
// -------------------------------------------------------------
//  Recursive radial placement: a center node at the origin and its
//  descendants laid out on concentric rings.
// =============================================================
import { GraphLayout } from "./GraphLayout.js";
import { rotate } from "../trigo.js";

export class MRadialLayout extends GraphLayout {
	constructor() {
		super();
		this.DISTANCE_BETWEEN_LEVELS = 130;
	}

	Calculate_Positions(graph, starting_vertex, center) {
		if (!graph || graph.getNodes().length === 0) {
			console.error("MRadialLayout: can't run on an empty graph.");
			return;
		}
		if (starting_vertex == null) {
			console.error("MRadialLayout: can't run without a starting vertex. Which node should be the center?");
			return;
		}
		if (center == null) {
			console.error("MRadialLayout: can't run without a center set.");
			return;
		}

		if (graph.isRoot(starting_vertex)) {
			starting_vertex.x = center.x;
			starting_vertex.y = center.y;
			starting_vertex.angle = 0;
			starting_vertex.angleRange = 2 * Math.PI;
		}

		const children_count = starting_vertex.getAdjacents().length;

		for (let i = 0; i < children_count; i++) {
			const child = starting_vertex.getAdjacents()[i];
			const slice_angle = starting_vertex.angleRange / children_count;

			// Center the children within the parent's angular range.
			let centerAdjust = 0;
			if (child.depth > 1) {
				centerAdjust = (-starting_vertex.angleRange + starting_vertex.angleRange / children_count) / 2;
			}
			child.angle = starting_vertex.angle + slice_angle * i + centerAdjust;
			child.angleRange = slice_angle;

			let cx = this.DISTANCE_BETWEEN_LEVELS;
			const cy = 0;
			// Offset every other sibling outward to reduce collisions.
			if (i % 2 === 1) {
				cx = cx * 1.3;
			}

			const rotation = rotate(cx, cy, child.angle);
			child.x = starting_vertex.x + rotation.x;
			child.y = starting_vertex.y + rotation.y;

			// Recurse.
			this.Calculate_Positions(graph, child, center);
		}
	}
}
