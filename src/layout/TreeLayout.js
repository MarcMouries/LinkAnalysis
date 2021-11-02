// =============================================================
//                          TreeLayout
// =============================================================
function TreeLayout() {

	this.DISTANCE_BETWEEN_LEVELS = 130;

}

TreeLayout.prototype.Calculate_Positions = function (graph, center) {
	var starting_node = graph.getRootNode();
	this.CalculateInitialX(starting_node, starting_node);
}


TreeLayout.prototype.CalculateInitialX = function (starting_node) {
	var children_count = starting_node.getChildrenCount();
	for (var i = 0; i < children_count; i++) {
		var child = starting_node.getAdjacents()[i];
		this.CalculateInitialX(child);
	}
	console.log("CalculateInitialX node = " + starting_node.id);
	if (starting_node.isLeaf()) {
		console.log("is a leaf: " + starting_node.id);
	}

}


TreeLayout.prototype.visit_Postorder = function (starting_node, callback) {
	var children_count = starting_node.getAdjacents().length;

	for (var i = 0; i < children_count; i++) {
		var child = starting_node.getAdjacents()[i];
		this.visit_Postorder(child, callback);
	}

	callback(starting_node);
}