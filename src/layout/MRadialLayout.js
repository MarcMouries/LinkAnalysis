// =============================================================
//                          MRadialLayout
// =============================================================
function MRadialLayout() {

	this.DISTANCE_BETWEEN_LEVELS = 130;

 }

 MRadialLayout.prototype.Calculate_Positions = function (graph, starting_vertex, center) {


	//log(`MRadialLayout.Calculate_Positions: ${starting_vertex.data.id}`);


	if (!graph || graph.getNodes().length == 0) {
		console.error("MRadialLayout: can't run on an empty graph.");
		return;
	}
	if (starting_vertex == "undefined") {
		console.error(
			"MRadialLayout: can't run without a starting vertex. Which node should be the center?"
		);
		return;
	}
	if (center == "undefined") {
		console.error("MRadialLayout: can't run without a center set.");
		return;
	}

	if (graph.isRoot(starting_vertex)) {
		starting_vertex.x = center.x;
		starting_vertex.y = center.y;
		starting_vertex.angle = 0;
		starting_vertex.angleRange = 2 * Math.PI;
		//log(`*** MRadialLayout ROOT id=${starting_vertex.id},
		//			x=${starting_vertex.x}, y=${starting_vertex.y}, depth=${starting_vertex.depth},
		//            angle=${to_degrees(starting_vertex.angle)}°- angleRange=${to_degrees(starting_vertex.angleRange)}°`);
	}

	var children_count = starting_vertex.getAdjacents().length;
	//console.log(`*** MRadialLayout vertex id=${starting_vertex.id}: # children=${children_count}`);

	for (var i = 0; i < children_count; i++) {
		var child = starting_vertex.getAdjacents()[i];
		var slice_angle = starting_vertex.angleRange / children_count;

		// to center the vertices
		var centerAdjust = 0;
		if (child.depth > 1) {
			centerAdjust =
				(-starting_vertex.angleRange +
					starting_vertex.angleRange / children_count) /
				2;
		}
		child.angle = starting_vertex.angle + slice_angle * i + centerAdjust;
		child.angleRange = slice_angle;

		var cx = this.DISTANCE_BETWEEN_LEVELS;
		var cy = 0;
		// to  avoid collision between siblings
		if (i % 2 === 1) {
			cx = cx * 1.3;
		}

		//var location = getPointOnArc(cx, cy, RADIUS, child.angle);
		var rotation = rotate(cx, cy, child.angle);
		//log(`*** MRadialLayout rotation =${rotation.x},${rotation.y}`);
		child.x = starting_vertex.x + rotation.x;
		child.y = starting_vertex.y + rotation.y;

		//log(`*** MRadialLayout child id=${child.id}, x=${child.x}, y=${child.y},depth=${child.depth},
		//           angle=${to_degrees(child.angle)}°- angleRange=${to_degrees(child.angleRange)}°`);

		//  RECURSIVE CALL on children
		this.Calculate_Positions(graph, child, center);
	}
};
