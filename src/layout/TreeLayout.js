// =============================================================
//                          TreeLayout
// =============================================================

/*
SiblingSeparation
Distance in arbitrary units for the distance between siblings.

SubtreeSeparation
Distance in arbitrary units for the distance between neighbouring subtrees.

LevelSeparation
Distance in arbitrary units for the separation between adjacent levels.
*/



var TreeLayout = (function () {
	function TreeLayout(options) {
		var treeLayout = this;

		var defaults = {
			maximumDepth: 50,
			levelSeparation: 50,
			siblingSpacing: 4,
			subtreeSeparation: 50
		}
		options || (options = {});
		for (var i in defaults) {
			if (defaults.hasOwnProperty(i)) {
				this[i] = options[i] || defaults[i];
			}
		}
		console.log('TreeLayout constructed.');
		console.log(this);
	}

	TreeLayout.prototype.Calculate_Positions = function (graph, center) {
		var starting_node = graph.getRootNode();
		this.firstWalk(starting_node, starting_node);
	}




	TreeLayout.prototype.firstWalk = function (node, level) {
		/* Do a post-order traversal (ie: from the bottom-left to the top-right).
		 * Visit the current node after visiting all the nodes from left to right.
		 */
		node.x = -1;
		node.prelim = 0;
		node.mod = 0;
		node.nodeWidth = 666;

		var children_count = node.getChildrenCount();
		for (var i = 0; i < children_count; i++) {
			var child = node.getAdjacents()[i];
			this.firstWalk(child);
		}

		node.y = node.level * this.levelSeparation;

		if (node.isLeaf() || level == this.MAX_DEPTH) {

			var leftSibling = node.getLeftSibling();
			if (leftSibling) {
				/*-------------------------------------------------
				* Determine the preliminary x-coordinate based on:
				* - preliminary x-coordinate of left sibling,
				* - the separation between sibling nodes, and
				* - mean width of left sibling & current node.
				*-------------------------------------------------*/
				console.log(node.id + " is the right sibling of node " + leftSibling);
				// sibling separation value plus the mean size of the two nodes.

				console.log(node);
				node.prelim = leftSibling.prelim + this.siblingSpacing;
				var mean = (node.prelim + leftSibling.prelim) /2;
				node.prelim = node.prelim + mean;
				console.log("prelim  = " + leftSibling.prelim + " + " + this.siblingSpacing + " + " +  mean + " = " + node.prelim) ;
			}
			else {
				console.log(node.id + " is a leaf with no left sibling");
				node.x = 0;
				console.log("mod     = " + node.mod);

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