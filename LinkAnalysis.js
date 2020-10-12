
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
	//console.log("added node : " + node.id);
	this.addNode(node);
	return node;
};

Graph.prototype.addNode = function (node) {
	if (!(node.id in this.graph)) {
		this.nodeList.push(node);
		this.graph[node.id] = node;
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
		throw new TypeError(
			"Trying to add a link to the non-existent node with id: " + sourceNode_id
		);
	}
	var targetNode = this.getNode(targetNode_id);
	if (targetNode == undefined) {
		throw new TypeError(
			"Trying to add a link to the non-existent node with id: " + targetNode_id
		);
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

	if (!(link.source.id in this.adjacency)) {
		this.adjacency[link.source.id] = {};
	}
	if (!(link.target.id in this.adjacency[link.source.id])) {
		this.adjacency[link.source.id][link.target.id] = [];
	}

	//console.log("link source: " + link.source.id);
	//console.log("link target: " + link.target.id);
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
}
Graph.prototype.getLinks = function () {
	return this.linkList;
}

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

	graph.visit_breadth_first(root_node, function (
		level,
		nodes_at_current_level
	) {
		// console.log("Level " + level + ": " + to_string);
		nodes_by_level[level] = nodes_at_current_level;
	});
	return nodes_by_level;
}

// =============================================================
//                          MRadialLayout
// =============================================================
function MRadialLayout() {}

MRadialLayout.Calculate_Positions = function (graph, starting_vertex, center) {
	//log(`MRadialLayout.Calculate_Positions: ${starting_vertex.data.id}`);

	var RADIUS_LEVEL = 140;

	if (!graph || graph.getNodes().length == 0) {
		console.error("MRadialLayout: can't run on an empty graph.");
		return;
	}
	if (starting_vertex == 'undefined') {
		console.error(
			"MRadialLayout: can't run without a starting vertex. Which node should be the center?");
		return;
	}
	if (center == 'undefined') {
		console.error("MRadialLayout: can't run without a center set.");
		return;
	}

	// start angle = //Math.PI * 1.5;
	
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
			centerAdjust = (-starting_vertex.angleRange + starting_vertex.angleRange / children_count) / 2;
		}
		child.angle = starting_vertex.angle + (slice_angle * i) + centerAdjust;
		child.angleRange = slice_angle;
		//console.log("slice_angle = " + slice_angle);
		//console.log("child _angle = " + slice_angle * c);
		var cx = RADIUS_LEVEL; //* child.depth;
		var cy = 0;

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
		this.background_color = "#FFFFFF"; //"#F5F5F5";
		COLOR_HOVER_NODE = options.color_hover_node || "#84a9ac";
		COLOR_SELECTED_NODE = options.color_selected_node || "#3b6978";
		LINK_COLOR = options.link_color || "#3b6978";
		LINK_LINE_WIDTH = options.link_line_width || "3";
		node_id_to_center_on = options.node_id_to_center_on;
		icon_by_node_type = options.icon_by_node_type || [];

		console.log("LinkAnalysis");
		console.log("node_id_to_center_on = "  + node_id_to_center_on);
		console.log("icon_by_node_type = "  + icon_by_node_type);
		console.log(icon_by_node_type);





		var font = "12px Arial"
		var text_color = "#333";



		this.NODE_RADIUS = 20;

		var NODE_GROUP_CLASS = "nodeXXX";
		var image_width = 35;
		var image_height = image_width;
		var node_width = image_width;
		var node_height = image_width;

		var icon_width = 40;
		var icon_heigth = 40;

		this.graph = new Graph();
		this.nodes_at_level = [];

		var linkAnalysis = this;

		// the imgs[] array now holds fully loaded images
		mcanvas = new MCanvas({container: chart_container});
		ctx = mcanvas.getContext();
		//log(mcanvas);
		//log("MChartView.getWidth = " + this.getWidth());
		//log("MChartView.getHeight = " + this.getHeight());

		//			this.addEventListeners();
		/////////////
		console.log("getComputedStyle");
		console.log("----------------");

		const style = document.defaultView.getComputedStyle(mcanvas.canvas, null);
		this.stylePaddingLeft = parseInt(style['paddingLeft'], 10);
		this.stylePaddingTop = parseInt(style['paddingTop'], 10);
		this.styleBorderLeft = parseInt(style['borderLeftWidth'], 10);
		this.styleBorderTop = parseInt(style['borderTopWidth'], 10);
		// Some pages have fixed-position bars (like the stumbleupon bar) at the top or left of the page
		// They will mess up mouse coordinates and this fixes that
		var html = document.body.parentNode;
		this.htmlTop = html.offsetTop;
		this.htmlLeft = html.offsetLeft;
		console.log(" this.htmlTop: " + this.htmlTop);
		console.log(" this.htmlTop: " + this.htmlTop);
		//////////////


		var renderLink = function (link) {
			//log("renderLink " + link.id);
			var strokeStyle = LINK_COLOR;
			var lineWidth = LINK_LINE_WIDTH;
			mcanvas.drawLine(link.source.x, link.source.y, link.target.x, link.target.y,
				strokeStyle,
				lineWidth);
		}
		var renderNode = function (node) {
			//log(`MChartView.renderNode: ${node.data.id}: ${node.x},${node.y} `);

			var ring_width = 10;
			var ring_radius = node.radius + ring_width;
			if (node.isClicked) {
				mcanvas.drawRing(node.x, node.y, ring_radius, COLOR_SELECTED_NODE, "", ring_width);

			} else if (node.isBelowMouse) {
				mcanvas.drawRing(node.x, node.y, ring_radius, COLOR_HOVER_NODE,	"", ring_width);
			}


			var image_url = null;
			if (node.data.type) {
				/*
				if (node.data.type == "case")      { image_url= "icon_case_base64";        }
				if (node.data.type == "arrest")    { image_url= "icon_arrest_base64";      }
				if (node.data.type == "vehicle")   { image_url= "icon_vehicle_base64"      }
				if (node.data.type == "address")   { image_url= "icon_home_base64";        }
				if (node.data.type == "location")  { image_url= "icon_location_base64";    }
				if (node.data.type == "court_case"){ image_url= "icon_court_base64";       }
				if (node.data.type == "person")    {
					if (node.data.photo) {
						image_url= node.data.photo;
					} 
				}
				*/
				var icon_element = icon_by_node_type[node.data.type];
				var icon_url = icon_element ? icon_element.url : null;



				//console.log(node.data.type + " = " + image_url);
				//console.log(node.data.type + " = " + icon_url);

				//mcanvas.drawImage
				//var icon_x = this.x - icon_width / 2; // to fit into circle
				//var icon_y = this.y - icon_heigth / 2; // to fit into circle
				//context.drawImage(image, icon_x, icon_y, icon_width, icon_heigth);

			}


			mcanvas.drawPoint(node.x, node.y, node.radius, node.data.type);

			//mcanvas.drawTextBG("B. " + node.data.id, node.x, node.y, font, 0, this.background_color);

			var padding_node_title = 0;
			var maxLineWidth = 1.5 * (2 * node.radius);
			// CENTER TEXT
			var y = node.y + padding_node_title;
			mcanvas.drawText(node.x, y, node.data.id, font, text_color, maxLineWidth, ",");


		}

		var drawBorder = function () {
			//log("MChartView.drawBorder");
			//mcanvas.drawBorder(this.background_color);
		}


		var handleMouseDown = function (event, callback) {
			//event.preventDefault();

			var mouse = linkAnalysis.getMouse(event);
			//console.log("handleMouse_Down mouse @ " + mouse.x + "," + mouse.y);

			var nodes = linkAnalysis.graph.getNodes();
			for (var i = 0; i < nodes.length; i++) {
				var node = nodes[i];
				if (pointInCircle(mouse.x, mouse.y, node)) {
					//	if (pointInCircle(event.clientX, event.clientY, node)) {
					//console.log("handleMouse_Down node '" + node.data.id + "' isClicked");
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
		}
		var handleMouseMove = function (event) {
			//event.stopPropagation();
			var mouse = linkAnalysis.getMouse(event);

			// Highlight Node when mouse over
			var nodes = linkAnalysis.graph.getNodes();
			for (var i = 0; i < nodes.length; i++) {
				var node = nodes[i];
				if (pointInCircle(mouse.x, mouse.y, node)) {
					//if (pointInCircle(event.clientX, event.clientY, node)) {
					console.log("handleMouse_Move node '" + node.data.id + "' isBelowMouse");

					node.isBelowMouse = true;
				} else {
					node.isBelowMouse = false;
				}
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
		}
		var handleMouseUp = function (event) {
			//console.log(" handleMouse UP");
			linkAnalysis.dragging = false;


			if (linkAnalysis.current_node) {
				console.log("linkAnalysis.current_node " + linkAnalysis.current_node.data.id +
					" isClicked");
				linkAnalysis.nodeClickHandler(controller.current_node);
			}
			linkAnalysis.render();
		}

		addEventListener("mouseup", handleMouseUp, false);
		addEventListener("mousemove", handleMouseMove, false);
		addEventListener("mousedown", function (event) {
			console.log("nodeClickHandler=" + linkAnalysis.nodeClickHandler);
			handleMouseDown(event, linkAnalysis.nodeClickHandler);
		});

		LinkAnalysis.prototype.render = function () {
			console.log("LinkAnalysis.node_id_to_center_on = "  + this.node_id_to_center_on);

			if (node_id_to_center_on) {
				var starting_vertex = this.graph.getNode(node_id_to_center_on);
				if (starting_vertex == undefined) {
					throw new TypeError(`node_id_to_center_on: invalid node id: "${node_id_to_center_on}"`);
				}
			}

			if (this.nodes_at_level.length == 0) {
				// calculate the depth of each node from the starting vertex
				this.graph.visit_breadth_first(starting_vertex, function (level,
					nodes_at_current_level) {
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
		}
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
			node.radius = this.NODE_RADIUS;
			//linkAnalysis.updateGraph();
		},

		addLink: function (sourceNode_id, targetNode_id) {
			//console.log("LinkAnalysis addLink: " + sourceNode_id + " / " + targetNode_id);
			this.graph.addLink(sourceNode_id, targetNode_id);
			//linkAnalysis.updateGraph();
		},

		/**
		 * accepts variable number of arguments
		 */
		addNodes: function() {
			console.log("=== addNodes ===" );
			for (var i = 0; i < arguments.length; i++) {
				console.log(arguments[i]);
			}
		},

		loadJSON: function (json_string) {
			//console.error("loadJSON  NOT IMPLEMENTED");
			var json_object = JSON.parse( json_string );

			var nodes = json_object['nodes'];
			for (let index = 0; index < nodes.length; index++) {
				var node = nodes[index];
				this.addObject(node);
			}

			var links = json_object['links'];
			for (let index = 0; index < links.length; index++) {
				var link = links[index];
				this.addLink(link.source, link.target);
			}
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
		// If you wanna be super-correct this can be tricky,
		// we have to worry about padding and borders

		getMouse: function (e) {
			var element = mcanvas.canvas,
				offsetX = 0,
				offsetY = 0,
				mx, my;

			// Compute the total offset
			if (element.offsetParent !== undefined) {
				do {
					offsetX += element.offsetLeft;
					offsetY += element.offsetTop;
				} while (element = element.offsetParent);
			}

			// Add padding and border style widths to offset
			// Also add the offsets in case there's a position:fixed bar
			offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
			offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;

			mx = e.pageX - offsetX;
			my = e.pageY - offsetY;

			//mx = e.pageX ;
			//my = e.pageY ;

			// We return a simple javascript object (a hash) with x and y defined
			return {
				x: mx,
				y: my
			};
		},

		updateGraph: function () {
			this.render();
		}
	}



	function Circle(x, y, radius, fill, stroke) {
		this.startingAngle = 0;
		this.endAngle = 2 * Math.PI;
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.fill = fill;
		this.stroke = stroke;
		this.isClicked = false;
		this.isBelowMouse = false;
		this.offset = {
			x: 0,
			y: 0
		};


		Circle.prototype.drawImage__ = function (context, image) {
			var icon_x = this.x - icon_width / 2; // to fit into circle
			var icon_y = this.y - icon_heigth / 2; // to fit into circle
			context.drawImage(image, icon_x, icon_y, icon_width, icon_heigth);
		}

		this.draw = function (context) {


			//console.log("x=" + this.x + ", y=" + this.y + " r=" + this.radius);

			context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
			context.fill();

			// TODO
			// IconByNodeType does not exist in the class Circle
			var node_type = "case";

			var icon_element = this.IconByNodeType[node_type];
			if (icon_element) {
				var image = icon_element.image;
				if (!image) {
					console.log("=====");
					console.log(ICON_LIST[node_type]);
					console.log("=====");
				}
				this.drawImage(context, image);
			} else {
				console.log("IconByNodeType " + this.IconByNodeType +
					" does not exist in the class Circle");

			}

			//console.log("isBelowMouse: " + this.isBelowMouse);
			if (this.isClicked) {
				//this.drawRing(context, color_ring_isActivated);
				this.drawRing(context, "blue");
			} else if (this.isBelowMouse) {
				//this.drawRing(context, color_ring_isBelowMouse);
				this.drawRing(context, "green");
			}
		}
	}
	return LinkAnalysis;
})();