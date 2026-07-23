// =============================================================
// Supports Graph structure and operations (ES module)
// -------------------------------------------------------------
//  Author: Marc Mouries
// =============================================================

// =============================================================
//                          Node
// =============================================================
export class Node {
	constructor(id, data) {
		this.id = id;
		this.data = data;
		this.level = 1;
		this.path = "1";
		this.children = [];
		this.parent = null;
		this.isCollapsed = false;
	}

	toString() {
		return "Node " + this.id + " (" + this.x + ", " + this.y + ")";
	}

	addChild(node) {
		this.children.push(node);
	}

	getAdjacents() {
		return this.children;
	}

	isAdjacent(node) {
		return this.children.indexOf(node) > -1;
	}

	getChildAt(i) {
		return this.children[i];
	}

	getFirstChild() {
		return this.getChildAt(0);
	}

	getChildrenCount() {
		return this.children.length;
	}

	getIndex() {
		return this.parent.children.indexOf(this);
	}

	isLeaf() {
		return this.children && this.children.length === 0;
	}

	hasChild() {
		return this.children && this.children.length > 0;
	}

	getLastChild() {
		return this.getChildAt(this.getChildrenCount() - 1);
	}

	isAncestorCollapsed() {
		if (this.parent == null) {
			return false;
		}
		return this.parent.isCollapsed
			? true
			: this.parent.id === -1
				? false
				: this.parent.isAncestorCollapsed();
	}

	/** is this node the first child of its parent? */
	isLeftMost() {
		if (!this.parent) {
			return true;
		}
		return this.parent.getFirstChild() === this;
	}

	/** is this node the last child of its parent? */
	isRightMost() {
		if (!this.parent) {
			return true;
		}
		return this.parent.getLastChild() === this;
	}

	getLeftSibling() {
		if (this.parent === null || this.isLeftMost()) {
			return null;
		}
		const index = this.parent.children.indexOf(this);
		return this.parent.children[index - 1];
	}

	getRightSibling() {
		if (this.parent === null || this.isRightMost()) {
			return null;
		}
		const index = this.parent.children.indexOf(this);
		return this.parent.children[index + 1];
	}

	getLeftMostChild() {
		if (this.getChildrenCount() === 0) return null;
		return this.children[0];
	}

	getRightMostChild() {
		if (this.getChildrenCount() === 0) return null;
		return this.children[this.getChildrenCount() - 1];
	}

	hasLeftSibling() {
		return !this.isLeftMost();
	}
}

// =============================================================
//                          Link
// =============================================================
export class Link {
	constructor(source, target) {
		this.id = source.id + "-" + target.id;
		this.source = source;
		this.target = target;
	}
}

// =============================================================
//                          Graph
// =============================================================
export class Graph {
	constructor() {
		this.graph = {};
		this.nodeList = [];
		this.linkList = [];
		this.adjacency = {};
		this.changed = false;
		this.root = null;
	}

	/**
	 * Create a node from a plain object and add it to the graph. When the
	 * object carries a `parentId`, the node is linked to its parent.
	 */
	addObject(object) {
		const node = new Node(object.id, object);

		if (object.parentId) {
			node.parent = this.getNode(object.parentId);
			if (!node.parent) {
				console.error("Parent node not found for parentId: " + object.parentId);
			} else {
				node.level = node.parent.level + 1;
				const nodeIndex = node.parent.children.push(node) - 1;
				const parentPath = node.parent ? node.parent.path : "";
				node.path = parentPath === "" ? `${nodeIndex + 1}` : `${parentPath}-${nodeIndex + 1}`;
			}
		} else {
			this.root = node;
		}
		this.addNode(node);
		this.changed = true;
		return node;
	}

	addNode(node) {
		if (!(node.id in this.graph)) {
			this.nodeList.push(node);
			this.graph[node.id] = node;
		} else {
			console.warn("Node already exists: " + node.id);
		}
		return node;
	}

	getRootNode() {
		return this.root;
	}

	/** A node is a root when it is not the target of any link. */
	isRoot(node) {
		let exist = false;
		this.linkList.forEach((link) => {
			if (link.target.id === node.id) {
				exist = true;
			}
		});
		return !exist;
	}

	addLink(sourceNode_id, targetNode_id) {
		const sourceNode = this.getNode(sourceNode_id);
		if (sourceNode === undefined) {
			throw new TypeError("Trying to add a link to the non-existent node with id: " + sourceNode_id);
		}
		const targetNode = this.getNode(targetNode_id);
		if (targetNode === undefined) {
			throw new TypeError("Trying to add a link to the non-existent node with id: " + targetNode_id);
		}

		const link = new Link(sourceNode, targetNode);
		let exists = false;
		this.linkList.forEach((item) => {
			if (link.id === item.id) {
				exists = true;
			}
		});

		if (!exists) {
			this.linkList.push(link);
			sourceNode.addChild(targetNode);
		}

		if (!(link.source.id in this.adjacency)) {
			this.adjacency[link.source.id] = {};
		}
		if (!(link.target.id in this.adjacency[link.source.id])) {
			this.adjacency[link.source.id][link.target.id] = [];
		}
		this.adjacency[link.source.id][link.target.id].push(link);
		return link;
	}

	getNode(nodeID) {
		return this.graph[nodeID];
	}

	_getAdjacents(nodeID) {
		const node = this.graph[nodeID];
		return this.adjacency[node.id];
	}

	getNodes() {
		return this.nodeList;
	}

	getLinks() {
		return this.linkList;
	}

	toString() {
		return this.nodeList.map(printNode);
	}

	/**
	 * Load a graph from a JSON string or object of the form
	 * `{ nodes: [...], links: [...] }`.
	 */
	loadJSON(json_input) {
		const json_object = typeof json_input === "string" ? JSON.parse(json_input) : json_input;

		const nodes = json_object["nodes"] || [];
		for (let index = 0; index < nodes.length; index++) {
			this.addObject(nodes[index]);
		}

		const links = json_object["links"] || [];
		for (let index = 0; index < links.length; index++) {
			const link = links[index];
			this.addLink(link.source, link.target);
		}
		return this;
	}

	getNodesAtLevel(/* level */) {
		return [];
	}

	visit(graph, node, level, callback) {
		callback(node, level);
	}

	visit_breadth_first(starting_node, callback) {
		let max = 0;

		if (starting_node && starting_node.getAdjacents().length > 0) {
			let depth = -1;
			const fifo = [];
			let nodes_at_level = [];

			fifo.push(starting_node);
			while (fifo.length > 0) {
				const node = fifo.shift();

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
				node.getAdjacents().forEach((item) => {
					item.depth = depth;
					fifo.push(item);
				});
			}
			callback(depth, nodes_at_level);
			return Math.max(max, nodes_at_level.length);
		}
		return 0;
	}

	/** Depth-first pre-order traversal (Root, Left, Right). */
	visit_Preorder(starting_node, callback) {
		callback(starting_node);
		const children_count = starting_node.getAdjacents().length;
		for (let i = 0; i < children_count; i++) {
			this.visit_Preorder(starting_node.getAdjacents()[i], callback);
		}
	}

	/** Depth-first post-order traversal. */
	visit_Postorder(starting_node, callback) {
		const children_count = starting_node.getAdjacents().length;
		for (let i = 0; i < children_count; i++) {
			this.visit_Postorder(starting_node.getAdjacents()[i], callback);
		}
		callback(starting_node);
	}
}

// =============================================================
//                          Graph Utils
// =============================================================
function printNode(node) {
	let adjacentsRepresentation = "";
	if (node.getAdjacents().length === 0) {
		adjacentsRepresentation = "no children";
	} else {
		adjacentsRepresentation = node
			.getAdjacents()
			.map((item) => item.id)
			.join(", ");
	}
	return node.id + " => " + adjacentsRepresentation;
}
