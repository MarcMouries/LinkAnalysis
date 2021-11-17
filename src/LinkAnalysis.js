// =============================================================
// LinkAnalysis
// -------------------------------------------------------------
//  author: Marc Mouries
// =============================================================

function log(msg) {
	if (false) {
		console.log(msg);
	}
}

// =============================================================
//                          LinkAnalysis
// =============================================================

var LinkAnalysis = (function () {

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


		this.dpr = 1;//window.devicePixelRatio || 1;
		this.original_scale = this.dpr;
		this.scale = this.original_scale;
		this.scaleMultiplier = 0.9;
		this.startDragOffset = { x: 0, y: 0 };

		/**
		 *  Graph Layout
		*/
		this.layout = new MRadialLayout();
		//this.layout = new TreeLayout();
		/**
		 *  Show grid
		*/
		this.show_grid = options.show_grid || false;

		/**
		 *  Show zoom
		*/
		show_zoom = options.show_zoom || true;

		/**
		 *  ID of the node the graph will be centered on
		*/
		center_on_node_id = options.center_on_node_id;

		/**
		 *  Contains list of icons by type
		*/
		icon_by_node_type = options.icon_by_node_type || [];

		/**
		 *  Stores the panning offset between the initial location and the canvas location after is has been panned
		*/
		this.translatePos = { x: 0, y: 0 };

		/**
		 *  the accumulated horizontal(X) & vertical(Y) panning the user has done in total
		 */
		this.netPanningX = 0, this.netPanningY = 0;

		/**
		 *  coordinates of the last move
		 */
		this.lastMoveX = 0, this.lastMoveY = 0;

		console.log("LinkAnalysis");
		console.log("center_on_node_id = " + center_on_node_id);
		console.log("icon_by_node_type = " + icon_by_node_type);
		console.log("show_zoom         = " + show_zoom);
		console.log("show_grid         = " + this.show_grid);
		console.log("icon_by_node_type = ");
		console.log(icon_by_node_type);


		this.graph = new Graph();
		this.nodes_at_level = [];

		var linkAnalysis = this;
		var self = this;


		// the imgs[] array now holds fully loaded images
		mcanvas = new MCanvas(chart_container);
		console.log("mcanvas (" + mcanvas.getWidth() + "x" + mcanvas.getHeight());
		ctx = mcanvas.getContext();

		//			this.addEventListeners();
		/////////////
		console.log("getComputedStyle");
		console.log("----------------");

		const style = document.defaultView.getComputedStyle(mcanvas.canvas, null);
		this.stylePaddingLeft = parseInt(style["paddingLeft"], 10);
		this.stylePaddingTop = parseInt(style["paddingTop"], 10);
		this.styleBorderLeft = parseInt(style["borderLeftWidth"], 10);
		this.styleBorderTop = parseInt(style["borderTopWidth"], 10);
		// Some pages have fixed-position bars (like the stumbleupon bar) at the top or left of the page
		// They will mess up mouse coordinates and this fixes that
		var html = document.body.parentNode;
		this.htmlTop = html.offsetTop;
		this.htmlLeft = html.offsetLeft;
		console.log("htmlLeft: " + this.htmlLeft);
		console.log("htmlTop: " + this.htmlTop);
		console.log("mcanvas.getOffset: ");
		console.log(mcanvas.getOffset());

		this.zoomIn = function () {
			this.scale /= this.scaleMultiplier;
			console.log("zoomIn: " + this.scale);
			this.render("zoom");

		};
		this.zoomOut = function () {
			this.scale *= this.scaleMultiplier;
			console.log("zoomOut: " + this.scale);
			this.render("zoom");
		};

		this.resetZoom = function () {
			this.scale = this.original_scale;
			this.translatePos = { x: 0, y: 0 };
			this.startDragOffset = { x: 0, y: 0 };
			this.netPanningX = 0, this.netPanningY = 0;
			console.log("resetZoom: " + this.scale);
			this.render("zoom");
		};

		var addZoom = function (container, top, left) {
			var div_zoom = document.createElement("DIV");
			div_zoom.setAttribute("id", "zoom_buttons");
			container.appendChild(div_zoom);

			var css = `
		    	#zoom_buttons {
			    	position: absolute;
			    	width: 30px;
			    	top: ${top}px;
			    	left: ${left}px;
		     	}
				.zoomButton {
					padding: 0px;
					width: 35px;
					height: 35px;
					margin: 0px 0px 2px 0px;
					font-size: 28px;
					font-weight: 500;
				}`;
			var style = document.createElement('style');
			style.appendChild(document.createTextNode(css));
			document.head.appendChild(style);

			var zoom_plus = document.createElement("INPUT");
			zoom_plus.setAttribute("type", "button");
			zoom_plus.setAttribute("value", "+");
			zoom_plus.setAttribute("id", "zoom_plus");
			zoom_plus.setAttribute("class", "zoomButton");
			div_zoom.appendChild(zoom_plus);

			var zoom_minus = document.createElement("INPUT");
			zoom_minus.setAttribute("type", "button");
			zoom_minus.setAttribute("value", "-");
			zoom_minus.setAttribute("id", "zoom_minus");
			zoom_minus.setAttribute("class", "zoomButton");
			div_zoom.appendChild(zoom_minus);

			var zoom_reset = document.createElement("INPUT");
			zoom_reset.setAttribute("type", "button");
			zoom_reset.setAttribute("value", "↺");
			zoom_reset.setAttribute("id", "zoom_reset");
			zoom_reset.setAttribute("class", "zoomButton");
			div_zoom.appendChild(zoom_reset);

			var bPlus = document.getElementById("zoom_plus");

			bPlus.addEventListener("click", function () { self.zoomIn(); }, false);
			zoom_minus.addEventListener("click", function () { self.zoomOut(); }, false);
			zoom_reset.addEventListener("click", function () { self.resetZoom(); }, false);
		}
		/**
		 * 
		 */
		var renderLink = function (link) {
			mcanvas.drawLine(link.source.x, link.source.y, link.target.x, link.target.y, LINK_COLOR, LINK_WIDTH);
		};

		var renderNode = function (node) {
			log(`renderNode: ${node.data.id}: ${node.x},${node.y} ${node.data._icon}`);

			//mcanvas.drawPoint(node.x, node.y, node.radius, node.data.id);

			// NODE RING
			var ring_width = 10;
			var ring_radius = node.radius + ring_width;
			var ring_color = "";
			if (node.isClicked) {
				ring_color = COLOR_SELECTED_NODE;
			} else if (node.isBelowMouse) {
				ring_color = COLOR_HOVER_NODE;
			}
			//log(`drawRing: ${node.data.id}: ${node.x},${node.y}  , ring_width = ${ring_width}`);

			mcanvas.drawRing(node.x, node.y, ring_radius, ring_color, "", ring_width);

			// NODE IMAGE
			if (node.data._icon) {
				ctx.drawImage(node.data._icon,
					node.x - NODE_ICON_WIDTH / 2,
					node.y - NODE_ICON_WIDTH / 2,
					NODE_ICON_WIDTH, NODE_ICON_WIDTH);
			}
			else {
				log(`renderNode: ${node.data.id}: ${node.x},${node.y} ${node.data._icon}`);

			}
			var padding_node_title = 0;
			var maxLineWidth = 1.5 * (2 * node.radius);
			// CENTER TEXT
			var y = node.y + 18; //padding_node_title;
			mcanvas.drawText(node.x, node.y + 28, node.data.id, FONT, TEXT_COLOR, maxLineWidth, ",");
			//mcanvas.drawTextBG("B. " + node.data.id, node.x, node.y, font, 0, COLOR_BACKGROUND);
		};

		var drawBorder = function () {
			//log("MChartView.drawBorder");
			mcanvas.drawBorder(this.background_color);
		};

		var deselectNodes = function (nodes) {
			for (var i = 0; i < nodes.length; i++) {
				var node = nodes[i];
				if (self.selection != node || self.selection == null) {
					node.isClicked = false;
				}
			}
		}

		/**
		 * MOUSE DOWN
		 * @param {*} event 
		 * @param {*} callback 
		 */
		var handleMouseDown = function (event, callback) {
			// tell the browser we're handling this event
			event.preventDefault();
			event.stopPropagation();

			linkAnalysis.mouseDown = true;
			var mouse = linkAnalysis.getMouse(event);
			// initial mouse click signaling the start of the dragging motion: we save the location of the user's mouse.
			// dragging offest = current mouse - panning
			self.startDragOffset.x = mouse.x - self.translatePos.x;
			self.startDragOffset.y = mouse.y - self.translatePos.y;

			// last move is used to calculate the delta between mouse move so we don't need to substract the translation
			self.lastMoveX = mouse.x;
			self.lastMoveY = mouse.y;

			var info_mouse_action = document.getElementById("mouse_action");
			info_mouse_action.innerHTML = "Mouse Action: " + "Down";

			var mouseXT = parseInt((mouse.x - self.translatePos.x) / self.scale);
			var mouseYT = parseInt((mouse.y - self.translatePos.y) / self.scale);

			// Node Selection
			var nodes = linkAnalysis.graph.getNodes();
			for (var i = 0; i < nodes.length; i++) {
				var node = nodes[i];
				if (pointInCircle(mouseXT, mouseYT, node)) {
					node.isClicked = true;
					self.selection = node;
					self.dragoffx = mouseXT - node.x;
					self.dragoffy = mouseYT - node.y;
					self.dragging_node = true;
					self.valid = false;
					deselectNodes(nodes);
					linkAnalysis.render();
					callback(node); // Callback to listerer(node);
					return;
				}
			}
			// did not return so no node was selected. User clicked on the canvas
			self.dragging_node = false;
			self.selection = null;
			deselectNodes(nodes);
			linkAnalysis.render();
		};

		/**
		 * MOUSE Move
		 * @param {*} event 
		 */
		var handleMouseMove = function (event) {
			var mouse = linkAnalysis.getMouse(event);

			// tell the browser we're handling this event
			event.preventDefault();
			event.stopPropagation();

			// DRAG CANVAS
			if (self.mouseDown && !self.selection) {
				self.translatePos.x = mouse.x - self.startDragOffset.x;
				self.translatePos.y = mouse.y - self.startDragOffset.y;

				// dx & dy are the distance the mouse has moved since the last mousemove event
				var dx = mouse.x - self.lastMoveX;
				var dy = mouse.y - self.lastMoveY;

				// reset the vars for next mousemove
				self.lastMoveX = mouse.x;
				self.lastMoveY = mouse.y;

				// accumulate the amount of panning
				self.netPanningX += dx;
				self.netPanningY += dy;

				//console.log("move: dx: " + dx + ", dy " + dy);
				//console.log("move: start drag.: " + self.startDragOffset.x + ", dy " + self.startDragOffset.y);
				console.log("move: netPanningX: " + self.netPanningX + ", netPanningY " + self.netPanningY);
			}

			var mouseXT = parseInt((mouse.x - self.translatePos.x) / self.scale);
			var mouseYT = parseInt((mouse.y - self.translatePos.y) / self.scale);



			var coord_norm = document.getElementById("coord_screen");
			var coord_trans = document.getElementById("coord_transf");
			coord_norm.innerHTML = "Screen Coordinates: " + mouse.x + "/" + mouse.y;
			//coord_trans.innerHTML = "Transf. Coordinates: " + mouseXT + "/" + mouseYT;
			coord_trans.innerHTML = "netPanning: " + self.netPanningX + "/" + self.netPanningY;

			var info_mouse_action = document.getElementById("mouse_action");
			info_mouse_action.innerHTML = "Mouse Action: " + "Hovering";


			// Highlight Node when mouse over
			if (!self.dragging_node) {
				var newCursor;
				var nodes = linkAnalysis.graph.getNodes();
				for (var i = 0; i < nodes.length; i++) {
					var node = nodes[i];
					//if (pointInCircle(event.clientX, event.clientY, node)) {
					//if (pointInCircle(mouse.Y, mouse.Y, node)) {
					if (pointInCircle(mouseXT, mouseYT, node)) {
						newCursor = 'pointer';  //grab
						if (!node.isBelowMouse) console.log("handle Move: Mouse over node '" + node.data.id + "'");
						node.isBelowMouse = true;
						break;
					} else {
						node.isBelowMouse = false;
					}
				}
				if (!newCursor) {
					//mcanvas.setCursor('move');
				}
				else {
					//mcanvas.setCursor(newCursor);
				}
			}
			if (self.dragging_node) {
				info_mouse_action.innerHTML = "Mouse Action: " + "dragging node";
				// We don't want to drag the object by its top-left corner,
				// we want to drag from where we clicked.
				// Thats why we saved the offset and use it here
				self.selection.x = mouseXT - self.dragoffx;
				self.selection.y = mouseYT - self.dragoffy;

				self.valid = false; // Something's dragging so we must redraw
			}
			linkAnalysis.render();
		};

		/**
		 * MOUSE Up
		 * @param {*} event 
		 */
		var handleMouseUp = function (event) {
			linkAnalysis.mouseDown = false;
			linkAnalysis.dragging_node = false;

			if (linkAnalysis.current_node) {
				console.log("linkAnalysis.current_node " + linkAnalysis.current_node.data.id + " isClicked");
				linkAnalysis.nodeClickHandler(controller.current_node);
			}
		};

		if (show_zoom) {
			//var computedStyle = getComputedStyle(this.canvas);
			//console.log("canvas offsetLeft: " + this.canvas.offsetLeft);
			var top = 72;
			var button_width = 40;
			//var left = this.canvas.width + this.canvas.offsetLeft - button_width; 
			var left = mcanvas.getWidth() + mcanvas.getOffset().x - button_width;
			addZoom(chart_container, top, left);
		}

		addEventListener("mouseup", handleMouseUp, false);
		addEventListener("mousemove", handleMouseMove, false);
		addEventListener("mousedown", function (event) {
			handleMouseDown(event, linkAnalysis.nodeClickHandler);
		});

		LinkAnalysis.prototype.render = function (/* optional */ renderTrigger) {
			mcanvas.clear();

			ctx.save();
			ctx.translate(this.translatePos.x, this.translatePos.y);
			ctx.scale(this.scale, this.scale);
			//ctx.translate(-this.translatePos.x, -this.translatePos.y);

			// BACKGROUND
			/*
			mcanvas.drawBackground(
				0, //- this.netPanningX,
				0, //- this.netPanningY,
				this.getWidth(), 
				this.getHeight());
*/
			// Draw point do debug panning
			//var pointX = 100 - this.netPanningX;
			//var pointY = 100 - this.netPanningY;
			//mcanvas.drawPoint(pointX, pointY, 50, "" + pointX + ", " + pointY, "red");

			// DRAW GRID
			if (this.show_grid) {
				mcanvas.drawGrid(
					0 - this.netPanningX,
					0 - this.netPanningY,
					this.getWidth() - this.netPanningX,
					this.getHeight() - this.netPanningY);
			}

			if (renderTrigger) {
				console.log("LinkAnalysis.event trigger = " + renderTrigger);
				if (renderTrigger == "zoom") {
					console.log("LinkAnalysis.render = " + this.scale);
					//ctx.translate(this.translatePos.x, this.translatePos.y);
					//ctx.scale(this.scale, this.scale);
				}
				console.log("mcanvas: " + mcanvas.getWidth().toFixed(2) + "x" + mcanvas.getHeight().toFixed(2));
			}

			if (center_on_node_id) {
				var starting_vertex = this.graph.getNode(center_on_node_id);
				if (starting_vertex == undefined) {
					throw new TypeError(
						`node_id_to_center_on: invalid node id: "${center_on_node_id}"`
					);
				}
			}

			if (this.graph.changed) {
				// calculate the depth of each node from the starting vertex

				/*
				this.graph.visit_breadth_first(starting_vertex, function (level, nodes_at_current_level) {
					// console.log("Level " + level + ": " + to_string);
					linkAnalysis.nodes_at_level[level] = nodes_at_current_level;
				});
				console.log("nodes_at_level");
				console.log(this.nodes_at_level);
*/
				this.center = mcanvas.getCenter();
				this.layout.Calculate_Positions(this.graph, starting_vertex, this.center);
				this.graph.changed = false;
			}
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
				//console.log("nodes.length = " + nodes.length);
				renderNode(node);
			}
			ctx.restore();
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

		/*
		/////////
				INITIALISE NODES
		/////////
		*/


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
			console.log("@TODO === addNodes ===");
			for (var i = 0; i < arguments.length; i++) {
				console.log(arguments[i]);
			}
		},

		loadJSON: function (json_string) {
			this.graph.loadJSON(json_string);
			this.initializeNodes();
		},


		initializeNodes: function () {
			console.log("@TODO === === === === === ===");
			console.log("@TODO === initializeNodes ===");
			console.log("@TODO === === === === === ===");

			var nodes = this.graph.getNodes();
			for (var i = 0; i < nodes.length; i++) {
				var node = nodes[i];
				node.radius = NODE_RADIUS;


				if (node.data.type) {
					var image;
					var image_elmt = icon_by_node_type[node.data.type];
					if (image_elmt) {
						node.data._icon = image_elmt.image;
						console.log(node.data.type + " = " + image_elmt);
						console.log(image_elmt.image.width + " x " + image_elmt.image.height);
					}
				}
			}

		},


		setNodeClickHandler: function (nodeClickHandler) {
			this.nodeClickHandler = nodeClickHandler;
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
			offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
			offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;

			mx = e.pageX - offsetX;
			my = e.pageY - offsetY;

			return { x: mx, y: my };
		},

		updateGraph: function () {
			this.render();
		},
	};

	return LinkAnalysis;
})();
