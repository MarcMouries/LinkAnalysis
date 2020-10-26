// =============================================================
// LinkAnalysis
// -------------------------------------------------------------
//  author: Marc Mouries
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
}

/**
 *
 */
Graph.prototype.addObject = function (object) {
	var node = new Node(object.id, object);
	this.addNode(node);
	return node;
};

Graph.prototype.addNode = function (node) {
	console.log("adding node : " + node.id);

	if (!(node.id in this.graph)) {
		this.nodeList.push(node);
		this.graph[node.id] = node;
	}
	else {
		console.log("ALREADY EXIST node : " + node.id);
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
		throw new TypeError("Trying to add a link to the non-existent node with id: " +	sourceNode_id);
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
			.getAdjacents()
			.map(function (item) {
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

	graph.visit_breadth_first(root_node, function (level,nodes_at_current_level	) {
		// console.log("Level " + level + ": " + to_string);
		nodes_by_level[level] = nodes_at_current_level;
	});
	return nodes_by_level;
}

// =============================================================
//                          MRadialLayout
// =============================================================
function MRadialLayout() { }

MRadialLayout.Calculate_Positions = function (graph, starting_vertex, center) {
	//log(`MRadialLayout.Calculate_Positions: ${starting_vertex.data.id}`);

	var DISTANCE_BETWEEN_LEVELS = 130;

	if (!graph || graph.getNodes().length == 0) {
		console.error("MRadialLayout: can't run on an empty graph.");
		return;
	}
	if (starting_vertex == "undefined") {
		console.error(
			"MRadialLayout: can't run without a starting vertex. Which node should be the center?"
		);
		return;
	}
	if (center == "undefined") {
		console.error("MRadialLayout: can't run without a center set.");
		return;
	}

	if (graph.isRoot(starting_vertex)) {
		starting_vertex.x = center.x;
		starting_vertex.y = center.y;
		starting_vertex.angle = 0;
		starting_vertex.angleRange = 2 * Math.PI;
		//log(`*** MRadialLayout ROOT id=${starting_vertex.id},
		//			x=${starting_vertex.x}, y=${starting_vertex.y}, depth=${starting_vertex.depth},
		//            angle=${to_degrees(starting_vertex.angle)}°- angleRange=${to_degrees(starting_vertex.angleRange)}°`);
	}

	var nodes = graph.getNodes();
	var children_count = starting_vertex.getAdjacents().length;
	//console.log(`*** MRadialLayout vertex id=${starting_vertex.id}: # children=${children_count}`);

	for (var i = 0; i < children_count; i++) {
		var child = starting_vertex.getAdjacents()[i];
		var slice_angle = starting_vertex.angleRange / children_count;

		// to center the vertices
		var centerAdjust = 0;
		if (child.depth > 1) {
			centerAdjust =
				(-starting_vertex.angleRange +
					starting_vertex.angleRange / children_count) /
				2;
		}
		child.angle = starting_vertex.angle + slice_angle * i + centerAdjust;
		child.angleRange = slice_angle;

		var cx = DISTANCE_BETWEEN_LEVELS;
		var cy = 0;

		if (i % 2 === 1) {
			console.log("even child = " + child.id);
			cx = cx * 1.3;
		}

		//var location = getPointOnArc(cx, cy, RADIUS, child.angle);
		var rotation = rotate(cx, cy, child.angle);
		//log(`*** MRadialLayout rotation =${rotation.x},${rotation.y}`);
		child.x = starting_vertex.x + rotation.x;
		child.y = starting_vertex.y + rotation.y;

		//log(`*** MRadialLayout child id=${child.id}, x=${child.x}, y=${child.y},depth=${child.depth},
		//           angle=${to_degrees(child.angle)}°- angleRange=${to_degrees(child.angleRange)}°`);

		//  RECURSIVE CALL on children
		MRadialLayout.Calculate_Positions(graph, child, center);
	}
};

// =============================================================
//                          LinkAnalysis
// =============================================================

var LinkAnalysis = (function () {
	var mcanvas = null;

	function LinkAnalysis(chart_container, options) {
		options || (options = {});

		// =============================================================
		//  DEFAULT VALUES
		// =============================================================
		COLOR_BACKGROUND = options.color_background || "#FFFFFF";
		COLOR_HOVER_NODE = options.color_hover_node || "#84a9ac";
		COLOR_SELECTED_NODE = options.color_selected_node || "#3b6978";
		LINK_COLOR = options.link_color || "#3b6978";
		LINK_WIDTH = options.link_width || 1;
		NODE_ICON_WIDTH = options.node_icon_width || 30;
		NODE_RADIUS = options.node_radius || 20;
		FONT = options.font || "10px Arial";
		TEXT_COLOR = options.font || "#080808";


		center_on_node_id = options.center_on_node_id;
		icon_by_node_type = options.icon_by_node_type || [];

		console.log("LinkAnalysis");
		console.log("center_on_node_id = " + center_on_node_id);
		console.log("icon_by_node_type = " + icon_by_node_type);
		console.log(icon_by_node_type);


		this.graph = new Graph();
		this.nodes_at_level = [];

		var linkAnalysis = this;

		// the imgs[] array now holds fully loaded images
		mcanvas = new MCanvas(chart_container);
		ctx = mcanvas.getContext();
		//ctx.setTransform(1, 0, 0, 1, 0, 0);

		//log(mcanvas);
		//log("MChartView.getWidth = " + this.getWidth());
		//log("MChartView.getHeight = " + this.getHeight());

		//			this.addEventListeners();
		/////////////
		console.log("getComputedStyle");
		console.log("----------------");

		const style = document.defaultView.getComputedStyle(
			mcanvas.canvas,
			null
		);
		this.stylePaddingLeft = parseInt(style["paddingLeft"], 10);
		this.stylePaddingTop = parseInt(style["paddingTop"], 10);
		this.styleBorderLeft = parseInt(style["borderLeftWidth"], 10);
		this.styleBorderTop = parseInt(style["borderTopWidth"], 10);
		// Some pages have fixed-position bars (like the stumbleupon bar) at the top or left of the page
		// They will mess up mouse coordinates and this fixes that
		var html = document.body.parentNode;
		this.htmlTop = html.offsetTop;
		this.htmlLeft = html.offsetLeft;
		console.log(" this.htmlTop: " + this.htmlTop);
		console.log(" this.htmlTop: " + this.htmlTop);
		//////////////

		var renderLink = function (link) {
			mcanvas.drawLine(link.source.x, link.source.y, link.target.x, link.target.y, LINK_COLOR, LINK_WIDTH);
		};

		var renderNode = function (node) {
			//log(`MChartView.renderNode: ${node.data.id}: ${node.x},${node.y} `);

			mcanvas.drawPoint(node.x, node.y, node.radius, node.data.id);

			var ring_width = 10;
			var ring_radius = node.radius + ring_width;
			//console.log("ring_radius: " + ring_radius);
			if (node.isClicked) {
				mcanvas.drawRing(node.x, node.y, ring_radius, COLOR_SELECTED_NODE, "", ring_width);

			} else if (node.isBelowMouse) {
				mcanvas.drawRing(node.x, node.y, ring_radius, COLOR_HOVER_NODE, "", ring_width);

			}
			else {
				//	mcanvas.setCursor('auto');
			}

			if (node.data._icon) {
				ctx.drawImage(node.data._icon,
					node.x - NODE_ICON_WIDTH / 2,
					node.y - NODE_ICON_WIDTH / 2,
					NODE_ICON_WIDTH, NODE_ICON_WIDTH);
			}



			//mcanvas.drawTextBG("B. " + node.data.id, node.x, node.y, font, 0, COLOR_BACKGROUND);

			var padding_node_title = 0;
			var maxLineWidth = 1.5 * (2 * node.radius);
			// CENTER TEXT
			var y = node.y + 18; //padding_node_title;
			mcanvas.drawText(node.x, node.y + 28, node.data.id, FONT, TEXT_COLOR, maxLineWidth, ",");
		};

		var drawBorder = function () {
			//log("MChartView.drawBorder");
			//mcanvas.drawBorder(this.background_color);
		};

		var handleMouseDown = function (event, callback) {
			// tell the browser we're handling this event
			event.preventDefault();
			event.stopPropagation();

			var mouse = linkAnalysis.getMouse(event);
			//console.log("handleMouse_Down mouse @ " + mouse.x + "," + mouse.y);

			var nodes = linkAnalysis.graph.getNodes();
			for (var i = 0; i < nodes.length; i++) {
				var node = nodes[i];
				if (pointInCircle(mouse.x, mouse.y, node)) {
					node.isClicked = true;
					linkAnalysis.selection = node;
					linkAnalysis.dragoffx = mouse.x - node.x;
					linkAnalysis.dragoffy = mouse.y - node.y;
					linkAnalysis.dragging = true;
					linkAnalysis.valid = false;
					// Callback to listerer(node);
					callback(node);
					return;
				} else {
					node.isClicked = false;
				}
			}
			linkAnalysis.render();
		};
		var handleMouseMove = function (event) {
			// tell the browser we're handling this event
			event.preventDefault();
			event.stopPropagation();
			var mouse = linkAnalysis.getMouse(event);

			// Highlight Node when mouse over
			var newCursor;
			var nodes = linkAnalysis.graph.getNodes();
			for (var i = 0; i < nodes.length; i++) {
				var node = nodes[i];
				if (pointInCircle(mouse.x, mouse.y, node)) {
					//					newCursor=s.cursor;
					newCursor = 'grab';
					//if (pointInCircle(event.clientX, event.clientY, node)) {
					console.log("handleMouse_Move node '" + node.data.id + "' isBelowMouse");
					node.isBelowMouse = true;
					break;

				} else {
					node.isBelowMouse = false;
				}
			}
			if (!newCursor) {
				mcanvas.setCursor('move');
			}
			else {
				mcanvas.setCursor(newCursor);
			}

			if (linkAnalysis.dragging) {
				// We don't want to drag the object by its top-left corner,
				// we want to drag from where we clicked.
				// Thats why we saved the offset and use it here
				linkAnalysis.selection.x = mouse.x - linkAnalysis.dragoffx;
				linkAnalysis.selection.y = mouse.y - linkAnalysis.dragoffy;
				linkAnalysis.valid = false; // Something's dragging so we must redraw
			}
			linkAnalysis.render();
		};
		var handleMouseUp = function (event) {
			//console.log(" handleMouse UP");
			linkAnalysis.dragging = false;

			if (linkAnalysis.current_node) {
				console.log("linkAnalysis.current_node " + linkAnalysis.current_node.data.id + " isClicked");
				linkAnalysis.nodeClickHandler(controller.current_node);
			}
			linkAnalysis.render();
		};

		addEventListener("mouseup", handleMouseUp, false);
		addEventListener("mousemove", handleMouseMove, false);
		addEventListener("mousedown", function (event) {
			//console.log("nodeClickHandler=" + linkAnalysis.nodeClickHandler);
			handleMouseDown(event, linkAnalysis.nodeClickHandler);
		});

		LinkAnalysis.prototype.render = function () {
			//console.log("LinkAnalysis.center_on_node_id = " + center_on_node_id);

			if (center_on_node_id) {
				var starting_vertex = this.graph.getNode(center_on_node_id);
				if (starting_vertex == undefined) {
					throw new TypeError(
						`node_id_to_center_on: invalid node id: "${center_on_node_id}"`
					);
				}
			}

			if (this.nodes_at_level.length == 0) {
				// calculate the depth of each node from the starting vertex
				this.graph.visit_breadth_first(starting_vertex, function (level, nodes_at_current_level) {
					// console.log("Level " + level + ": " + to_string);
					linkAnalysis.nodes_at_level[level] = nodes_at_current_level;
				});
				console.log("nodes_at_level");
				console.log(this.nodes_at_level);

				this.center = mcanvas.getCenter();
				MRadialLayout.Calculate_Positions(this.graph, starting_vertex, this.center);
			}

			mcanvas.clear();
			//mcanvas.drawBorder();

			// LINKS
			var links = this.graph.getLinks();
			for (var i = 0; i < links.length; i++) {
				var link = links[i];
				renderLink(link);
			}

			// NODES
			var nodes = this.graph.getNodes();
			for (var i = 0; i < nodes.length; i++) {
				var node = nodes[i];
				//log("LinkAnalysis render node: " + node.id);
				renderNode(node);
			}
		};
	}

	LinkAnalysis.prototype = {
		getContext: function () {
			return this.ctx;
		},

		getHeight: function () {
			return mcanvas.getHeight();
		},
		getWidth: function () {
			return mcanvas.getWidth();
		},

		addEventListener: function (type, listener) {
			mcanvas.addEventListener(type, listener);
		},

		addObject: function (object) {
			var node = this.graph.addObject(object);
			node.radius = NODE_RADIUS;

			//initialize the image
/*
				if (node.data.type == "person") {
					if (node.data.photo) {
						//image = new Image();
						image = document.createElement("IMG");
						image.onload = function () {
							ctx.drawImage(image, node.x - 20, node.y, 33, 33);
						};
						image.crossOrigin = "anonymous";
						image.src = node.data.photo;
					}
				} else {
				}
				*/


			if (node.data.type) {
				var image;
				var image_elmt = icon_by_node_type[node.data.type];
				if (image_elmt) {
					node.data._icon = image_elmt.image;
					//console.log(node.data.type + " = " + image_elmt);
					//console.log(image_elmt.image.width + " x " + image_elmt.image.height);
				}
			}

			//linkAnalysis.updateGraph();
		},

		addLink: function (sourceNode_id, targetNode_id) {
			console.log("LinkAnalysis addLink: " + sourceNode_id + " / " + targetNode_id);
			this.graph.addLink(sourceNode_id, targetNode_id);
			console.log(this.graph);
			//linkAnalysis.updateGraph();
		},

		/**
		 * accepts variable number of arguments
		 */
		addNodes: function () {
			console.log("=== addNodes ===");
			for (var i = 0; i < arguments.length; i++) {
				console.log(arguments[i]);
			}
		},

		loadJSON: function (json_string) {
			console.log("LOAD JSON");
			var json_object = JSON.parse(json_string);
			console.log(json_object);

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

			console.log(this.graph);
		},

		setNodeClickHandler: function (nodeClickHandler) {
			this.nodeClickHandler = nodeClickHandler;
			console.log("nodeClickHandler=" + this.nodeClickHandler);
		},

		show: function () {
			linkAnalysis.render();
		},

		// Creates an object with x and y defined,
		// set to the mouse position relative to the state's canvas
		// we have to worry about padding and borders
		getMouse: function (e) {
			var element = mcanvas.canvas,
				offsetX = 0,
				offsetY = 0,
				mx,
				my;

			// Compute the total offset
			if (element.offsetParent !== undefined) {
				do {
					offsetX += element.offsetLeft;
					offsetY += element.offsetTop;
				} while ((element = element.offsetParent));
			}

			// Add padding and border style widths to offset
			// Also add the offsets in case there's a position:fixed bar
			offsetX +=
				this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
			offsetY +=
				this.stylePaddingTop + this.styleBorderTop + this.htmlTop;

			mx = e.pageX - offsetX;
			my = e.pageY - offsetY;

			//mx = e.pageX ;
			//my = e.pageY ;

			// We return a simple javascript object (a hash) with x and y defined
			return {
				x: mx,
				y: my,
			};
		},

		updateGraph: function () {
			this.render();
		},
	};

	return LinkAnalysis;
})();
