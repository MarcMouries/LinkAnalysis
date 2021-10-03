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
	this.depth = -1;
	this.adjacentList = [];
}

Node.prototype.addAdjacent = function (node) {
	this.adjacentList.push(node);
};

Node.prototype.getAdjacents = function (node) {
	return this.adjacentList;
};

Node.prototype.isAdjacent = function (node) {
	return this.adjacentList.indexOf(node) > -1;
};

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
}

/**
 *
 */
Graph.prototype.addObject = function (object) {
	var node = new Node(object.id, object);
	this.addNode(node);
	this.changed = true;
	return node;
};

Graph.prototype.addNode = function (node) {
	console.log("adding node : " + node.id);

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
		sourceNode.addAdjacent(targetNode);
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
		adjacentsRepresentation = "∅";
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

Graph.prototype.loadJSON = function () {
	console.error("Graph.prototype.loadJSON  NOT IMPLEMENTED");
};

//
Graph.prototype.getNodesAtLevel = function (level) {
	return [];
};

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