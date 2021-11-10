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

		var defaults = {
			rootOrientation: "NORTH",
			maximumDepth: 50,
			levelSeparation: 40,
			siblingSpacing: 40,
			subtreeSeparation: 100,
			nodeWidth: 20,
			nodeHeigth: 10
		}
		options || (options = {});
		for (var i in defaults) {
			if (defaults.hasOwnProperty(i)) {
				this[i] = options[i] || defaults[i];
			}
		}
		/**
		 * lastNodeAtLevel: stores the last node visited at each level to set as left most nodes' neighbor
		 */
		lastNodeAtLevel = [];

		console.log('TreeLayout constructed.');
		console.log(this);
	}

	TreeLayout.prototype.Calculate_Positions = function (graph, center) {
		var starting_node = graph.getRootNode();
		this.firstWalk(starting_node, 0);
		this.secondWalk(starting_node, 0, 0);
	}

	/**
	 * Determine the leftmost descendant of a node at given depth.
	 * This is implemented using a post-order walk of the subtree
	 * under ThisNode, down to the level of searchDepth.
	 * If we've searched to the proper distance, return the currently leftmost node.
	 * Otherwise, recursively look at the progressively lower levels.
	  */
	TreeLayout.prototype.getLeftmost = function (ThisNode, currentLevel, searchDepth) {
		//console.log("START getLeftmost= " + ThisNode.id + "/" + currentLevel + "/" + searchDepth);

		/*  searched far enough.           */
		if (currentLevel >= searchDepth) {
			return ThisNode;
		}
		else if (ThisNode.isLeaf()) {
			return null; /* This node has no descendants    */
		}
		else {  /* Do a post-order walk of the subtree.     */
			var children_count = ThisNode.getChildrenCount();
			console.log("  " + ThisNode.id + "/  children_count=" + children_count);
			for (var i = 0; i < children_count; i++) {
				var child = ThisNode.children[i];
				leftmost = this.getLeftmost(child, currentLevel + 1, searchDepth);
				if (leftmost) {
					return leftmost;
				}
			}
		}
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

	/**
	 *  Called by the firstWalk function in post-order
	 */
	setNodeNeighbor = function (node) {
		// setNodeNeighbor: node :  Node D
		//    \__ left most child:  Node B
		//    \__       neightbor: NONE
		// setNodeNeighbor: node :  Node M
		//    \__ left most child:  Node H
		//    \__       neightbor:  Node C
		// setNodeNeighbor: node :  Node N
		//    \__ left most child:  Node G
		//    \__       neightbor:  Node D
		console.log("Calling setNodeNeighbor      = " + node);
		var isLeftMost = node.isLeftMost();
		var isRightMost = node.isRightMost();
		//console.log("setNodeNeighbor NODE= " + node.id + " , level= " + node.level + ", isLeftMost(" + isLeftMost + ")" + ", isRightMost(" + isRightMost + ")");

		if (isRightMost) {
			//console.log("\\_setNodeNeighbor lastNodeAtLevel      = " + node.id);
			//console.log("\\_setNodeNeighbor this.lastNodeAtLevel[node.level]       = " + node);
			this.lastNodeAtLevel[node.level] = node;
		}
		else if (isLeftMost) {
			node.neighbor = this.lastNodeAtLevel[node.level];
			if (node.neighbor) {
				console.log("\\_setNodeNeighbor of " + node.id + " to " + node.neighbor.id);
			}
		}
		else {
			// has no subtree to move 
			//console.log("\\_setNodeNeighbor      = " + node + "  DO nothing");
		}

	}


	TreeLayout.prototype.firstWalk = function (node, level) {
		/* Do a post-order traversal (ie: from the bottom-left to the top-right).
		 * Visit the current node after visiting all the nodes from left to right.
		 */
		node.prelim = 0;
		node.modifier = 0;
		node.width = node.width || this.nodeWidth;
		node.heigth = node.heigth || this.nodeHeigth;

		setNodeNeighbor(node, level);

		//	var rightSibling = node.getRightSibling();
		//	console.log("firstWalk rightSibling      = " + rightSibling);

		//console.log("\\firstWalk: isRightMost ? " + isRightMost);
		//this.nodes_at_level = [node.level];


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
				console.log("modifier= " + node.modifier);
			}
		}
		else {
			/* This Node is not a leaf, so call this procedure 
			/* recursively for each of its offspring.          */
			var children_count = node.getChildrenCount();
			for (var i = 0; i < children_count; i++) {
				var child = node.getAdjacents()[i];
				this.firstWalk(child, level + 1);
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
				node.modifier = node.prelim - midPoint;
				console.log(node);
				console.log("prelim = " + leftSibling.prelim + " + " + this.siblingSpacing + " + " + meanNodeSize + " = " + node.prelim);
				console.log("modifier= " + node.prelim + " - " + node.modifier);
				console.log("Calling this.apportion for = " + node.id + " - level = " + level);
//				this.apportion(node, level);

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
	* 
	*  Called for non-leaf nodes
	*----------------------------------------------------*/
	TreeLayout.prototype.apportion = function (node, level) {
		console.log("apportion: node    = " + node.id);

		/* loop control pointer (pTempPtr)  */
		var subtree;
		/* difference between  where neighbor thinks pLeftmost should be   */
		/* and where pLeftmost actually is                                 */
		var moveDistance;
		/* proportion of distance to be added to each sibling       */
		var portion;

		var leftMost = node.getFirstChild();
		var neighbor = leftMost.neighbor;            /* node left of leftmost */

		console.log("\\__apportion: leftmost : " + leftMost.id);
		//console.log("\\__apportion: neightbor: " + neighbor.id);

		if (neighbor) {
			console.log("\\__apportion: neightbor: " + neighbor.id);
		}
		else {
			console.log("\\__apportion: neightbor: NONE");
		}

		var compareDepth = 1;
		var depthToStop = this.maximumDepth - level;


		if (leftMost && neighbor && compareDepth < depthToStop) {
			/* Compute the location of Leftmost and where it should be with respect to Neighbor. */
			var leftModSum = 0;
			var rightModSum = 0;
			var ancestorLeftMost = neighbor;//leftMost;
			var ancestorNeighbor = leftMost; //neighbor;

			for (i = 0; i < compareDepth; i++) {
				ancestorLeftMost = ancestorLeftMost.parent;
				ancestorNeighbor = ancestorNeighbor.parent;
				rightModSum = rightModSum + ancestorNeighbor.modifier;
				leftModSum = leftModSum + ancestorLeftMost.modifier;

				console.log("\\__apportion:   ancestorLeftMost: " + ancestorLeftMost.id);
				console.log("\\__apportion:   ancestorNeighbor: " + ancestorNeighbor.id);
				console.log("\\__apportion:   rightModSum: " + rightModSum);
				console.log("\\__apportion:   leftModSum: " + leftModSum);
			}
			/**
			 * Find the moveDistance, and apply it to Node's subtree.
			 * Add appropriate portions to smaller interior subtrees.
			 **/
			var meanNodeSize = this.getMeanNodeSize(leftMost, neighbor);
			var left_size = neighbor.prelim + leftModSum;
			//(neighbor.prelim + leftModSum 
			var right_size = leftMost.prelim + rightModSum;

			moveDistance = left_size + this.subtreeSeparation + meanNodeSize - right_size;
			//moveDistance = (left_size + meanNodeSize + this.subtreeSeparation) - (right_size);

			console.log("Apportion: node (" + node.id + ") meanNodeSize: " + meanNodeSize);
			console.log("Apportion: node (" + node.id + ") left_size: " + left_size);
			console.log("Apportion: node (" + node.id + ") right_size: " + right_size);
			console.log("Apportion: node (" + node.id + ") moveDistance: " + moveDistance);


			if (moveDistance > 0) {
				/* Count interior sibling subtrees in LeftSiblings */
				subtree = node; //  TempPtr <- Node;
				var numberOfLeftSiblings = 0;
				while (subtree && subtree != ancestorNeighbor) {
					numberOfLeftSiblings = numberOfLeftSiblings + 1;
					console.log("\\__apportion:  Getting LeftSiblings of: " + subtreeAux.id);
					subtree = subtree.getLeftSibling();
				}

				if (subtree) {
					console.log("\\__apportion: LeftSiblings #for subtree: " + subtree.id + "=" + numberOfLeftSiblings);

					/* Apply portions to appropriate leftsibling subtrees. */
					console.log("\\__apportion:   subtree not null : " + subtree.id);
					portion = moveDistance / numberOfLeftSiblings;
					subtree = node; //  TempPtr <- Node;
					while (subtree != ancestorNeighbor) {
						//	subtree.prelim = subtree.prelim + moveDistance;
						//	subtree.modifier = subtree.modifier + moveDistance;
						//	moveDistance = moveDistance - portion;
						subtree = subtree.getLeftSibling();
					}
				}
				else {
					/* Don't need to move anything--it needs to be done by an ancestor because      */
					/* pAncestorNeighbor and pAncestorLeftmost are not siblings of each other.      */
					return;
				}
			}
		}   /* end of the while  */

		/* Determine the leftmost descendant of thisNode */
		/* at the next lower level to compare its         */
		/* positioning against that of its neighbor.     */
		compareDepth++;
		console.log("\\__apportion:   compareDepth: " + compareDepth);
		if (leftMost.isLeaf()) {
			leftMost = this.getLeftmost(node, 0, compareDepth);
		}
		else {
			leftMost = leftMost.getFirstChild();
		}
		if (leftMost) {
			neighbor = leftMost.neighbor;
		}

	}




	/*------------------------------------------------------
	* During a second pre-order walk, each node is given a final x-coordinate by summing its preliminary
	* x-coordinate and the modifiers of all the node's ancestors.
	* The y-coordinate depends on the height of the tree.
	* (The roles of x and y are reversed for RootOrientations of EAST or WEST.)
	* Returns: TRUE if no errors, otherwise returns FALSE.
	*----------------------------------------- ----------*/
	TreeLayout.prototype.secondWalk = function (node, level, modSum) {
		//console.log("secondWalk    = " + node);
		if (level <= this.maximumDepth) {

			var xTopAdjustment = 0;
			var yTopAdjustment = 0;

			var xTemp = xTopAdjustment + node.prelim + modSum;
			node.x = xTemp;
			//var yTemp = yTopAdjustment + (level * this.levelSeparation);
			var yTemp = yTopAdjustment + (level * this.levelSeparation);
			node.y = yTemp;
			console.log("  \\_secondWalk: Node(" + node.id + ") = " + node.x + "," + node.y);

			/*
			var children_count = node.getChildrenCount();
			for (var i = 0; i < children_count; i++) {
				var child = node.children[i];
				this.secondWalk(child, level +1, modSum + node.modifier);
			}
			*/
			if (node.hasChild()) {
				this.secondWalk(node.getLeftMostChild(), level + 1, modSum + node.modifier);
			}
			var rightSibling = node.getRightSibling();
			if (rightSibling) {
				this.secondWalk(rightSibling, level + 0, modSum + node.modifier);
			}

		}

	}

	return TreeLayout;
}());