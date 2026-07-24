(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  function __accessProp(key) {
    return this[key];
  }
  var __toCommonJS = (from) => {
    var entry = (__moduleCache ??= new WeakMap).get(from), desc;
    if (entry)
      return entry;
    entry = __defProp({}, "__esModule", { value: true });
    if (from && typeof from === "object" || typeof from === "function") {
      for (var key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(entry, key))
          __defProp(entry, key, {
            get: __accessProp.bind(from, key),
            enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
          });
    }
    __moduleCache.set(from, entry);
    return entry;
  };
  var __moduleCache;
  var __returnValue = (v) => v;
  function __exportSetter(name, newValue) {
    this[name] = __returnValue.bind(null, newValue);
  }
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, {
        get: all[name],
        enumerable: true,
        configurable: true,
        set: __exportSetter.bind(all, name)
      });
  };

  // src/globals.js
  var exports_globals = {};
  __export(exports_globals, {
    Node: () => Node,
    MRadialLayout: () => MRadialLayout,
    Link: () => Link,
    Graph: () => Graph
  });

  // src/trigo.js
  var exports_trigo = {};
  __export(exports_trigo, {
    to_radians: () => to_radians,
    to_degrees: () => to_degrees,
    rotate: () => rotate,
    pointInCircle: () => pointInCircle,
    midpoint: () => midpoint,
    getPointOnArc: () => getPointOnArc,
    findAngle: () => findAngle,
    distanceXY: () => distanceXY,
    convertMousePositionToCoordinateGraph: () => convertMousePositionToCoordinateGraph
  });
  function convertMousePositionToCoordinateGraph(mousePos, center) {
    return {
      x: mousePos.x - center.x,
      y: -1 * (mousePos.y - center.y)
    };
  }
  function to_radians(degrees) {
    return degrees * (Math.PI / 180);
  }
  function to_degrees(radians) {
    return radians * (180 / Math.PI);
  }
  function distanceXY(x0, y0, x1, y1) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    return Math.sqrt(dx * dx + dy * dy);
  }
  function pointInCircle(point, circle) {
    return distanceXY(point.x, point.y, circle.x, circle.y) < circle.radius;
  }
  function getPointOnArc(cx, cy, r, angle) {
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle)
    };
  }
  function rotate(x, y, angle) {
    return {
      x: x * Math.cos(angle) - y * Math.sin(angle),
      y: x * Math.sin(angle) + y * Math.cos(angle)
    };
  }
  function findAngle(p1, p2) {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
  }
  function midpoint(x1, y1, x2, y2) {
    return {
      x: (x1 + x2) / 2,
      y: (y1 + y2) / 2
    };
  }

  // src/Graph.js
  class Node {
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
      return this.parent.isCollapsed ? true : this.parent.id === -1 ? false : this.parent.isAncestorCollapsed();
    }
    isLeftMost() {
      if (!this.parent) {
        return true;
      }
      return this.parent.getFirstChild() === this;
    }
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
      if (this.getChildrenCount() === 0)
        return null;
      return this.children[0];
    }
    getRightMostChild() {
      if (this.getChildrenCount() === 0)
        return null;
      return this.children[this.getChildrenCount() - 1];
    }
    hasLeftSibling() {
      return !this.isLeftMost();
    }
  }

  class Link {
    constructor(source, target) {
      this.id = source.id + "-" + target.id;
      this.source = source;
      this.target = target;
    }
  }

  class Graph {
    constructor() {
      this.graph = {};
      this.nodeList = [];
      this.linkList = [];
      this.adjacency = {};
      this.changed = false;
      this.root = null;
    }
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
    loadJSON(json_input) {
      const json_object = typeof json_input === "string" ? JSON.parse(json_input) : json_input;
      const nodes = json_object["nodes"] || [];
      for (let index = 0;index < nodes.length; index++) {
        this.addObject(nodes[index]);
      }
      const links = json_object["links"] || [];
      for (let index = 0;index < links.length; index++) {
        const link = links[index];
        this.addLink(link.source, link.target);
      }
      return this;
    }
    getNodesAtLevel() {
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
    visit_Preorder(starting_node, callback) {
      callback(starting_node);
      const children_count = starting_node.getAdjacents().length;
      for (let i = 0;i < children_count; i++) {
        this.visit_Preorder(starting_node.getAdjacents()[i], callback);
      }
    }
    visit_Postorder(starting_node, callback) {
      const children_count = starting_node.getAdjacents().length;
      for (let i = 0;i < children_count; i++) {
        this.visit_Postorder(starting_node.getAdjacents()[i], callback);
      }
      callback(starting_node);
    }
  }
  function printNode(node) {
    let adjacentsRepresentation = "";
    if (node.getAdjacents().length === 0) {
      adjacentsRepresentation = "no children";
    } else {
      adjacentsRepresentation = node.getAdjacents().map((item) => item.id).join(", ");
    }
    return node.id + " => " + adjacentsRepresentation;
  }

  // node_modules/graphjs/dist/esm/index.js
  var TWO_PI = Math.PI * 2;
  class Vector {
    constructor(x, y) {
      this.x = x || 0;
      this.y = y || 0;
      if (isNaN(x) || isNaN(y)) {
        console.warn(`Vector(): parameters are not number: (${x}), ${y} `);
      }
    }
    static add(v1, v2) {
      return new Vector(v1.x + v2.x, v1.y + v2.y);
    }
    static div(v, n) {
      let result = v.copy();
      return result.div(n);
    }
    static lerp(v1, v2, amount) {
      let result = v1.copy();
      return result.lerp(v2, amount);
    }
    static random(min, max) {
      let x = randomIntBounds(min, max);
      let y = randomIntBounds(min, max);
      return new Vector(x, y);
    }
    static sub(v1, v2) {
      return new Vector(v1.x - v2.x, v1.y - v2.y);
    }
    add(n) {
      if (n instanceof Vector) {
        this.x += n.x;
        this.y += n.y;
        return this;
      } else if (typeof n === "number") {
        this.x += n;
        this.y += n;
        return this;
      } else {
        console.error(`Parameter in Vector.add(n) Not supported: ${n})`);
      }
    }
    copy() {
      return new Vector(this.x, this.y);
    }
    div(n) {
      if (n === 0) {
        return this;
      }
      this.x /= n;
      this.y /= n;
      return this;
    }
    lerp(v1, amount) {
      this.x += (v1.x - this.x) * amount || 0;
      this.y += (v1.y - this.y) * amount || 0;
      return this;
    }
    heading() {
      const h = Math.atan2(this.y, this.x);
      return h;
    }
    magSq() {
      const x = this.x;
      const y = this.y;
      return x * x + y * y;
    }
    mag() {
      return Math.sqrt(this.magSq());
    }
    normalize() {
      return this.div(this.mag());
    }
    mult(n) {
      if (isNaN(n)) {
        console.error(`Vector.mult: parameter is not a number: (${n})`);
      }
      this.x *= n;
      this.y *= n;
      return this;
    }
    setMag(n) {
      return this.normalize().mult(n);
    }
    sub(n) {
      if (n instanceof Vector) {
        this.x -= n.x;
        this.y -= n.y;
        return this;
      } else if (typeof n === "number") {
        this.x -= n;
        this.y -= n;
        return this;
      } else {
        console.error(`Parameter in Vector.sub(n) Not supported: ${n})`);
      }
    }
    toString() {
      return "[" + this.x + ", " + this.y + "]";
    }
  }
  function randomIntBounds(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  var Vector_default = Vector;
  class Link2 {
    constructor(source, target, attributes = {}) {
      if (source.id && target.id) {
        this.id = source.id + " → " + target.id;
      } else {
        this.id = source + " → " + target;
      }
      this.source = source;
      this.target = target;
      const attrs = attributes || {};
      this.label = attrs.label;
      this.type = attrs.type;
      this.color = attrs.color;
      this.width = attrs.width;
      this.dashArray = attrs.dashArray ?? null;
      this.opacity = attrs.opacity;
      this.weight = attrs.weight;
      this.data = attrs.data ?? {};
    }
  }

  class Node2 {
    constructor(id, data) {
      this.id = id;
      this.data = data;
      this.children = [];
      this.isCollapsed = false;
      this.size = 20;
      this.mass = 13;
      this.radius = this.size;
      this.pos = new Vector_default(0, 0);
      this.velocity = new Vector_default(0, 0);
      this.acceleration = new Vector_default(0, 0);
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
    getTopMiddlePoint() {
      return {
        x: this.x + this.width / 2,
        y: this.y
      };
    }
    getBottomMiddlePoint() {
      return {
        x: this.x + this.width / 2,
        y: this.y + this.height
      };
    }
    getLeftMiddlePoint() {
      return {
        x: this.x,
        y: this.y + this.height / 2
      };
    }
  }

  class Graph2 {
    constructor() {
      this.graph = {};
      this.nodeList = new Map;
      this.linkList = [];
      this.adjacency = {};
      this.changed = false;
      this.root;
    }
    addNode(node) {
      if (!(node.id in this.graph)) {
        this.nodeList.set(node.id, node);
        this.graph[node.id] = node;
      } else {
        console.error("Node already exists: " + node.id);
      }
      return node;
    }
    getNode(nodeId) {
      return this.nodeList.get(nodeId);
    }
    removeNode(nodeId) {
      this.nodeList.delete(nodeId);
    }
    addObject(object) {
      var node = new Node2(object.id, object);
      if (object.parentId) {
        node.parent = this.getNode(object.parentId);
        if (!node.parent) {
          console.error("Parent node not found for parentId: " + object.parentId);
        } else {
          node.level = node.parent.level + 1;
          node.parent.children.push(node);
        }
      } else {
        this.root = node;
      }
      this.addNode(node);
      this.changed = true;
      return node;
    }
    getLinkCount() {
      return this.linkList.length;
    }
    getNodeCount() {
      return this.nodeList.size;
    }
    getNodes() {
      return Array.from(this.nodeList.values());
    }
    addLink(sourceNode_id, targetNode_id, attributes = {}) {
      var sourceNode = this.getNode(sourceNode_id);
      if (sourceNode == undefined) {
        throw new TypeError("Trying to add a link to the non-existent node with id: " + sourceNode_id);
      }
      var targetNode = this.getNode(targetNode_id);
      if (targetNode == undefined) {
        throw new TypeError("Trying to add a link to the non-existent node with id: " + targetNode_id);
      }
      var link = new Link2(sourceNode, targetNode, attributes);
      var exists = false;
      this.linkList.forEach(function(item) {
        if (link.id === item.id) {
          exists = true;
        }
      });
      if (!exists) {
        this.linkList.push(link);
        sourceNode.addChild(targetNode);
      } else {
        console.log("LINK EXIST: " + " source: " + link.source.id + " => " + link.target.id);
      }
      if (!(link.source.id in this.adjacency)) {
        this.adjacency[link.source.id] = {};
      }
      if (!(link.target.id in this.adjacency[link.source.id])) {
        this.adjacency[link.source.id][link.target.id] = [];
      }
      this.adjacency[link.source.id][link.target.id].push(link);
    }
    loadJSON(json_input) {
      var json_object = typeof json_input === "string" ? JSON.parse(json_input) : json_input;
      var nodes = json_object["nodes"] || [];
      for (let index = 0;index < nodes.length; index++) {
        this.addObject(nodes[index]);
      }
      var links = json_object["links"] || json_object["edges"] || [];
      for (let index = 0;index < links.length; index++) {
        var link = links[index];
        this.addLink(link.source, link.target, link);
      }
      return this;
    }
    getNeighbors(nodeId, depth = 1) {
      const start = this.getNode(nodeId);
      if (!start)
        return { nodes: [], links: [] };
      const neighbours = new Map;
      const link = (a, b) => {
        if (!neighbours.has(a))
          neighbours.set(a, new Set);
        neighbours.get(a).add(b);
      };
      for (const l of this.linkList) {
        link(l.source.id, l.target.id);
        link(l.target.id, l.source.id);
      }
      const visited = new Set([nodeId]);
      let frontier = [nodeId];
      for (let d = 0;d < depth; d++) {
        const next = [];
        for (const id of frontier) {
          for (const nid of neighbours.get(id) || []) {
            if (!visited.has(nid)) {
              visited.add(nid);
              next.push(nid);
            }
          }
        }
        frontier = next;
      }
      const nodes = Array.from(visited).map((id) => this.getNode(id));
      const links = this.linkList.filter((l) => visited.has(l.source.id) && visited.has(l.target.id));
      return { nodes, links };
    }
    getCentrality(nodeId) {
      const total = this.getNodeCount();
      if (total <= 1)
        return 0;
      let degree = 0;
      for (const l of this.linkList) {
        if (l.source.id === nodeId || l.target.id === nodeId)
          degree++;
      }
      return degree / (total - 1);
    }
    toString() {
      return Array.from(this.nodeList.values()).map(printNode2);
    }
  }
  function printNode2(node) {
    var adjacentsRepresentation = "";
    if (node.getAdjacents() == 0) {
      adjacentsRepresentation = "no children";
    } else {
      adjacentsRepresentation = node.getAdjacents().map(function(item) {
        return item.id;
      }).join(", ");
    }
    return node.id + " => " + adjacentsRepresentation;
  }

  class TreeNode extends Node2 {
    constructor(nodeID, nodeData) {
      super(nodeID, nodeData);
      this.children = [];
      this.parent;
      this.level = 1;
      this.path = "1";
    }
    addChild(node) {
      node.parent = this;
      return this.children.push(node);
    }
    getChildCount() {
      return this.children.length;
    }
    getChildAt(i) {
      return this.children[i];
    }
    getFirstChild() {
      return this.getChildAt(0);
    }
    getChildren() {
      return this.children;
    }
    getChildrenCount() {
      return this.children.length;
    }
    isLeftMost() {
      if (!this.parent || this.parent === null) {
        return true;
      } else {
        return this.parent.getFirstChild() === this;
      }
    }
    isRightMost() {
      if (!this.parent || this.parent === null) {
        return true;
      } else {
        return this.parent.getLastChild() === this;
      }
    }
    getLastChild() {
      return this.getChildAt(this.getChildrenCount() - 1);
    }
    getLeftSibling() {
      if (this.parent === null || this.isLeftMost()) {
        return null;
      } else {
        var index = this.parent.children.indexOf(this);
        return this.parent.children[index - 1];
      }
    }
    isLeaf() {
      return this.children && this.children.length == 0;
    }
    hasChild() {
      return this.children && this.children.length > 0;
    }
    isAncestorCollapsed() {
      if (this.parent == null) {
        return false;
      }
      return this.parent.isCollapsed ? true : this.parent.id === -1 ? false : this.parent.isAncestorCollapsed();
    }
    getRightSibling() {
      if (this.parent === null || this.isRightMost()) {
        return null;
      } else {
        var index = this.parent.children.indexOf(this);
        return this.parent.children[index + 1];
      }
    }
    getLeftMostChild() {
      if (this.getChildrenCount() == 0)
        return null;
      return this.children[0];
    }
    getRightMostChild() {
      if (this.getChildrenCount() == 0)
        return null;
      return this.children[this.getChildrenCount() - 1];
    }
    hasLeftSibling() {
      return !this.isLeftMost();
    }
    getIndex() {
      return this.parent.children.indexOf(this);
    }
  }

  class Tree extends Graph2 {
    constructor(data) {
      super();
      this.root = null;
      this.buildTree(data);
    }
    setRoot(nodeID) {
      this.root = nodeID;
    }
    getRoot() {
      return this.root;
    }
    isRoot(node) {
      return node === this.root;
    }
    traverseDF(callback) {
      function traverse(node) {
        callback(node);
        if (node.children) {
          node.children.forEach(traverse);
        }
      }
      traverse(this.root);
    }
    traverseBF(callback) {
      const queue = [this.root];
      while (queue.length) {
        const node = queue.shift();
        callback(node);
        node.children.forEach((child) => queue.push(child));
      }
    }
    traverseBottomUp(callback) {
      const traverse = (node) => {
        node.children.forEach((child) => traverse(child));
        callback(node);
      };
      traverse(this.root);
    }
    getNode(nodeId) {
      return this.nodeList.get(nodeId);
    }
    buildTree(data) {
      const rootData = data.find((node) => node.parentId === null);
      if (!rootData) {
        throw new Error("No root node found in the data");
      }
      this.root = new TreeNode(rootData.id, rootData.data);
      this.nodeList.set(rootData.id, this.root);
      const buildSubTree = (parentNode) => {
        const childrenData = data.filter((node) => node.parentId === parentNode.id);
        childrenData.forEach((childData) => {
          const childNode = new TreeNode(childData.id, childData.data, parentNode);
          parentNode.addChild(childNode);
          this.nodeList.set(childData.id, childNode);
          childNode.level = parentNode.level + 1;
          const parentPath = parentNode.path ? parentNode.path + "-" : "";
          childNode.path = parentPath + parentNode.children.length;
          buildSubTree(childNode);
        });
      };
      buildSubTree(this.root);
    }
  }

  class AbstractGraphLayout {
    constructor(graph, options) {
      this.graph = graph;
    }
    calculate_Positions(graph, starting_vertex, center) {
      console.error("not implemented in AbstractGraphLayout. Make sure to use a concrete layout class.");
    }
  }
  var DEFAULTS2 = {
    centerNode: null,
    ringSpacing: 150,
    startAngle: 0,
    center: null
  };

  class RadialLayout extends AbstractGraphLayout {
    constructor(graph, options = {}) {
      super(graph);
      this.graph = graph;
      this.options = { ...DEFAULTS2, ...options };
      this.center = this.options.center || { x: 0, y: 0 };
    }
    _resolveCenterNode() {
      const c = this.options.centerNode;
      if (c == null)
        return null;
      if (typeof c === "object" && typeof c.getAdjacents === "function")
        return c;
      return this.graph.getNode(c);
    }
    _syncPos(node) {
      if (node.pos) {
        node.pos.x = node.x;
        node.pos.y = node.y;
      } else {
        node.pos = { x: node.x, y: node.y };
      }
    }
    run() {
      const start = this._resolveCenterNode();
      if (!start) {
        console.error("RadialLayout: a valid `centerNode` (id or Node) is required.");
        return this;
      }
      if (this.graph.getNodes().length === 0) {
        console.error("RadialLayout: can't run on an empty graph.");
        return this;
      }
      const { ringSpacing, startAngle } = this.options;
      const visited = new Set;
      start.x = this.center.x;
      start.y = this.center.y;
      start.depth = 0;
      start.angle = 0;
      this._syncPos(start);
      visited.add(start.id);
      const place = (node, depth, angleStart, angleEnd) => {
        const children = node.getAdjacents().filter((child) => !visited.has(child.id));
        const count = children.length;
        if (count === 0)
          return;
        const slice = (angleEnd - angleStart) / count;
        const radius = depth * ringSpacing;
        children.forEach((child, i) => {
          visited.add(child.id);
          const childStart = angleStart + slice * i;
          const childEnd = childStart + slice;
          const angle = (childStart + childEnd) / 2;
          child.x = this.center.x + radius * Math.cos(angle);
          child.y = this.center.y + radius * Math.sin(angle);
          child.depth = depth;
          child.angle = angle;
          child.angleRange = slice;
          this._syncPos(child);
          place(child, depth + 1, childStart, childEnd);
        });
      };
      place(start, 1, startAngle, startAngle + 2 * Math.PI);
      return this;
    }
    calculate_Positions(graph, centerNode, center) {
      if (graph)
        this.graph = graph;
      if (centerNode != null)
        this.options.centerNode = centerNode;
      if (center)
        this.center = center;
      return this.run();
    }
  }
  var DEFAULTS3 = {
    rootOrientation: "NORTH",
    maximumDepth: 3,
    levelSeparation: 100,
    marginTop: 0,
    marginLeft: 10,
    siblingSpacing: 50,
    subtreeSeparation: 50,
    stackedLeaves: true,
    stackedIndentation: 40,
    nodeWidth: 0,
    nodeHeight: 0
  };

  class TreeLayout extends AbstractGraphLayout {
    constructor(tree, options) {
      super(tree);
      this.lastNodeAtLevel = [];
      this.options = Object.assign({}, DEFAULTS3, options);
      options || (options = {});
      for (let i in DEFAULTS3) {
        if (i in options) {
          this[i] = options[i];
        } else {
          this[i] = DEFAULTS3[i];
        }
      }
      if (this.levelSeparation < this.nodeHeight * 1.5) {
        this.levelSeparation = this.nodeHeight * 1.2;
      }
      if (this.siblingSpacing < this.nodeWidth * 0.5) {
        this.siblingSpacing = this.nodeWidth * 0.5;
      }
      if (this.subtreeSeparation < this.nodeWidth * 0.3) {
        this.subtreeSeparation = this.nodeWidth * 0.3;
      }
      console.log("TreeLayout constructed.");
      console.log(this);
      const firstWalk = (node, level) => {
        node.prelim = 0;
        node.modifier = 0;
        node.width = node.width || this.nodeWidth;
        node.height = node.height || this.nodeHeight;
        setNodeNeighbor(node, level);
        let leftSibling = node.getLeftSibling();
        if (node.isLeaf() || node.level == this.maximumDepth) {
          if (leftSibling) {
            node.prelim = leftSibling.prelim + this.siblingSpacing;
            let meanNodeSize = getMeanNodeSize(node, leftSibling);
            node.prelim += meanNodeSize;
          } else {
            node.prelim = 0;
          }
        } else {
          var children_count = node.getChildrenCount();
          for (let i = 0;i < children_count; i++) {
            let child = node.getAdjacents()[i];
            firstWalk(child, level + 1);
          }
          var midPoint = getMidPoint(node);
          if (leftSibling) {
            node.prelim += leftSibling.prelim + this.siblingSpacing;
            let meanNodeSize = getMeanNodeSize(node, leftSibling);
            node.prelim += meanNodeSize;
            node.modifier = node.prelim - midPoint;
            console.log("Calling Apportion for = " + node.id + " - level = " + level);
            apportion(node, level);
          } else {
            node.prelim = midPoint;
          }
        }
      };
      const getMidPoint = (node) => {
        var leftMostChild = node.getLeftMostChild();
        var rightMostChild = node.getRightMostChild();
        var midPoint = (leftMostChild.prelim + rightMostChild.prelim) / 2;
        return midPoint;
      };
      const setNodeNeighbor = (node) => {
        let isLeftMost = node.isLeftMost();
        let isRightMost = node.isRightMost();
        console.log("setNodeNeighbor NODE= " + node.id + " , level= " + node.level + ", isLeftMost(" + isLeftMost + ")" + ", isRightMost(" + isRightMost + ")");
        if (isRightMost) {
          this.lastNodeAtLevel[node.level] = node;
        } else if (isLeftMost) {
          node.neighbor = this.lastNodeAtLevel[node.level];
          if (node.neighbor) {}
        }
      };
      const getMeanNodeSize = (leftNode, rightNode) => {
        var meanNodeSize = 0;
        switch (this.rootOrientation) {
          case "NORTH":
          case "SOUTH":
            if (leftNode) {
              meanNodeSize = leftNode.width;
            }
            if (rightNode) {
              meanNodeSize = rightNode.width;
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
      };
      const getLeftmost = (node, currentLevel, searchDepth) => {
        if (currentLevel >= searchDepth) {
          return node;
        } else if (node.isLeaf()) {
          return null;
        } else {
          var children_count = node.getChildrenCount();
          for (var i = 0;i < children_count; i++) {
            let child = node.children[i];
            let leftmost = getLeftmost(child, currentLevel + 1, searchDepth);
            if (leftmost) {
              return leftmost;
            }
          }
        }
      };
      const apportion = (node, level) => {
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
          for (var l = 0;l < compareDepth; l += 1) {
            rightAncestor = rightAncestor.parent;
            leftAncestor = leftAncestor.parent;
            rightModSum += rightAncestor.modifier;
            leftModSum += leftAncestor.modifier;
          }
          var meanNodeSize = 10;
          var totalGap = firstChildLeftNeighbor.prelim + leftModSum + this.subtreeSeparation + meanNodeSize - (firstChild.prelim + rightModSum);
          if (totalGap > 0) {
            var subtree, subtreeMoveAux;
            var numberOfLeftSiblings = 0;
            for (subtree = node;subtree && subtree !== leftAncestor; subtree = subtree.getLeftSibling()) {
              numberOfLeftSiblings += 1;
            }
            if (subtree) {
              var portion = totalGap / numberOfLeftSiblings;
              subtreeMoveAux = node;
              while (subtreeMoveAux !== leftAncestor) {
                subtreeMoveAux.prelim += totalGap;
                subtreeMoveAux.modifier += totalGap;
                totalGap -= portion;
                subtreeMoveAux = subtreeMoveAux.getLeftSibling();
              }
            } else {
              return;
            }
          }
          compareDepth++;
          if (firstChild.getChildrenCount() === 0) {
            firstChild = getLeftmost(node, 0, compareDepth);
          } else {
            firstChild = firstChild.getFirstChild();
          }
          if (firstChild) {
            firstChildLeftNeighbor = firstChild.neighbor;
          }
        }
      };
      const secondWalk = (node, level, modSum) => {
        if (level <= this.maximumDepth) {
          node.x = this.marginLeft + node.prelim + modSum;
          node.y = this.marginTop + level * this.levelSeparation;
          console.log("\\secondWalk: Node(" + node.id + " / " + " / " + node.prelim + " / " + modSum);
          console.log("\\secondWalk: " + node.x + "," + node.y);
          if (this.stackedLeaves) {
            if (node.isLeaf()) {
              node.x = node.parent.x + this.stackedIndentation;
              node.y += node.getIndex() * this.levelSeparation;
            }
          }
          console.log(`secondWalk: ${node} (${node.x}, ${node.y})`);
          var children_count = node.getChildrenCount();
          for (var i = 0;i < children_count; i++) {
            var child = node.children[i];
            secondWalk(child, level + 1, modSum + node.modifier);
          }
        }
      };
      this.calculate_Positions = (root, center) => {
        console.log("calculate_Positions", this, center);
        console.log("root", root);
        let starting_node = root;
        firstWalk(starting_node, 0);
        secondWalk(starting_node, 0, 0);
      };
      this.getTreeDimension = () => {
        return { "TO DO": "" };
      };
    }
  }
  class DOMUtil {
    static getDimensions(element) {
      const tempElement = document.createElement("div");
      tempElement.style.position = "absolute";
      tempElement.style.visibility = "hidden";
      tempElement.appendChild(element);
      document.body.appendChild(tempElement);
      let originalHeight = element.offsetHeight;
      let originalWidth = element.offsetWidth;
      const computedStyle = getComputedStyle(element);
      const boxShadow = computedStyle.boxShadow;
      let totalWidth = originalWidth;
      let totalHeight = originalHeight;
      if (boxShadow !== "none") {
        const shadowValues = boxShadow.split(" ");
        let shadowBlur = parseFloat(shadowValues[3]);
        let shadowSpread = parseFloat(shadowValues[4]) || 0;
        let shadowOffsetX = parseFloat(shadowValues[1]);
        let shadowOffsetY = parseFloat(shadowValues[2]);
        let extraWidth = Math.max(shadowOffsetX + shadowBlur + shadowSpread, 0) - Math.min(shadowOffsetX, 0);
        let extraHeight = Math.max(shadowOffsetY + shadowBlur + shadowSpread, 0) - Math.min(shadowOffsetY, 0);
        totalWidth = originalWidth + extraWidth;
        totalHeight = originalHeight + extraHeight;
      }
      document.body.removeChild(tempElement);
      return {
        width: originalWidth,
        height: originalHeight,
        totalWidth,
        totalHeight
      };
    }
  }

  class SVGUtil {
    static addSVGElement_OLD(container) {
      let svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svgElement.setAttribute("width", "100%");
      svgElement.setAttribute("height", "100%");
      container.appendChild(svgElement);
      return svgElement;
    }
    static addSVGElement(container) {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("xmlns:xhtml", "http://www.w3.org/1999/xhtml");
      svg.setAttribute("version", "1.1");
      svg.setAttribute("class", "orgchart");
      svg.setAttribute("width", "100%");
      svg.setAttribute("height", "100%");
      svg.setAttribute("viewBox", "0 0 2000 2000");
      svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
      container.appendChild(svg);
      let isDragging = false;
      let previousX = 0;
      let previousY = 0;
      svg.addEventListener("mousedown", (event) => {
        isDragging = true;
        previousX = event.clientX;
        previousY = event.clientY;
      });
      svg.addEventListener("mousemove", (event) => {
        if (isDragging) {
          const dx = event.clientX - previousX;
          const dy = event.clientY - previousY;
          svg.setAttribute("transform", `translate(${dx}, ${dy})`);
          previousX = event.clientX;
          previousY = event.clientY;
        }
      });
      svg.addEventListener("mouseup", () => {
        isDragging = false;
      });
      return svg;
    }
    static createForeignObject(node, rootElement) {
      const foreignObject = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
      foreignObject.setAttribute("id", `node-${node.id}`);
      foreignObject.setAttribute("width", node.totalWidth);
      foreignObject.setAttribute("height", node.totalHeight);
      foreignObject.innerHTML = rootElement.outerHTML;
      return foreignObject;
    }
    static addGroup(svg, node, elementHTML) {
      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      const { width, height } = DOMUtil.getDimensions(elementHTML);
      group.innerHTML = `<foreignObject x="${node.x}" y="${node.y}" width="${width}" height="${height}">${elementHTML.outerHTML}</foreignObject>`;
      svg.appendChild(group);
    }
    static createGroup(svgElement) {
      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      svgElement.appendChild(group);
      return group;
    }
    static createLine(svg, x1, y1, x2, y2, text) {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", x1);
      line.setAttribute("y1", y1);
      line.setAttribute("x2", x2);
      line.setAttribute("y2", y2);
      line.classList.add("orgchart-line");
      line.setAttribute("stroke", "#022D42");
      line.setAttribute("stroke-width", 0.6);
      svg.appendChild(line);
      if (text) {
        this.createText(svg, text, (x1 + x2) / 2, y1 - 10);
      }
    }
    static createText(svg, text, x, y) {
      const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
      textElement.setAttribute("x", x);
      textElement.setAttribute("y", y);
      textElement.setAttribute("font-family", "Verdana");
      textElement.setAttribute("font-size", "12");
      textElement.setAttribute("fill", "black");
      textElement.setAttribute("text-anchor", "middle");
      textElement.textContent = text;
      svg.appendChild(textElement);
      return textElement;
    }
    static deleteLines(svg) {
      const lines = svg.querySelectorAll("line");
      lines.forEach((line) => line.remove());
    }
  }

  class Animation {
    static easeInOutQuart(time, from, distance, duration) {
      if ((time /= duration / 2) < 1) {
        return distance / 2 * time * time * time * time + from;
      } else {
        return -distance / 2 * ((time -= 2) * time * time * time - 2) + from;
      }
    }
    static animate(element, origPoint, destPoint, duration) {
      let startTime = null;
      let requestId;
      let animation = function(currentTime) {
        if (!startTime) {
          startTime = currentTime;
        }
        let runtime = currentTime - startTime;
        let x = Animation.easeInOutQuart(runtime, origPoint.x, destPoint.x - origPoint.x, duration);
        let y = Animation.easeInOutQuart(runtime, origPoint.y, destPoint.y - origPoint.y, duration);
        element.setAttribute("transform", `translate(${x}, ${y})`);
        if (runtime < duration) {
          requestId = requestAnimationFrame(animation);
        }
      };
      requestId = requestAnimationFrame(animation);
      setTimeout(() => {
        cancelAnimationFrame(requestId);
      }, duration);
    }
  }

  class SVG {
    constructor(container) {
      this.currentX = 0;
      this.currentY = 0;
      this.offsetX = 0;
      this.offsetY = 0;
      this.dragging = false;
      this.currentScale = 1;
      this.init(container);
    }
    init(container) {
      this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      this.svg.setAttribute("id", "svgCanvas");
      this.svg.setAttribute("width", "100%");
      this.svg.setAttribute("height", "100%");
      this.svgGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
      this.svgGroup.setAttribute("id", "group");
      this.svgGroup.setAttribute("transform", "translate(0, 0) scale(1)");
      this.svg.appendChild(this.svgGroup);
      this.svg.addEventListener("mousedown", this.startDrag.bind(this));
      this.svg.addEventListener("mousemove", this.drag.bind(this));
      this.svg.addEventListener("mouseup", this.endDrag.bind(this));
      this.svg.addEventListener("wheel", this.zoom.bind(this));
      container.appendChild(this.svg);
    }
    startDrag(evt) {
      this.dragging = true;
      this.currentX = evt.clientX;
      this.currentY = evt.clientY;
      const transform = this.svgGroup.getAttribute("transform");
      if (transform) {
        const translateMatch = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
        if (translateMatch) {
          this.offsetX = parseFloat(translateMatch[1]);
          this.offsetY = parseFloat(translateMatch[2]);
        }
      }
    }
    drag(evt) {
      if (this.dragging) {
        evt.preventDefault();
        const dx = evt.clientX - this.currentX;
        const dy = evt.clientY - this.currentY;
        this.svgGroup.setAttribute("transform", `translate(${this.offsetX + dx}, ${this.offsetY + dy}) scale(${this.currentScale})`);
      }
    }
    endDrag(evt) {
      this.dragging = false;
      const dx = evt.clientX - this.currentX;
      const dy = evt.clientY - this.currentY;
      this.offsetX += dx;
      this.offsetY += dy;
    }
    zoom(evt) {
      evt.preventDefault();
      const scaleFactor = evt.deltaY > 0 ? 0.9 : 1.1;
      this.currentScale *= scaleFactor;
      this.svgGroup.setAttribute("transform", `translate(${this.offsetX}, ${this.offsetY}) scale(${this.currentScale})`);
    }
  }

  class OrgChart {
    #nodeContentFunction = null;
    #nodeStyleFunction = null;
    delayPerLevel = 50;
    #defaultNodeTemplateHtml = function(node) {
      return `
      <div class="position-card">
        <div class="position-info">
          <div class="job-title">${node.data.job_title}</div>
          <div class="name">${node.data.name}</div>
        </div>
      <!-- position data -->
      </div>
    `;
    };
    constructor(container) {
      this.container = container;
      this.svg = new SVG(this.container);
      this.cssString = `

    .animate-opacity {
      transition: opacity 1s ease-in-out;
    }

    .position-card {
      align-items: flex-start;
      background: #ffffff;
      border-top: 10px solid #01778e;
      box-shadow: 0 1px 4px 2px hsla(0, 0%, 80%, 0.3);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
      display: flex;
      flex-direction: column;
      font-family: sans-serif;
      position: absolute;
      padding: 4px 8px;
      transition: top 0.3s ease-in-out, left 0.3s ease-in-out;
    }

    .position-card .name {
      font-size: 12px;
      font-weight: 300;
    }
    .position-card .job-title {
      font-size: 14px;
      font-weight: 500;
    }
    .links {
      position: relative;
    }
    .position-info {
      align-items: flex-start;
      background-color: white;
      display: flex;
      flex-direction: column;
      width: 100%;
    }

    .position-data {
      background-color: white;
      display: flex;
      flex-direction: row;
      align-content: center;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-around;
      width: 100%;
    }
    .child-count {
      height: 10px;
      width: 10px;
      padding: 4px;
      background-color: white;
      cursor: pointer;
      font-size: 0.5em;
      position: fixed;
      vertical-align: middle;
      text-align: center;
      __transform: translate(50%, 100%);
      box-shadow: 0 1px 4px 2px hsla(0, 0%, 80%, 0.3);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
    }
    
      `;
    }
    setNodeClass(nodeStyleFunction) {
      if (typeof nodeStyleFunction === "function") {
        this.#nodeStyleFunction = nodeStyleFunction;
      } else {
        throw new Error("nodeStyleFunction should be a function");
      }
    }
    setNodeHtml(nodeContentFunction) {
      if (typeof nodeContentFunction === "function") {
        this.#nodeContentFunction = nodeContentFunction;
      } else {
        throw new Error("nodeContentFunction should be a function");
      }
    }
    setData(data) {
      console.log("HERE in setData", data);
      this.tree = new Tree(data);
      console.log("tree", this.tree);
      const styleElement = document.createElement("style");
      styleElement.textContent = this.cssString;
      document.head.appendChild(styleElement);
    }
    #getNodeClassName = function(node) {
      return this.#nodeStyleFunction ? this.#nodeStyleFunction(node) : "";
    };
    #getNodeHtml = function(node) {
      const templateFunction = this.#nodeContentFunction || this.#defaultNodeTemplateHtml;
      return templateFunction(node);
    };
    animateNode(node, parentDelay = 0) {
      const group = this.svg.svg.querySelector(`[data-node-id="${node.id}"]`);
      const delay = parentDelay + node.level * this.delayPerLevel;
      if (node.parent) {
        const origPoint = { x: node.parent.x, y: node.parent.y };
        const destPoint = { x: node.x, y: node.y };
        group.setAttribute("transform", `translate(${origPoint.x}, ${origPoint.y})`);
        setTimeout(() => {
          Animation.animate(group, origPoint, destPoint, 1000);
        }, delay);
      } else {
        group.setAttribute("transform", `translate(${node.x}, ${node.y})`);
      }
      setTimeout(() => {
        group.style.opacity = 1;
      }, delay);
    }
    renderNodes() {
      const root = this.tree.getRoot();
      const templateFilled = this.#getNodeHtml(root);
      const tempElement = document.createElement("div");
      tempElement.innerHTML = templateFilled;
      const rootElement = tempElement.firstElementChild;
      const dimensions = DOMUtil.getDimensions(rootElement);
      console.log("rootElement: ", rootElement);
      console.log("dimensions: ", dimensions);
      this.treeLayout = new TreeLayout(this.tree, {
        nodeWidth: dimensions.width,
        nodeHeight: dimensions.height
      });
      this.treeLayout.calculate_Positions(root, { x: 100, y: 100 });
      console.log("treeLayout", this.treeLayout);
      var treeDimension = this.treeLayout.getTreeDimension();
      console.log(" -  treeDimension : ", treeDimension);
      const nodeGroups = [];
      const lineGroup = SVGUtil.createGroup(this.svg.svgGroup);
      this.tree.traverseBF((node) => {
        node.width = dimensions.width;
        node.height = dimensions.height;
        node.totalHeight = dimensions.totalHeight;
        node.totalWidth = dimensions.totalWidth;
        nodeGroups.push({ level: node.level, group: this.renderNode(node, false) });
        this.createLine(node, lineGroup);
      });
      nodeGroups.sort((a, b) => b.level - a.level).forEach((nodeGroup) => this.svg.svgGroup.appendChild(nodeGroup.group));
      this.svg.svgGroup.insertBefore(lineGroup, nodeGroups[0].group);
      this.tree.traverseBF((node) => {
        const delay = node.level * 6 * this.delayPerLevel;
        console.log(`delay for ${node.id} = ${delay}`);
        this.animateNode(node, delay);
      });
    }
    renderNode(node, animate = true) {
      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      group.setAttribute("data-node-id", node.id);
      const templateFilled = this.#getNodeHtml(node);
      const tempElement = document.createElement("div");
      tempElement.innerHTML = templateFilled;
      const rootElement = tempElement.firstElementChild;
      const className = this.#getNodeClassName(node);
      if (className) {
        rootElement.classList.add(className);
      }
      const foreignObject = SVGUtil.createForeignObject(node, rootElement);
      group.appendChild(foreignObject);
      if (animate) {
        this.animateNode(node);
      } else {
        group.setAttribute("transform", `translate(${node.x}, ${node.y})`);
      }
      group.style.opacity = 0;
      group.classList.add("animate-opacity");
      return group;
    }
    createLine = function(node) {
      console.log("createLine TODO check if stackedLeaves: " + node);
      if (node.parent && node.parent.isCollapsed) {
        return;
      }
      if (node.isLeaf()) {
        const leftMiddlePoint = node.getLeftMiddlePoint();
        const indentationPoint = { x: leftMiddlePoint.x - this.treeLayout.stackedIndentation / 2, y: leftMiddlePoint.y };
        SVGUtil.createLine(this.svg.svgGroup, leftMiddlePoint.x, leftMiddlePoint.y, indentationPoint.x, indentationPoint.y);
        SVGUtil.createLine(this.svg.svgGroup, indentationPoint.x, indentationPoint.y, indentationPoint.x, indentationPoint.y - this.treeLayout.levelSeparation);
      } else {
        if (node.level == 1) {
          if (!node.isCollapsed && node.children.length >= 1) {
            let leftMostChild = node.getLeftMostChild();
            let rightMostChild = node.getRightMostChild();
            const nodeStartY = node.y + node.height;
            const nextNodeY = leftMostChild.y;
            const distanceBetweenNodes = nextNodeY - nodeStartY;
            const midpoint2 = nodeStartY + distanceBetweenNodes / 2;
            let nodeMiddle = node.width / 2;
            SVGUtil.createLine(this.svg.svgGroup, leftMostChild.x + nodeMiddle, midpoint2, rightMostChild.x + nodeMiddle, midpoint2);
            const leftMostChildSouth = leftMostChild.getTopMiddlePoint();
            SVGUtil.createLine(this.svg.svgGroup, leftMostChildSouth.x, midpoint2, leftMostChildSouth.x, leftMostChildSouth.y);
            const rightMostChildSouth = rightMostChild.getTopMiddlePoint();
            SVGUtil.createLine(this.svg.svgGroup, rightMostChildSouth.x, midpoint2, rightMostChildSouth.x, leftMostChildSouth.y);
            const nodeBottomMiddle = node.getBottomMiddlePoint();
            SVGUtil.createLine(this.svg.svgGroup, nodeBottomMiddle.x, nodeBottomMiddle.y, nodeBottomMiddle.x, midpoint2);
            if (node.parent !== undefined) {
              const nodeTopMiddle = { x: node.x + node.width / 2, y: node.y };
              let intersectionPoint = { x: nodeBottomMiddle.x, y: nodeBottomMiddle.y + this.treeLayout.levelSeparation };
              intersectionPoint = { x: nodeTopMiddle.x, y: nodeTopMiddle.y - node.height / 2 };
              SVGUtil.createLine(this.svg.svgGroup, nodeTopMiddle.x, nodeTopMiddle.y, intersectionPoint.x, intersectionPoint.y);
            }
          }
        }
      }
    };
  }

  // src/globals.js
  Object.assign(globalThis, exports_trigo);
  globalThis.Graph = Graph;
  globalThis.Node = Node;
  globalThis.Link = Link;

  class MRadialLayout extends RadialLayout {
    Calculate_Positions(graph, centerNode, center) {
      return this.calculate_Positions(graph, centerNode, center);
    }
  }
  globalThis.MRadialLayout = MRadialLayout;
})();
