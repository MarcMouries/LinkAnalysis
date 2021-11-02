// =============================================================
//                          TreeLayout
// =============================================================


var TreeLayout = /** CLASS */ (function () {
	function TreeLayout() {
		this.DISTANCE_BETWEEN_LEVELS = 130;
		this.MAX_DEPTH = 10;
		console.log('TreeLayout constructed.');
	}

	TreeLayout.prototype.Calculate_Positions = function (graph, center) {
		var starting_node = graph.getRootNode();
		this.CalculateInitialX(starting_node, starting_node);
	}


	TreeLayout.prototype.CalculateInitialX = function (node, level) {
		/* Do a post-order traversal (ie: from the bottom-left to the top-right).
		 * Visit the current node after visiting all the nodes from left to right.
		 */
		var children_count = node.getChildrenCount();
		for (var i = 0; i < children_count; i++) {
			var child = node.getAdjacents()[i];
			this.CalculateInitialX(child);
		}

		if (node.isLeaf() || level == this.MAX_DEPTH) {
			console.log("is a leaf: " + node.id);
			if (node.hasLeftSibling()) {
				console.log("node hasLeftSibling = " + node.id);

			}
		}
		else {
			/* This Node is not a leaf, so call this procedure recursively for each of its offspring. */
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

	return TreeLayout;
}());