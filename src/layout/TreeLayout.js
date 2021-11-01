// =============================================================
//                          TreeLayout
// =============================================================
function TreeLayout() {

	this.DISTANCE_BETWEEN_LEVELS = 130;

 }

 TreeLayout.prototype.Calculate_Positions = function (graph, starting_node, center) {

    
	if (graph.isRoot(starting_node)) {
		starting_node.x = center.x;
		starting_node.y = center.y;
	}
    if (starting_node.children == null) {

    }

    var children_count = starting_node.getAdjacents().length;

	for (var i = 0; i < children_count; i++) {
		var child = starting_vertex.getAdjacents()[i];
		this.Calculate_Positions(graph, child, center);
    }
    console.log("Tree Calc Pos: starting_node = " + starting_node.id);

 }



 Graph.prototype.visit_Postorder = function (starting_node, callback) {
	var children_count = starting_node.getAdjacents().length;

	for (var i = 0; i < children_count; i++) {
		var child = starting_node.getAdjacents()[i];
		this.visit_Postorder(child, callback);
	}

	callback(starting_node);
}