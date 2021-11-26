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
	function TreeLayout(graph, options) {

		var treeLayout = this;

		/** orientation === "NORTH"
		 *  Orientation === "SOUTH"
		 */

		var defaults = {
			rootOrientation: "NORTH",
			maximumDepth: 50,
			levelSeparation: 100,
			siblingSpacing: 10,
			subtreeSeparation: 200,
			nodeWidth: 10,
			nodeHeight: 50
		}


		const opts = Object.assign(defaults, options);



		options || (options = {});
		for (var i in defaults) {
			if (defaults.hasOwnProperty(i)) {
				this[i] = options[i] || defaults[i];
			}
		}

		if (this.levelSeparation < (this.nodeHeight*2)) {
			this.levelSeparation = this.nodeHeight * 2;
		}
		// should be proportional to the width of the tree
		if (this.subtreeSeparation < (this.nodeWidth*3)) {
			this.subtreeSeparation = this.nodeWidth*3;
		}

		/**
		 * lastNodeAtLevel: stores the last node visited at each level to set as left most nodes' neighbor
		 */
		lastNodeAtLevel = [];
		this.graph = graph;

		console.log('TreeLayout constructed.');
		console.log(this);
	}

	TreeLayout.prototype.Calculate_Positions = function (graph, center) {
		//this.graph = graph;
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
			//console.log("  " + ThisNode.id + "/  children_count=" + children_count);
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
					meanNodeSize = leftNode.width;/// 2;
				}
				if (rightNode) {
					meanNodeSize = rightNode.width;// / 2;
				}
				break;
			case "EAST":
			case "WEST":
				if (leftNode) {
					meanNodeSize = leftNode.height / 2;
				}
				if (rightNode) {
					meanNodeSize = rightNode.height / 2;
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
		//console.log("Calling setNodeNeighbor      = " + node);
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
				//console.log("\\_setNodeNeighbor of " + node.id + " to " + node.neighbor.id);
			}
		}
		else {
			// has no subtree to move 
			//console.log("\\_setNodeNeighbor      = " + node + "  DO nothing");
		}
	}

	TreeLayout.prototype.getTreeDimension = function () {
		var node_count = this.graph.nodeList.length;
		var treeWidth = 0, treeHeight = 0;

		for (var i = 0; i < node_count; i++) {
			var node = this.graph.nodeList[i];
			if (!node.isAncestorCollapsed()) {
				treeWidth = Math.max(treeWidth, node.x + node.width);
				treeHeight = Math.max(treeHeight, node.y + node.height);
			}
		}
		return { "treeWidth": treeWidth, "treeHeight": treeHeight };
	}

	TreeLayout.prototype.getMidPoint = function (node) {
		var leftMostChild = node.getLeftMostChild();
		var rightMostChild = node.getRightMostChild();
		var midPoint = (leftMostChild.prelim + rightMostChild.prelim) / 2;
		return midPoint;
	}


	TreeLayout.prototype.firstWalk = function (node, level) {
		/* Do a post-order traversal (ie: from the bottom-left to the top-right).
		 * Visit the current node after visiting all the nodes from left to right.
		 */
		node.prelim = 0;
		node.modifier = 0;
		node.width = node.width || this.nodeWidth;
		node.height = node.height || this.nodeHeight;

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
				//	console.log("\\___ firstWalk Sibling: left=" + leftSibling.id + " right=" + node.id);
				node.prelim = leftSibling.prelim + this.siblingSpacing;
				var meanNodeSize = this.getMeanNodeSize(node, leftSibling);
				//	console.log("meanNodeSize = " + meanNodeSize);
				node.prelim += meanNodeSize;
				//console.log("prelim = " + leftSibling.prelim + " + " + this.siblingSpacing + " + " + meanNodeSize + " = " + node.prelim);
			}
			else {  /*  no sibling on the left to worry about  */
				node.prelim = 0;
				//console.log(node.id + " is a leaf with no left sibling");
				//console.log("prelim  = " + node.prelim);
				//console.log("modifier= " + node.modifier);
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
			//console.log(node);

			var midPoint = this.getMidPoint(node);
			//console.log("midPoint of " + node.id + "= " + midPoint);

			//console.log(node.id + " is the parent of nodes " + leftMostChild.id + " and " + rightMostChild.id);

			if (leftSibling) {
				node.prelim += leftSibling.prelim + this.siblingSpacing
				var meanNodeSize = this.getMeanNodeSize(node, leftSibling);
				node.prelim += meanNodeSize;
				node.modifier = node.prelim - midPoint;
				//console.log("prelim = " + leftSibling.prelim + " + " + this.siblingSpacing + " + " + meanNodeSize + " = " + node.prelim);
				//console.log("modifier= " + node.prelim + " - " + node.modifier);
				//console.log("Calling this.apportion for = " + node.id + " - level = " + level);
				this.apportion(node, level);

			} else {
				node.prelim = midPoint;
				//console.log("prelim  = " + node.prelim);
			}
		}
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
		//console.log("_apportion " + node.id);

		var firstChild = node.children[0];
		var firstChildLeftNeighbor = firstChild.neighbor;
		var compareDepth = 1;
		var depthToStop = this.maximumDepth - level;


		if (firstChild && firstChildLeftNeighbor && compareDepth < depthToStop) {

			var rightModSum, leftModSum, rightAncestor, leftAncestor;

			leftModSum = 0;
			rightModSum = 0;
			rightAncestor = firstChild;
			leftAncestor = firstChildLeftNeighbor;
			for (var l = 0; l < compareDepth; l += 1) {
				rightAncestor = rightAncestor.parent;
				leftAncestor = leftAncestor.parent;
				rightModSum += rightAncestor.modifier;
				leftModSum += leftAncestor.modifier;
			}
			/**
			 * Find the moveDistance, and apply it to Node's subtree.
			 * Apply appropriate portions to smaller interior subtrees.
			 **/
			var meanNodeSize = 10;//firstChildLeftNeighbor._getSize(this.orientation);

			var totalGap = (firstChildLeftNeighbor.prelim + leftModSum + this.subtreeSeparation + meanNodeSize)
				- (firstChild.prelim + rightModSum);
			//console.log("\\__apportion: totalGap of " + node.id + " = " + totalGap);

			if (totalGap > 0) {
				/* Count interior sibling subtrees in LeftSiblings */

				var subtree, subtreeMoveAux;

				var numberOfLeftSiblings = 0;
				for (subtree = node; subtree && subtree !== leftAncestor; subtree = subtree.getLeftSibling()) {
					numberOfLeftSiblings += 1;
					//console.log("\\__apportion: numberOfLeftSiblings: " + numberOfLeftSiblings);
					//console.log("\\__apportion: leftAncestor = " + leftAncestor.id);
				}

				if (subtree) {
					/* Apply portions to appropriate leftsibling subtrees. */
					var portion = totalGap / numberOfLeftSiblings;
					subtreeMoveAux = node;

					while (subtreeMoveAux !== leftAncestor) {
						//console.log("\\__apportion: subtree " + subtree.id + " & " + "subtreeMoveAux " + subtreeMoveAux.id);

						subtreeMoveAux.prelim += totalGap;
						subtreeMoveAux.modifier += totalGap;
						totalGap -= portion;
						subtreeMoveAux = subtreeMoveAux.getLeftSibling();
					}
				}
				else {
					/* Don't need to move anything--it needs to be done by an ancestor because      */
					/* pAncestorNeighbor and pAncestorLeftmost are not siblings of each other.      */
					return;
				}
			}   /* end of the while  */

			/* Determine the leftmost descendant of thisNode */
			/* at the next lower level to compare its         */
			/* positioning against that of its neighbor.     */
			compareDepth++;


			if (firstChild.getChildrenCount() === 0) {
				firstChild = this.getLeftmost(node, 0, compareDepth);
			}
			else {
				firstChild = firstChild.getFirstChild();
			}
			if (firstChild) {
				firstChildLeftNeighbor = firstChild.neighbor;
			}
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

			node.x = xTopAdjustment + node.prelim + modSum;
			node.y = yTopAdjustment + (level * this.levelSeparation);
			//console.log("\\secondWalk: Node(" + node.id + " / " + xTopAdjustment + " / " + node.prelim + " / " + modSum);
			//console.log("\\secondWalk: " + node.x + "," + node.y);


			var children_count = node.getChildrenCount();
			for (var i = 0; i < children_count; i++) {
				var child = node.children[i];
				this.secondWalk(child, level +1, modSum + node.modifier);
			}
		}

	}

	return TreeLayout;
}());