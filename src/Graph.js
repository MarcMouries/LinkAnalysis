// =============================================================
// Supports Graph structure and operations
// -------------------------------------------------------------
//  Author: Marc Mouries
// =============================================================

function log(msg) {
	if (true) {
		console.log(msg);
	}
}



// =============================================================
//                          Node
// -------------------------------------------------------------
//
// =============================================================
function Node(id, data) {
	this.id = id;
	this.data = data;
	this.level = 0;
	this.children = [];
	this.parent;
	this.neighbor;
}

Node.prototype.addChild = function (node) {
	this.children.push(node);
};

Node.prototype.getAdjacents = function (node) {
	return this.children;
};

Node.prototype.isAdjacent = function (node) {
	return this.children.indexOf(node) > -1;
};

Node.prototype.getChildAt = function (i) {
	return this.children[i];
}

Node.prototype.getFirstChild = function () {
	return this.getChildAt(0);
}

Node.prototype.getChildrenCount = function () {
	return this.children.length;
}
Node.prototype.isLeaf = function () {
	return (this.children && this.children.length == 0);
}
Node.prototype.hasChild = function () {
	return (this.children && this.children.length > 0)
}
Node.prototype.getLastChild = function () {
	return this.getChildAt(this.getChildrenCount() - 1);
}

function attribute(name) {
	console.log("message from attribute function: " + name);
  }

Node.prototype.attr =  attribute;


/**
 *  isLeftMost: is this node == to the first child of its parent?
 */
 Node.prototype.isLeftMost = function () {
	if ( !this.parent || this.parent=== null) {
		return true;
	}
	else {
		return this.parent.getFirstChild() === this;
	}
};

/**
 *  isRightMost: is this node == to the last child of its parent?
 */
 Node.prototype.isRightMost = function () {
	if ( !this.parent || this.parent=== null) {
		return true;
	}
	else {
		return this.parent.getLastChild()=== this;
	}
};

Node.prototype.getLeftSibling = function () {
	if (this.parent === null || this.isLeftMost()) {
		return null;
	}
	else {
		var index = this.parent.children.indexOf(this);
		return this.parent.children[index - 1];
	}
};
Node.prototype.getRightSibling = function () {
	if (this.parent === null || this.isRightMost()) {
		return null;
	}
	else {
		var index = this.parent.children.indexOf(this);
		return this.parent.children[index + 1];
	}
};


Node.prototype.getLeftMostChild = function () {
	if (this.getChildrenCount() == 0)
		return null;

	return this.children[0];
}



Node.prototype.getRightMostChild = function () {
	if (this.getChildrenCount() == 0)
		return null;

	return this.children[this.getChildrenCount() -1];
}



/**
 *  Has Left Sibling
 * @returns 
 */
Node.prototype.hasLeftSibling = function () {
	return (! this.isLeftMost());
};


Node.prototype.toString = function () {
	return this.id;// + ", " + "depth: " + this.depth + ", " + "children #: " + this.getChildrenCount();
}


// =============================================================
//                          Link
// =============================================================
function Link(source, target) {
	this.id = source.id + "-" + target.id;
	this.source = source;
	this.target = target;
}

// =============================================================
//                          Graph
// =============================================================
function Graph() {
	this.graph = {};
	this.nodeList = [];
	this.linkList = [];
	this.adjacency = {};
	this.changed = false;
	this.root;
}

/**
 *
 */
Graph.prototype.addObject = function (object) {
	var node = new Node(object.id, object);

	if (object.parentId) {
		node.parent = this.getNode(object.parentId);
		if(!node.parent) {
			console.error("Parent node not found for parentId: " + object.parentId);
		}
		else {
			node.level = node.parent.level +1;
			node.parent.children.push(node);
		}
	}
	else {
		this.root = node;
	}
	this.addNode(node);
	this.changed = true;
	return node;
};

Graph.prototype.getRootNode = function (node) {
	return this.root;
}


Graph.prototype.addNode = function (node) {
	if (!(node.id in this.graph)) {
		this.nodeList.push(node);
		this.graph[node.id] = node;
	}
	else {
		console.log("Node already exists: " + node.id);
	}
	return node;
};

/**
 * Check if the specified node is a target in the list of links
 */
Graph.prototype.isRoot = function (node) {
	var exist = false;
	this.linkList.forEach(function (link, index) {
		if (link.target.id === node.id) {
			exist = true;
		}
	});
	return (is_root = !exist);
};

Graph.prototype.addLink = function (sourceNode_id, targetNode_id) {
	var sourceNode = this.getNode(sourceNode_id);
	if (sourceNode == undefined) {
		throw new TypeError("Trying to add a link to the non-existent node with id: " + sourceNode_id);
	}
	var targetNode = this.getNode(targetNode_id);
	if (targetNode == undefined) {
		throw new TypeError("Trying to add a link to the non-existent node with id: " + targetNode_id);
	}

	var link = new Link(sourceNode, targetNode);
	var exists = false;

	this.linkList.forEach(function (item) {
		if (link.id === item.id) {
			exists = true;
		}
	});


	if (!exists) {
		this.linkList.push(link);
		sourceNode.addChild(targetNode);
	}
	else {
		console.log("LINK EXIST: " + " source: " + link.source.id + " => " + link.target.id);
	}

	if (!(link.source.id in this.adjacency)) {
		this.adjacency[link.source.id] = {};
	}
	if (!(link.target.id in this.adjacency[link.source.id])) {
		this.adjacency[link.source.id][link.target.id] = [];
	}
	this.adjacency[link.source.id][link.target.id].push(link);
};

Graph.prototype.getNode = function (nodeID) {
	var node = this.graph[nodeID];
	return node;
};

Graph.prototype._getAdjacents = function (nodeID) {
	var node = this.graph[nodeID];
	return this.adjacency[node.id];
};

Graph.prototype.getNodes = function (node) {
	return this.nodeList;
};

Graph.prototype.getLinks = function () {
	return this.linkList;
};

function printNode(node) {
	var adjacentsRepresentation = "";
	if (node.getAdjacents() == 0) {
		adjacentsRepresentation = "no children";
	} else {
		adjacentsRepresentation = node
			.getAdjacents().map(function (item) {
				return item.id;
			})
			.join(", ");
	}
	return node.id + " => " + adjacentsRepresentation;
}
Graph.prototype.toString = function () {
	return this.nodeList.map(printNode);
};


Graph.prototype.loadJSON = function (json_string) {
	var json_object = JSON.parse(json_string);
	var nodes = json_object["nodes"];
	for (let index = 0; index < nodes.length; index++) {
		var node = nodes[index];
		this.addObject(node);
	}

	var links = json_object["links"];
	for (let index = 0; index < links.length; index++) {
		var link = links[index];
		this.addLink(link.source, link.target);
	}
	console.log("Graph.loadJSON ");
	console.log(this.graph);
};

//
Graph.prototype.getNodesAtLevel = function (level) {
	return [];
};

Graph.prototype.visit = function (graph, node, level, callback) {
	callback(node, level);
}


Graph.prototype.visit_breadth_first = function (starting_node, callback) {
	var max = 0;

	if (starting_node && starting_node.getAdjacents().length > 0) {
		var depth = -1;
		var fifo = [];
		var nodes_at_level = [];

		fifo.push(starting_node);
		while (fifo.length > 0) {
			var node = fifo.shift();

			if (node.depth >= depth) {
				if (depth > -1) {
					callback(depth, nodes_at_level);
				}
				depth++;
				max = Math.max(max, nodes_at_level.length);
				nodes_at_level = [];
			}
			node.depth = depth;
			nodes_at_level.push(node);
			node.getAdjacents().forEach(function (item, index) {
				item.depth = depth;
				fifo.push(item);
				//  console.log("item #: " + item.id + " (level: " + level);
			});
		}
		callback(depth, nodes_at_level);
		return Math.max(max, nodes_at_level.length);
	}
	return 0;
};

/**
 *  N-ary Tree Postorder Traversal
 *  Depth First Traversal:  Preorder
 *  Preorder (Root, Left, Right) : 1 2 4 5 3 6
 *
 *        1
 *      / | \
 *    2   3  6
 *   / \
 *  4   5
 *
 * @param {*} starting_node
 * @param {*} callback
 */
Graph.prototype.visit_Preorder = function (starting_node, callback) {
	callback(starting_node);
	var children_count = starting_node.getAdjacents().length;

	for (var i = 0; i < children_count; i++) {
		var child = starting_node.getAdjacents()[i];
		this.visit_Preorder(child, callback);
	}
}

/**
 *  Depth First Traversal:  Post order
 *  Post order (Root, Left, Right) : 1 2 4 5 3 6
 * 
 *         1
 *      / | \
 *    2   3  6
 *   / \
 *  4   5
 * 
 * 
 * 
 * 
 * 
 */
 Graph.prototype.visit_Postorder = function (starting_node, callback) {
	var children_count = starting_node.getAdjacents().length;

	for (var i = 0; i < children_count; i++) {
		var child = starting_node.getAdjacents()[i];
		this.visit_Postorder(child, callback);
	}

	callback(starting_node);
}

// =============================================================
//                          Graph Utils
// =============================================================

function visit_nodes_at_level(level, nodes_at_level) {
	maxDepth++;
	var to_string = nodes_at_level
		.map(function (item) {
			return item.id + " (" + item.depth + ")";
		})
		.join(", ");
	console.log("Level " + level + ": " + to_string);
}

function to_string_node_list(node_list) {
	var to_string = node_list
		.map(function (item) {
			return item.id + " (" + item.depth + ")";
		})
		.join(", ");

	return to_string;
}

function build_nodes_at_level() {
	var nodes_by_level = [];

	graph.visit_breadth_first(root_node, function (level, nodes_at_current_level) {
		// console.log("Level " + level + ": " + to_string);
		nodes_by_level[level] = nodes_at_current_level;
	});
	return nodes_by_level;
}