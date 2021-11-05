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

		/** orientation === "NORTH"
		 *  Orientation === "SOUTH"
		 */
		this.rootOrientation = "NORTH";

		var defaults = {
			maximumDepth: 50,
			levelSeparation: 100,
			siblingSpacing: 65,
			subtreeSeparation: 50,
			nodeWidth : 80,
			nodeHeigth : 40
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
		this.secondWalk(starting_node);
	}

	TreeLayout.prototype.getMeanNodeSize = function (leftNode, rightNode) {

		var meanNodeSize = 0.0;
		switch (this.rootOrientation) {
			case "NORTH":
			case "SOUTH":
				if (leftNode) {
					meanNodeSize = this.nodeWidth; // leftNode.width / 2; 
				}
				if (rightNode) {
					meanNodeSize = this.nodeWidth; // rightNode.width / 2;
				}
				break;
			case "EAST":
			case "WEST":
				if (leftNode) {
					meanNodeSize = this.nodeHeigth; //leftNode.height / 2;
				}
				if (rightNode) {
					meanNodeSize = this.nodeHeigth; //rightNode.height / 2;
				}
				break;
		}
		return meanNodeSize;
	}


	TreeLayout.prototype.firstWalk = function (node) {
		/* Do a post-order traversal (ie: from the bottom-left to the top-right).
		 * Visit the current node after visiting all the nodes from left to right.
		 */
		node.x = -1;
		node.y = node.level * this.levelSeparation;
		node.prelim = 0;
		node.mod = 0;
		node.width = 80;
		node.heigth = 40;

		/*
		var children_count = node.getChildrenCount();
		for (var i = 0; i < children_count; i++) {
			var child = node.getAdjacents()[i];
			this.firstWalk(child);
		}
		*/
		var leftSibling = node.getLeftSibling();
		if (node.isLeaf() || node.level == this.maximumDepth) {
			if (leftSibling) {
				/*-------------------------------------------------
				* Determine the preliminary x-coordinate based on:
				* - preliminary x-coordinate of left sibling,
				* - the separation between sibling nodes, and
				* - mean width of left sibling & current node.
				*-------------------------------------------------*/
				node.prelim = leftSibling.prelim + this.siblingSpacing;
				var meanNodeSize = this.getMeanNodeSize(node, leftSibling);
				node.prelim += meanNodeSize;
				console.log(node);
				console.log(node.id + " is the right sibling of node " + leftSibling);
				console.log("prelim = " + leftSibling.prelim + " + " + this.siblingSpacing + " + " + meanNodeSize + " = " + node.prelim);
			}
			else {  /*  no sibling on the left to worry about  */
				node.prelim = 0;
				console.log(node);
				console.log(node.id + " is a leaf with no left sibling");
				console.log("prelim  = " + node.prelim);
				console.log("mod     = " + node.mod);
			}
		}
		else {
			/* This Node is not a leaf, so call this procedure */
			/* recursively for each of its offspring.          */

			var children_count = node.getChildrenCount();
			for (var i = 0; i < children_count; i++) {
				var child = node.getAdjacents()[i];
				this.firstWalk(child);
			}
			console.log(node);
			var leftMostChild = node.getLeftMostChild();
			var rightMostChild = node.getRightMostChild();
			var midPoint = (leftMostChild.prelim + rightMostChild.prelim) / 2;
			console.log(node.id + " is the parent of nodes " + leftMostChild.id + " and " + rightMostChild.id);

			if (leftSibling) {
				node.prelim += leftSibling.prelim + this.siblingSpacing
				var meanNodeSize = this.getMeanNodeSize(node, leftSibling);
				node.prelim += meanNodeSize;
				node.mod = node.prelim - midPoint;
				console.log(node);
				console.log("prelim = " + leftSibling.prelim + " + " + this.siblingSpacing + " + " + meanNodeSize + " = " + node.prelim);
				console.log("mod    = " + node.prelim + " - " + node.mod);
				this.apportion(node);

			} else {
				node.prelim = midPoint;
				console.log(node);
				console.log("prelim  = " + node.prelim);
			}
		}
		//console.log("_firstWalk: node");
		//console.log(node);
		//console.log("_firstWalk: END");
	}

	/*------------------------------------------------------
	* Clean up the positioning of small sibling subtrees.
	* Subtrees of a node are formed independently and placed as close together as possible.
	* By requiring that the subtrees be rigid at the time they are put together, we avoid
	* the undesirable effects that can accrue from positioning nodes rather than subtrees.
	*----------------------------------------------------*/
	TreeLayout.prototype.apportion = function (node) {
		console.log("TO DO - TODO apportion    = " + node.id);

	}

	/*------------------------------------------------------
    * During a second pre-order walk, each node is given a final x-coordinate by summing its preliminary
    * x-coordinate and the modifiers of all the node's ancestors.
	* The y-coordinate depends on the height of the tree.
	* (The roles of x and y are reversed for RootOrientations of EAST or WEST.)
    * Returns: TRUE if no errors, otherwise returns FALSE.
    *----------------------------------------- ----------*/
	TreeLayout.prototype.secondWalk = function (node) {
		console.log("secondWalk    = " + node);
		console.log(node);
		if (node.level <= this.maximumDepth) {

			node.x = node.prelim + node.mod;
			node.y = (node.level * this.levelSeparation);

			var children_count = node.getChildrenCount();
			for (var i = 0; i < children_count; i++) {
				var child = node.children[i];
				this.secondWalk(child);
			}
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