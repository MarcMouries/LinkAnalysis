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
class Link {
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

class Node {
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

class Graph {
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
    const node = this.nodeList.get(nodeId);
    if (!node)
      return false;
    this.linkList = this.linkList.filter((l) => l.source.id !== nodeId && l.target.id !== nodeId);
    delete this.adjacency[nodeId];
    for (const src in this.adjacency)
      delete this.adjacency[src][nodeId];
    for (const other of this.nodeList.values()) {
      if (other.children && other.children.length) {
        other.children = other.children.filter((c) => c.id !== nodeId);
      }
      if (other.parent && other.parent.id === nodeId)
        other.parent = null;
    }
    delete this.graph[nodeId];
    this.nodeList.delete(nodeId);
    if (this.root && this.root.id === nodeId)
      this.root = null;
    this.changed = true;
    return true;
  }
  removeNodes(nodeIds) {
    let removed = 0;
    for (const id of nodeIds || [])
      if (this.removeNode(id))
        removed++;
    return removed;
  }
  removeLink(sourceId, targetId) {
    const before = this.linkList.length;
    this.linkList = this.linkList.filter((l) => !(l.source.id === sourceId && l.target.id === targetId));
    if (this.adjacency[sourceId])
      delete this.adjacency[sourceId][targetId];
    const src = this.nodeList.get(sourceId);
    if (src && src.children)
      src.children = src.children.filter((c) => c.id !== targetId);
    const removed = before - this.linkList.length;
    if (removed)
      this.changed = true;
    return removed;
  }
  removeLinks(pairs) {
    let removed = 0;
    for (const p of pairs || []) {
      removed += Array.isArray(p) ? this.removeLink(p[0], p[1]) : this.removeLink(p.source, p.target);
    }
    return removed;
  }
  addObject(object) {
    var node = new Node(object.id, object);
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
    var link = new Link(sourceNode, targetNode, attributes);
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
  addNodes(items) {
    return (items || []).map((item) => this.addObject(item));
  }
  addLinks(items) {
    for (const l of items || [])
      this.addLink(l.source, l.target, l);
    return this;
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
  getShortestPath(sourceId, targetId, options = {}) {
    if (!this.getNode(sourceId) || !this.getNode(targetId))
      return null;
    if (sourceId === targetId)
      return [sourceId];
    const adj = new Map;
    const add = (a, b, w) => {
      if (!adj.has(a))
        adj.set(a, []);
      adj.get(a).push({ to: b, w });
    };
    for (const l of this.linkList) {
      const w = typeof l.weight === "number" ? l.weight : 1;
      add(l.source.id, l.target.id, w);
      add(l.target.id, l.source.id, w);
    }
    const prev = new Map;
    if (options.weighted) {
      const dist = new Map([[sourceId, 0]]);
      const done = new Set;
      while (true) {
        let u = null;
        let best = Infinity;
        for (const [id, d] of dist)
          if (!done.has(id) && d < best) {
            best = d;
            u = id;
          }
        if (u == null || u === targetId)
          break;
        done.add(u);
        for (const { to, w } of adj.get(u) || []) {
          if (done.has(to))
            continue;
          const nd = best + w;
          if (nd < (dist.has(to) ? dist.get(to) : Infinity)) {
            dist.set(to, nd);
            prev.set(to, u);
          }
        }
      }
      if (!prev.has(targetId))
        return null;
    } else {
      const queue = [sourceId];
      const visited = new Set([sourceId]);
      let found = false;
      while (queue.length) {
        const u = queue.shift();
        if (u === targetId) {
          found = true;
          break;
        }
        for (const { to } of adj.get(u) || []) {
          if (!visited.has(to)) {
            visited.add(to);
            prev.set(to, u);
            queue.push(to);
          }
        }
      }
      if (!found)
        return null;
    }
    const path = [targetId];
    let cur = targetId;
    while (cur !== sourceId) {
      cur = prev.get(cur);
      if (cur == null)
        return null;
      path.push(cur);
    }
    return path.reverse();
  }
  filterNodes(predicate) {
    return this.getNodes().filter((node) => predicate(node));
  }
  search(query, options = {}) {
    let match;
    if (typeof query === "function") {
      match = query;
    } else {
      const valuesOf = (node) => {
        const data = node.data || {};
        const keys = options.fields || Object.keys(data);
        const parts = [String(node.id)];
        for (const k of keys) {
          const v = data[k];
          if (v != null && typeof v !== "object")
            parts.push(String(v));
        }
        return parts;
      };
      if (query instanceof RegExp) {
        match = (node) => valuesOf(node).some((v) => query.test(v));
      } else {
        const q = String(query).toLowerCase();
        match = (node) => valuesOf(node).some((v) => v.toLowerCase().includes(q));
      }
    }
    const out = this.filterNodes(match);
    return typeof options.limit === "number" ? out.slice(0, options.limit) : out;
  }
  toString() {
    return Array.from(this.nodeList.values()).map(printNode);
  }
}
function printNode(node) {
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

class TreeNode extends Node {
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

class Tree extends Graph {
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
var DEFAULTS = {
  gravity: 0.05,
  repulsion: 800,
  linkDistance: 180,
  linkStrength: 0.7,
  damping: 0.9,
  alphaDecay: 0.0228,
  alphaMin: 0.001,
  center: null,
  collisionRadius: null,
  collisionStrength: 0.8,
  theta: 0.9,
  bounds: null
};

class ForceDirected extends AbstractGraphLayout {
  constructor(graph, options = {}) {
    super(graph);
    this.graph = graph;
    const o = options || {};
    this.options = {
      gravity: o.gravity ?? o.GRAVITY ?? DEFAULTS.gravity,
      repulsion: o.repulsion ?? o.REPULSION ?? DEFAULTS.repulsion,
      linkDistance: o.linkDistance ?? DEFAULTS.linkDistance,
      linkStrength: o.linkStrength ?? DEFAULTS.linkStrength,
      damping: o.damping ?? DEFAULTS.damping,
      alphaDecay: o.alphaDecay ?? DEFAULTS.alphaDecay,
      alphaMin: o.alphaMin ?? DEFAULTS.alphaMin,
      center: o.center ?? DEFAULTS.center ?? { x: 0, y: 0 },
      collisionRadius: o.collisionRadius ?? DEFAULTS.collisionRadius,
      collisionStrength: o.collisionStrength ?? DEFAULTS.collisionStrength,
      theta: o.theta ?? DEFAULTS.theta,
      bounds: o.bounds ?? DEFAULTS.bounds
    };
    this.center = this.options.center;
    this.alpha = 1;
    this._running = false;
    this._ended = false;
    this._raf = null;
    this._listeners = { start: [], tick: [], end: [] };
    this.initNodes();
  }
  on(event, handler) {
    (this._listeners[event] ||= []).push(handler);
    return this;
  }
  off(event, handler) {
    const list = this._listeners[event];
    if (list)
      this._listeners[event] = list.filter((h) => h !== handler);
    return this;
  }
  emit(event, ...args) {
    const list = this._listeners[event];
    if (list)
      for (const h of list.slice())
        h(...args);
  }
  initNodes() {
    const nodes = this.graph.getNodes();
    const n = nodes.length || 1;
    const radius = this.options.linkDistance * Math.max(1, n / (2 * Math.PI));
    nodes.forEach((node, i) => {
      if (typeof node.x !== "number" || typeof node.y !== "number") {
        const angle = 2 * Math.PI * i / n;
        node.x = this.center.x + radius * Math.cos(angle);
        node.y = this.center.y + radius * Math.sin(angle);
      }
      if (typeof node.vx !== "number")
        node.vx = 0;
      if (typeof node.vy !== "number")
        node.vy = 0;
      this._syncPos(node);
    });
  }
  _syncPos(node) {
    if (node.pos) {
      node.pos.x = node.x;
      node.pos.y = node.y;
    } else {
      node.pos = { x: node.x, y: node.y };
    }
  }
  _resolveLinkDistance(link) {
    const d = this.options.linkDistance;
    return typeof d === "function" ? d(link) : d;
  }
  _resolveCollisionRadius(node) {
    const c = this.options.collisionRadius;
    if (c == null)
      return 0;
    return typeof c === "function" ? c(node) : c;
  }
  pinNode(nodeId, x, y) {
    const node = this.graph.getNode(nodeId);
    if (!node)
      return this;
    node.fx = x != null ? x : node.x;
    node.fy = y != null ? y : node.y;
    node.x = node.fx;
    node.y = node.fy;
    node.vx = 0;
    node.vy = 0;
    this._syncPos(node);
    return this;
  }
  unpinNode(nodeId) {
    const node = this.graph.getNode(nodeId);
    if (node) {
      node.fx = null;
      node.fy = null;
    }
    return this;
  }
  start() {
    if (this._running)
      return this;
    this._running = true;
    this._ended = false;
    this.emit("start");
    if (typeof requestAnimationFrame === "function") {
      const loop = () => {
        if (!this._running)
          return;
        this.tick();
        if (this._running)
          this._raf = requestAnimationFrame(loop);
      };
      this._raf = requestAnimationFrame(loop);
    } else {
      let guard = 0;
      while (this._running && this.alpha >= this.options.alphaMin && guard < 1e5) {
        this.tick();
        guard++;
      }
    }
    return this;
  }
  stop() {
    this._running = false;
    if (this._raf != null && typeof cancelAnimationFrame === "function") {
      cancelAnimationFrame(this._raf);
    }
    this._raf = null;
    return this;
  }
  restart(alpha = 1) {
    this.alpha = alpha;
    this._ended = false;
    if (!this._running)
      this.start();
    return this;
  }
  tick() {
    this._step(true);
    this.alpha *= 1 - this.options.alphaDecay;
    this.emit("tick", this.graph.getNodes(), this.graph.linkList || []);
    if (this.alpha < this.options.alphaMin && !this._ended) {
      this._ended = true;
      this._running = false;
      if (this._raf != null && typeof cancelAnimationFrame === "function") {
        cancelAnimationFrame(this._raf);
      }
      this._raf = null;
      this.emit("end");
    }
    return this;
  }
  applyForces() {
    this._step(false);
  }
  run() {
    return this.start();
  }
  _applyRepulsion(nodes) {
    if (this.options.repulsion === 0 || nodes.length < 2)
      return;
    if (this.options.theta <= 0 || nodes.length <= 16)
      this._repulsionExact(nodes);
    else
      this._repulsionBarnesHut(nodes);
  }
  _repulsionExact(nodes) {
    const repulsion = this.options.repulsion;
    for (let i = 0;i < nodes.length; i++) {
      for (let j = i + 1;j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let d2 = dx * dx + dy * dy;
        if (d2 === 0) {
          dx = i - j || 1;
          dy = 1;
          d2 = dx * dx + dy * dy;
        }
        const dist = Math.sqrt(d2);
        const force = repulsion / d2;
        a._fx -= dx / dist * force;
        a._fy -= dy / dist * force;
        b._fx += dx / dist * force;
        b._fy += dy / dist * force;
      }
    }
  }
  _repulsionBarnesHut(nodes) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of nodes) {
      if (n.x < minX)
        minX = n.x;
      if (n.y < minY)
        minY = n.y;
      if (n.x > maxX)
        maxX = n.x;
      if (n.y > maxY)
        maxY = n.y;
    }
    const size = Math.max(maxX - minX, maxY - minY) || 1;
    const root = { x: minX, y: minY, size, mass: 0, cx: 0, cy: 0, body: null, children: null };
    for (const n of nodes)
      this._bhInsert(root, n, 0);
    const theta2 = this.options.theta * this.options.theta;
    const repulsion = this.options.repulsion;
    for (const n of nodes)
      this._bhForce(n, root, theta2, repulsion);
  }
  _bhInsert(cell, node, depth) {
    const m = cell.mass;
    cell.cx = (cell.cx * m + node.x) / (m + 1);
    cell.cy = (cell.cy * m + node.y) / (m + 1);
    cell.mass = m + 1;
    if (cell.mass === 1) {
      cell.body = node;
      return;
    }
    if (cell.size < 0.001 || depth > 48) {
      cell.body = null;
      return;
    }
    if (!cell.children) {
      cell.children = [null, null, null, null];
      if (cell.body) {
        this._bhPlace(cell, cell.body, depth);
        cell.body = null;
      }
    }
    this._bhPlace(cell, node, depth);
  }
  _bhPlace(cell, node, depth) {
    const half = cell.size / 2;
    const right = node.x >= cell.x + half ? 1 : 0;
    const bottom = node.y >= cell.y + half ? 1 : 0;
    const q = bottom * 2 + right;
    let child = cell.children[q];
    if (!child) {
      child = { x: cell.x + right * half, y: cell.y + bottom * half, size: half, mass: 0, cx: 0, cy: 0, body: null, children: null };
      cell.children[q] = child;
    }
    this._bhInsert(child, node, depth + 1);
  }
  _bhForce(node, cell, theta2, repulsion) {
    if (cell.mass === 0)
      return;
    let dx = cell.cx - node.x;
    let dy = cell.cy - node.y;
    let d2 = dx * dx + dy * dy;
    if (!cell.children) {
      if (cell.body === node && cell.mass === 1)
        return;
      if (d2 === 0) {
        dx = 1;
        dy = 1;
        d2 = 2;
      }
      const dist = Math.sqrt(d2);
      const force = repulsion * cell.mass / d2;
      node._fx -= dx / dist * force;
      node._fy -= dy / dist * force;
      return;
    }
    if (cell.size * cell.size < theta2 * d2) {
      if (d2 === 0)
        return;
      const dist = Math.sqrt(d2);
      const force = repulsion * cell.mass / d2;
      node._fx -= dx / dist * force;
      node._fy -= dy / dist * force;
      return;
    }
    for (const child of cell.children)
      if (child)
        this._bhForce(node, child, theta2, repulsion);
  }
  _step(cool) {
    const nodes = this.graph.getNodes();
    const links = this.graph.linkList || [];
    const { linkStrength, gravity, damping } = this.options;
    for (const node of nodes) {
      node._fx = 0;
      node._fy = 0;
    }
    this._applyRepulsion(nodes);
    for (const link of links) {
      const s = link.source;
      const t = link.target;
      if (!s || !t)
        continue;
      const dx = t.x - s.x;
      const dy = t.y - s.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.000001;
      const desired = this._resolveLinkDistance(link);
      const k = (dist - desired) / dist * linkStrength;
      const fx = dx * k * 0.5;
      const fy = dy * k * 0.5;
      s._fx += fx;
      s._fy += fy;
      t._fx -= fx;
      t._fy -= fy;
    }
    for (const node of nodes) {
      node._fx += (this.center.x - node.x) * gravity;
      node._fy += (this.center.y - node.y) * gravity;
    }
    const scale = cool ? this.alpha : 1;
    for (const node of nodes) {
      if (node.fx != null && node.fy != null) {
        node.x = node.fx;
        node.y = node.fy;
        node.vx = 0;
        node.vy = 0;
      } else {
        node.vx = (node.vx + node._fx) * damping;
        node.vy = (node.vy + node._fy) * damping;
        node.x += node.vx * scale;
        node.y += node.vy * scale;
      }
      this._syncPos(node);
    }
    if (this.options.collisionRadius != null) {
      const strength = this.options.collisionStrength;
      for (let i = 0;i < nodes.length; i++) {
        for (let j = i + 1;j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const minDist = this._resolveCollisionRadius(a) + this._resolveCollisionRadius(b);
          if (minDist <= 0)
            continue;
          let dx = b.x - a.x;
          let dy = b.y - a.y;
          let d2 = dx * dx + dy * dy;
          if (d2 === 0) {
            dx = i - j || 1;
            dy = 1;
            d2 = dx * dx + dy * dy;
          }
          const dist = Math.sqrt(d2);
          if (dist >= minDist)
            continue;
          const aPinned = a.fx != null && a.fy != null;
          const bPinned = b.fx != null && b.fy != null;
          if (aPinned && bPinned)
            continue;
          const overlap = (minDist - dist) * strength;
          const ux = dx / dist;
          const uy = dy / dist;
          const aShare = aPinned ? 0 : bPinned ? 1 : 0.5;
          const bShare = bPinned ? 0 : aPinned ? 1 : 0.5;
          a.x -= ux * overlap * aShare;
          a.y -= uy * overlap * aShare;
          b.x += ux * overlap * bShare;
          b.y += uy * overlap * bShare;
          this._syncPos(a);
          this._syncPos(b);
        }
      }
    }
    const bounds = this.options.bounds;
    if (bounds) {
      for (const node of nodes) {
        if (node.x < bounds.minX) {
          node.x = bounds.minX;
          if (node.vx < 0)
            node.vx = 0;
        } else if (node.x > bounds.maxX) {
          node.x = bounds.maxX;
          if (node.vx > 0)
            node.vx = 0;
        }
        if (node.y < bounds.minY) {
          node.y = bounds.minY;
          if (node.vy < 0)
            node.vy = 0;
        } else if (node.y > bounds.maxY) {
          node.y = bounds.maxY;
          if (node.vy > 0)
            node.vy = 0;
        }
        this._syncPos(node);
      }
    }
  }
}
var DEFAULTS2 = {
  centerNode: null,
  ringSpacing: 150,
  startAngle: 0,
  center: null,
  ringOf: null
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
    const neighborsOf = new Map;
    const addNeighbor = (a, b, link) => {
      if (!a || !b)
        return;
      if (!neighborsOf.has(a.id))
        neighborsOf.set(a.id, []);
      const arr = neighborsOf.get(a.id);
      if (!arr.some((e) => e.node === b))
        arr.push({ node: b, link });
    };
    for (const l of this.graph.linkList || []) {
      addNeighbor(l.source, l.target, l);
      addNeighbor(l.target, l.source, l);
    }
    for (const n of this.graph.getNodes()) {
      const kids = typeof n.getAdjacents === "function" ? n.getAdjacents() : [];
      for (const c of kids) {
        addNeighbor(n, c, null);
        addNeighbor(c, n, null);
      }
    }
    start.x = this.center.x;
    start.y = this.center.y;
    start.depth = 0;
    start.angle = 0;
    this._syncPos(start);
    visited.add(start.id);
    const ringOf = this.options.ringOf;
    const place = (node, depth, angleStart, angleEnd) => {
      const entries = (neighborsOf.get(node.id) || []).filter((e) => !visited.has(e.node.id));
      const count = entries.length;
      if (count === 0)
        return;
      const slice = (angleEnd - angleStart) / count;
      entries.forEach((entry, i) => {
        const child = entry.node;
        visited.add(child.id);
        const childStart = angleStart + slice * i;
        const childEnd = childStart + slice;
        const angle = (childStart + childEnd) / 2;
        let ring = depth;
        if (typeof ringOf === "function") {
          const r = ringOf(child, { depth, parent: node, link: entry.link });
          if (typeof r === "number" && isFinite(r) && r > 0)
            ring = r;
        }
        const radius = ring * ringSpacing;
        child.x = this.center.x + radius * Math.cos(angle);
        child.y = this.center.y + radius * Math.sin(angle);
        child.depth = depth;
        child.ring = ring;
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
    this.options = Object.assign({}, DEFAULTS3, options);
    options || (options = {});
    for (let i in DEFAULTS3) {
      this[i] = i in options ? options[i] : DEFAULTS3[i];
    }
    if (this.levelSeparation < this.nodeHeight * 1.5)
      this.levelSeparation = this.nodeHeight * 1.2;
    if (this.siblingSpacing < this.nodeWidth * 0.5)
      this.siblingSpacing = this.nodeWidth * 0.5;
    if (this.subtreeSeparation < this.nodeWidth * 0.3)
      this.subtreeSeparation = this.nodeWidth * 0.3;
    const distance = () => this.nodeWidth + Math.max(this.siblingSpacing, this.subtreeSeparation);
    const nextLeft = (v) => v.children && v.children.length ? v.children[0] : v._thread;
    const nextRight = (v) => v.children && v.children.length ? v.children[v.children.length - 1] : v._thread;
    const indexOf = (v) => v.parent ? v.parent.children.indexOf(v) : 0;
    const ancestorOf = (vil, v, defaultAncestor) => {
      const a = vil._ancestor;
      return a && v.parent && a.parent === v.parent ? a : defaultAncestor;
    };
    const moveSubtree = (wm, wp, shift) => {
      const subtrees = indexOf(wp) - indexOf(wm);
      if (subtrees === 0)
        return;
      wp._change -= shift / subtrees;
      wp._shift += shift;
      wm._change += shift / subtrees;
      wp._prelim += shift;
      wp._mod += shift;
    };
    const executeShifts = (v) => {
      let shift = 0, change = 0;
      const children = v.children || [];
      for (let i = children.length - 1;i >= 0; i--) {
        const w = children[i];
        w._prelim += shift;
        w._mod += shift;
        change += w._change;
        shift += w._shift + change;
      }
    };
    const apportion = (v, defaultAncestor) => {
      const w = v.getLeftSibling();
      if (!w)
        return defaultAncestor;
      let vir = v, vor = v, vil = w, vol = v.parent.children[0];
      let sir = vir._mod, sor = vor._mod, sil = vil._mod, sol = vol._mod;
      while (nextRight(vil) && nextLeft(vir)) {
        vil = nextRight(vil);
        vir = nextLeft(vir);
        vol = nextLeft(vol);
        vor = nextRight(vor);
        vor._ancestor = v;
        const shift = vil._prelim + sil - (vir._prelim + sir) + distance();
        if (shift > 0) {
          moveSubtree(ancestorOf(vil, v, defaultAncestor), v, shift);
          sir += shift;
          sor += shift;
        }
        sil += vil._mod;
        sir += vir._mod;
        sol += vol._mod;
        sor += vor._mod;
      }
      if (nextRight(vil) && !nextRight(vor)) {
        vor._thread = nextRight(vil);
        vor._mod += sil - sor;
      }
      if (nextLeft(vir) && !nextLeft(vol)) {
        vol._thread = nextLeft(vir);
        vol._mod += sir - sol;
        defaultAncestor = v;
      }
      return defaultAncestor;
    };
    const firstWalk = (v, depth) => {
      v._prelim = 0;
      v._mod = 0;
      v._shift = 0;
      v._change = 0;
      v._ancestor = v;
      v._thread = null;
      const children = depth >= this.maximumDepth ? [] : v.children || [];
      if (children.length === 0) {
        const w = v.getLeftSibling();
        v._prelim = w ? w._prelim + distance() : 0;
      } else {
        let defaultAncestor = children[0];
        for (const child of children) {
          firstWalk(child, depth + 1);
          defaultAncestor = apportion(child, defaultAncestor);
        }
        executeShifts(v);
        const midpoint = (children[0]._prelim + children[children.length - 1]._prelim) / 2;
        const w = v.getLeftSibling();
        if (w) {
          v._prelim = w._prelim + distance();
          v._mod = v._prelim - midpoint;
        } else {
          v._prelim = midpoint;
        }
      }
    };
    const secondWalk = (v, m, depth, bounds) => {
      if (depth > this.maximumDepth)
        return;
      v.x = this.marginLeft + v._prelim + m;
      v.y = this.marginTop + depth * this.levelSeparation;
      if (this.stackedLeaves && v.isLeaf() && v.parent) {
        v.x = v.parent.x + this.stackedIndentation;
        v.y += v.getIndex() * this.levelSeparation;
      }
      bounds.minX = Math.min(bounds.minX, v.x);
      bounds.maxX = Math.max(bounds.maxX, v.x);
      bounds.minY = Math.min(bounds.minY, v.y);
      bounds.maxY = Math.max(bounds.maxY, v.y);
      for (const child of v.children || [])
        secondWalk(child, m + v._mod, depth + 1, bounds);
    };
    this.calculate_Positions = (root, center) => {
      if (!root)
        return;
      const bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
      firstWalk(root, 0);
      secondWalk(root, 0, 0, bounds);
      this._bounds = bounds;
      return this;
    };
    this.getTreeDimension = () => {
      const b = this._bounds;
      if (!b || b.minX === Infinity)
        return { width: 0, height: 0 };
      return {
        width: b.maxX - b.minX + this.nodeWidth,
        height: b.maxY - b.minY + (this.nodeHeight || this.levelSeparation)
      };
    };
  }
}
var NS = "http://www.w3.org/2000/svg";

class GraphChart {
  constructor(container, options = {}) {
    this.container = container;
    this.doc = options.document || (typeof document !== "undefined" ? document : null);
    this.width = options.width || 800;
    this.height = options.height || 600;
    this.nodeRadius = options.nodeRadius ?? 14;
    this.linkColor = options.linkColor || "#b6c2cf";
    this.labelColor = options.labelColor || "#1f2328";
    this.nodeFill = options.nodeFill || "#1f6feb";
    this.nodeRenderer = options.nodeRenderer || null;
    this.nodeTemplate = options.nodeTemplate || null;
    this.linkRenderer = options.linkRenderer || null;
    this.linkLabelRenderer = options.linkLabelRenderer || null;
    this.arrows = options.arrows || false;
    this.curveParallel = options.curveParallel !== false;
    this.curveStep = options.curveStep ?? 22;
    this.endGap = options.endGap ?? this.nodeRadius + 7;
    this.graph = null;
    this.layout = null;
    this._nodeEls = new Map;
    this._linkEls = [];
    this._onTick = () => this._position();
    if (this.doc && container)
      this._mount();
  }
  _el(tag) {
    return this.doc.createElementNS(NS, tag);
  }
  _mount() {
    this.svg = this._el("svg");
    this.setSize(this.width, this.height);
    this._defs();
    this.linkLayer = this._el("g");
    this.linkLayer.setAttribute("class", "gjs-links");
    this.linkLabelLayer = this._el("g");
    this.linkLabelLayer.setAttribute("class", "gjs-link-labels");
    this.nodeLayer = this._el("g");
    this.nodeLayer.setAttribute("class", "gjs-nodes");
    this.svg.appendChild(this.linkLayer);
    this.svg.appendChild(this.linkLabelLayer);
    this.svg.appendChild(this.nodeLayer);
    this.container.appendChild(this.svg);
  }
  _defs() {
    const defs = this._el("defs");
    const marker = this._el("marker");
    marker.setAttribute("id", "gjs-arrow");
    marker.setAttribute("viewBox", "0 0 10 10");
    marker.setAttribute("refX", "9");
    marker.setAttribute("refY", "5");
    marker.setAttribute("markerWidth", "7");
    marker.setAttribute("markerHeight", "7");
    marker.setAttribute("orient", "auto-start-reverse");
    const p = this._el("path");
    p.setAttribute("d", "M0,0 L10,5 L0,10 z");
    p.setAttribute("fill", "context-stroke");
    marker.appendChild(p);
    defs.appendChild(marker);
    this.svg.appendChild(defs);
  }
  setSize(width, height) {
    this.width = width;
    this.height = height;
    if (this.svg) {
      this.svg.setAttribute("width", width);
      this.svg.setAttribute("height", height);
      this.svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    }
    return this;
  }
  setNodeRenderer(fn) {
    this.nodeRenderer = fn;
    if (this.graph) {
      this._build();
      this._position();
    }
    return this;
  }
  setNodeTemplate(fn) {
    this.nodeTemplate = fn;
    if (this.graph) {
      this._build();
      this._position();
    }
    return this;
  }
  setLinkRenderer(fn) {
    this.linkRenderer = fn;
    if (this.graph) {
      this._build();
      this._position();
    }
    return this;
  }
  setLinkLabelRenderer(fn) {
    this.linkLabelRenderer = fn;
    if (this.graph) {
      this._build();
      this._position();
    }
    return this;
  }
  render(graph, layout) {
    if (this.layout && this.layout.off) {
      this.layout.off("tick", this._onTick);
      this.layout.off("end", this._onTick);
    }
    this.graph = graph;
    this.layout = layout || null;
    this._build();
    if (this.layout && typeof this.layout.on === "function") {
      this.layout.on("tick", this._onTick);
      this.layout.on("end", this._onTick);
    }
    this._position();
    return this;
  }
  _build() {
    if (!this.doc || !this.graph)
      return;
    this.linkLayer.textContent = "";
    this.linkLabelLayer.textContent = "";
    this._linkEls = [];
    const links = this.graph.linkList || [];
    const pairKey = (l) => l.source.id < l.target.id ? l.source.id + "\x00" + l.target.id : l.target.id + "\x00" + l.source.id;
    const totals = new Map;
    for (const l of links)
      totals.set(pairKey(l), (totals.get(pairKey(l)) || 0) + 1);
    const seen = new Map;
    for (const link of links) {
      const el = this._el("path");
      el.setAttribute("fill", "none");
      el.setAttribute("stroke", link.color || this.linkColor);
      el.setAttribute("stroke-width", link.width || 1.5);
      if (link.dashArray)
        el.setAttribute("stroke-dasharray", link.dashArray);
      const key = pairKey(link);
      const idx = seen.get(key) || 0;
      seen.set(key, idx + 1);
      const n = totals.get(key);
      const curve = this.curveParallel && n > 1 ? this.curveStep * (idx - (n - 1) / 2) : 0;
      const arrow = !!(this.arrows || link.arrow);
      if (arrow)
        el.setAttribute("marker-end", "url(#gjs-arrow)");
      if (this.linkRenderer)
        this.linkRenderer(link, el);
      this.linkLayer.appendChild(el);
      let label = null;
      if (this.linkLabelRenderer) {
        const txt = this.linkLabelRenderer(link);
        if (txt != null && txt !== "")
          label = this._makeLinkLabel(String(txt));
      }
      this._linkEls.push({ link, el, curve, arrow, label });
    }
    this.nodeLayer.textContent = "";
    this._nodeEls = new Map;
    for (const node of this.graph.getNodes()) {
      const g = this._el("g");
      g.setAttribute("class", "gjs-node");
      g.setAttribute("data-id", node.id);
      if (this.nodeRenderer) {
        const out = this.nodeRenderer(node, g);
        if (typeof out === "string")
          g.innerHTML = out;
      } else if (this.nodeTemplate) {
        this._buildTemplateNode(node, g, this.nodeTemplate(node) || {});
      } else {
        this._defaultNode(node, g);
      }
      this.nodeLayer.appendChild(g);
      this._nodeEls.set(node.id, g);
    }
  }
  _buildTemplateNode(node, g, spec) {
    if (spec.cssClass)
      g.setAttribute("class", "gjs-node " + spec.cssClass);
    const wantShape = spec.shape != null || spec.shape === undefined && spec.html == null;
    if (wantShape) {
      const shape = this._shapeElement(spec);
      if (shape)
        g.appendChild(shape);
    }
    if (spec.html != null) {
      const w = spec.htmlWidth ?? spec.width ?? 120;
      const h = spec.htmlHeight ?? spec.height ?? 40;
      const fo = this._el("foreignObject");
      fo.setAttribute("x", -w / 2);
      fo.setAttribute("y", -h / 2);
      fo.setAttribute("width", w);
      fo.setAttribute("height", h);
      const div = this.doc.createElementNS("http://www.w3.org/1999/xhtml", "div");
      div.setAttribute("class", "gjs-card");
      div.innerHTML = spec.html;
      fo.appendChild(div);
      g.appendChild(fo);
    } else {
      const label = spec.label != null ? spec.label : node.data && node.data.name || node.id;
      if (label !== false && label !== "") {
        const t = this._el("text");
        t.setAttribute("text-anchor", "middle");
        const half = spec.shape === "circle" || spec.shape === undefined ? spec.radius ?? this.nodeRadius : (spec.height ?? this.nodeRadius * 2) / 2;
        t.setAttribute("dy", spec.labelDy ?? half + 14);
        t.setAttribute("font-size", "11");
        t.setAttribute("fill", spec.labelColor ?? this.labelColor);
        t.textContent = String(label);
        g.appendChild(t);
      }
    }
  }
  _shapeElement(spec) {
    const fill = spec.fill ?? this.nodeFill;
    const stroke = spec.stroke ?? "#ffffff";
    const strokeWidth = spec.strokeWidth ?? 2;
    const w = spec.width ?? (spec.radius ? spec.radius * 2 : this.nodeRadius * 2);
    const h = spec.height ?? w;
    let el;
    switch (spec.shape) {
      case "rect":
        el = this._el("rect");
        el.setAttribute("x", -w / 2);
        el.setAttribute("y", -h / 2);
        el.setAttribute("width", w);
        el.setAttribute("height", h);
        if (spec.cornerRadius)
          el.setAttribute("rx", spec.cornerRadius);
        break;
      case "hexagon":
        el = this._el("polygon");
        el.setAttribute("points", `${-w / 4},${-h / 2} ${w / 4},${-h / 2} ${w / 2},0 ${w / 4},${h / 2} ${-w / 4},${h / 2} ${-w / 2},0`);
        break;
      case "diamond":
        el = this._el("polygon");
        el.setAttribute("points", `0,${-h / 2} ${w / 2},0 0,${h / 2} ${-w / 2},0`);
        break;
      case "circle":
      default:
        el = this._el("circle");
        el.setAttribute("r", spec.radius ?? w / 2);
        break;
    }
    el.setAttribute("fill", fill);
    el.setAttribute("stroke", stroke);
    el.setAttribute("stroke-width", strokeWidth);
    return el;
  }
  _defaultNode(node, g) {
    const c = this._el("circle");
    c.setAttribute("r", this.nodeRadius);
    c.setAttribute("fill", node.data && node.data.color || this.nodeFill);
    c.setAttribute("stroke", "#ffffff");
    c.setAttribute("stroke-width", "2");
    g.appendChild(c);
    const t = this._el("text");
    t.setAttribute("text-anchor", "middle");
    t.setAttribute("dy", this.nodeRadius + 14);
    t.setAttribute("font-size", "11");
    t.setAttribute("fill", this.labelColor);
    t.textContent = node.data && node.data.name || String(node.id);
    g.appendChild(t);
  }
  _makeLinkLabel(text) {
    const g = this._el("g");
    g.setAttribute("class", "gjs-link-label");
    const w = text.length * 6.2 + 10;
    const rect = this._el("rect");
    rect.setAttribute("x", -w / 2);
    rect.setAttribute("y", -8);
    rect.setAttribute("width", w);
    rect.setAttribute("height", 16);
    rect.setAttribute("rx", 8);
    rect.setAttribute("fill", "#ffffff");
    rect.setAttribute("stroke", "#d0d7de");
    const t = this._el("text");
    t.setAttribute("text-anchor", "middle");
    t.setAttribute("dy", "3.5");
    t.setAttribute("font-size", "10");
    t.setAttribute("fill", this.labelColor);
    t.textContent = text;
    g.appendChild(rect);
    g.appendChild(t);
    this.linkLabelLayer.appendChild(g);
    return g;
  }
  _position() {
    if (!this.doc || !this.graph)
      return;
    for (const item of this._linkEls) {
      const { link, el, curve, arrow, label } = item;
      let x1 = link.source.x, y1 = link.source.y, x2 = link.target.x, y2 = link.target.y;
      const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
      if (arrow) {
        const gap = Math.min(this.endGap, len * 0.5);
        x2 -= dx / len * gap;
        y2 -= dy / len * gap;
      }
      let d, lx, ly;
      if (curve) {
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        const nx = -(y2 - y1) / len, ny = (x2 - x1) / len;
        const cx = mx + nx * curve, cy = my + ny * curve;
        d = `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
        lx = 0.25 * x1 + 0.5 * cx + 0.25 * x2;
        ly = 0.25 * y1 + 0.5 * cy + 0.25 * y2;
      } else {
        d = `M ${x1} ${y1} L ${x2} ${y2}`;
        lx = (x1 + x2) / 2;
        ly = (y1 + y2) / 2;
      }
      el.setAttribute("d", d);
      if (label)
        label.setAttribute("transform", `translate(${lx}, ${ly})`);
    }
    for (const node of this.graph.getNodes()) {
      const g = this._nodeEls.get(node.id);
      if (g)
        g.setAttribute("transform", `translate(${node.x}, ${node.y})`);
    }
  }
  nodeElement(id) {
    return this._nodeEls.get(id);
  }
  destroy() {
    if (this.layout && this.layout.off) {
      this.layout.off("tick", this._onTick);
      this.layout.off("end", this._onTick);
    }
    if (this.svg && this.svg.parentNode)
      this.svg.parentNode.removeChild(this.svg);
    this._nodeEls.clear();
    this._linkEls = [];
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
          const midpoint = nodeStartY + distanceBetweenNodes / 2;
          let nodeMiddle = node.width / 2;
          SVGUtil.createLine(this.svg.svgGroup, leftMostChild.x + nodeMiddle, midpoint, rightMostChild.x + nodeMiddle, midpoint);
          const leftMostChildSouth = leftMostChild.getTopMiddlePoint();
          SVGUtil.createLine(this.svg.svgGroup, leftMostChildSouth.x, midpoint, leftMostChildSouth.x, leftMostChildSouth.y);
          const rightMostChildSouth = rightMostChild.getTopMiddlePoint();
          SVGUtil.createLine(this.svg.svgGroup, rightMostChildSouth.x, midpoint, rightMostChildSouth.x, leftMostChildSouth.y);
          const nodeBottomMiddle = node.getBottomMiddlePoint();
          SVGUtil.createLine(this.svg.svgGroup, nodeBottomMiddle.x, nodeBottomMiddle.y, nodeBottomMiddle.x, midpoint);
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
// src/Graph.js
class Node2 {
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

class Link2 {
  constructor(source, target) {
    this.id = source.id + "-" + target.id;
    this.source = source;
    this.target = target;
  }
}

class Graph2 {
  constructor() {
    this.graph = {};
    this.nodeList = [];
    this.linkList = [];
    this.adjacency = {};
    this.changed = false;
    this.root = null;
  }
  addObject(object) {
    const node = new Node2(object.id, object);
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
    const link = new Link2(sourceNode, targetNode);
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
    return this.nodeList.map(printNode2);
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
function printNode2(node) {
  let adjacentsRepresentation = "";
  if (node.getAdjacents().length === 0) {
    adjacentsRepresentation = "no children";
  } else {
    adjacentsRepresentation = node.getAdjacents().map((item) => item.id).join(", ");
  }
  return node.id + " => " + adjacentsRepresentation;
}
// src/Constants.js
var NONE = "none";
var pi = Math.PI;
// src/trigo.js
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
// src/data-adapter.js
var POLE_TAXONOMY = {
  People: ["person"],
  Objects: ["vehicle", "weapon", "phone", "account", "organization"],
  Locations: ["location", "premises"],
  Events: ["rap_sheet", "seizure", "case"]
};
var POLE_NODE_TYPES = Object.values(POLE_TAXONOMY).flat();
var POLE_EDGE_TYPES = ["family", "associate", "address", "arrest", "other"];
function fullName(node) {
  const parts = [node.first_name, node.last_name].filter(Boolean);
  return parts.length ? parts.join(" ") : undefined;
}
function validatePOLEData(input) {
  const errors = [];
  if (!input || typeof input !== "object") {
    return { valid: false, errors: ["Input must be an object with `nodes` and `edges`/`links`."] };
  }
  const nodes = input.nodes;
  const edges = input.edges ?? input.links;
  if (!Array.isArray(nodes))
    errors.push("`nodes` must be an array.");
  if (edges !== undefined && !Array.isArray(edges))
    errors.push("`edges`/`links` must be an array.");
  const ids = new Set;
  (Array.isArray(nodes) ? nodes : []).forEach((node, i) => {
    if (node == null || typeof node !== "object") {
      errors.push(`Node at index ${i} must be an object.`);
      return;
    }
    if (node.id === undefined || node.id === null || node.id === "") {
      errors.push(`Node at index ${i} is missing an id.`);
    } else if (ids.has(node.id)) {
      errors.push(`Duplicate node id: "${node.id}".`);
    } else {
      ids.add(node.id);
    }
    if (node.type != null && !POLE_NODE_TYPES.includes(node.type)) {
      errors.push(`Node "${node.id ?? i}" has invalid type "${node.type}". Expected one of: ${POLE_NODE_TYPES.join(", ")}.`);
    }
  });
  (Array.isArray(edges) ? edges : []).forEach((edge, i) => {
    if (edge == null || typeof edge !== "object") {
      errors.push(`Edge at index ${i} must be an object.`);
      return;
    }
    if (edge.source === undefined || edge.source === null) {
      errors.push(`Edge at index ${i} is missing a source.`);
    } else if (!ids.has(edge.source)) {
      errors.push(`Edge at index ${i} references unknown source "${edge.source}".`);
    }
    if (edge.target === undefined || edge.target === null) {
      errors.push(`Edge at index ${i} is missing a target.`);
    } else if (!ids.has(edge.target)) {
      errors.push(`Edge at index ${i} references unknown target "${edge.target}".`);
    }
    if (edge.type != null && !POLE_EDGE_TYPES.includes(edge.type)) {
      errors.push(`Edge at index ${i} has invalid type "${edge.type}". Expected one of: ${POLE_EDGE_TYPES.join(", ")}.`);
    }
  });
  return { valid: errors.length === 0, errors };
}
function transformServiceNowData(input, options = {}) {
  const { validate = true } = options;
  if (validate) {
    const result = validatePOLEData(input);
    if (!result.valid) {
      throw new Error(`Invalid POLE data:
 - ` + result.errors.join(`
 - `));
    }
  }
  const rawNodes = input && input.nodes || [];
  const rawEdges = input && (input.edges ?? input.links) || [];
  const nodes = rawNodes.map((node) => ({
    id: node.id,
    type: node.type || "other",
    is_subject: !!node.is_subject,
    name: node.name || fullName(node) || String(node.id),
    first_name: node.first_name,
    last_name: node.last_name,
    photo: node.photo,
    relationship: node.relationship,
    table: node.table
  }));
  const links = rawEdges.map((edge) => ({
    source: edge.source,
    target: edge.target,
    label: edge.label ?? "",
    type: edge.type || "other"
  }));
  return { nodes, links };
}
// src/pole-presets.js
var POLE_EDGE_STYLES = {
  family: { color: "#58a6ff", width: 2.5, dashArray: null },
  associate: { color: "#3fb950", width: 2, dashArray: null },
  address: { color: "#d29922", width: 1.5, dashArray: null },
  arrest: { color: "#f85149", width: 2, dashArray: "5,3" },
  other: { color: "#8b949e", width: 1.5, dashArray: null }
};
var POLE_NODE_STYLES = {
  person: { shape: "rect", fill: "#1f6feb", stroke: "#58a6ff" },
  vehicle: { shape: "rect", fill: "#8957e5", stroke: "#a371f7" },
  weapon: { shape: "diamond", fill: "#b23150", stroke: "#ff6b8a" },
  phone: { shape: "rect", fill: "#1f7a99", stroke: "#40c4ff" },
  account: { shape: "circle", fill: "#a83e83", stroke: "#ff6ec7" },
  organization: { shape: "rect", fill: "#7a4fc0", stroke: "#c792ea" },
  location: { shape: "hexagon", fill: "#238636", stroke: "#3fb950" },
  premises: { shape: "hexagon", fill: "#1f7a5a", stroke: "#57d99b" },
  rap_sheet: { shape: "circle", fill: "#9e6a03", stroke: "#d29922" },
  seizure: { shape: "diamond", fill: "#a8500f", stroke: "#ff7a45" },
  case: { shape: "circle", fill: "#6e7681", stroke: "#c9d1d9" },
  other: { shape: "circle", fill: "#30363d", stroke: "#8b949e" }
};
var POLE_SUBJECT_STYLE = { sizeMultiplier: 1.3, glow: true, stroke: "#f78166" };
var POLE_NODE_LABELS = {
  person: "Person",
  vehicle: "Vehicle",
  weapon: "Weapon",
  phone: "Phone",
  account: "Account",
  organization: "Organization",
  location: "Location",
  premises: "Premises",
  rap_sheet: "Rap Sheet",
  seizure: "Seizure",
  case: "Case",
  other: "Other"
};
var POLE_EDGE_LABELS = {
  family: "Family",
  associate: "Associate",
  address: "Address",
  arrest: "Arrest",
  other: "Other"
};
var POLE_REL_QUALIFIERS = {
  family: ["spouse", "sibling", "parent", "child"],
  associate: ["known-associate", "co-defendant", "co-conspirator", "handler", "contact", "counsel", "informant"],
  address: ["residence", "frequents", "operates", "sighted", "stored"],
  arrest: ["arrested", "co-defendant", "booking", "seizure", "charge"],
  other: ["registered-owner", "uses", "director", "controls", "funds", "named-in"]
};
var POLE_NODE_ICONS = {
  person: `<circle cx="12" cy="8.4" r="4"/><path d="M4.6 20.4c0-4.2 3.3-6.8 7.4-6.8s7.4 2.6 7.4 6.8z"/>`,
  location: `<path d="M12 3 2.8 11.2H5.6V20.4h4.4V15.2h3.9v5.2h4.4V11.2h2.8z"/>`,
  vehicle: `<path d="M2.8 14.4v-1l1.6-4.3A2.4 2.4 0 0 1 6.7 7.5h1.5l1.4-2A2.2 2.2 0 0 1 11.4 4.6h1.9a2.2 2.2 0 0 1 1.8.9l1.5 2h1.5a2.4 2.4 0 0 1 2.3 1.6l1.5 4.3v1a.9.9 0 0 1-.9.9h-1.2a2.5 2.5 0 0 1-5 0H10a2.5 2.5 0 0 1-5 0H3.7a.9.9 0 0 1-.9-.9z"/>`,
  rap_sheet: `<g fill-rule="evenodd"><path d="M7.4 8.6a3.7 3.7 0 1 0 0 7.4 3.7 3.7 0 0 0 0-7.4zm0 2.1a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2z"/><path d="M16.6 8.6a3.7 3.7 0 1 0 0 7.4 3.7 3.7 0 0 0 0-7.4zm0 2.1a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2z"/></g><rect x="9.4" y="7.2" width="5.2" height="2.3" rx="1.15"/>`,
  case: `<path fill-rule="evenodd" d="M9.2 6V5.2A2.2 2.2 0 0 1 11.4 3h1.2a2.2 2.2 0 0 1 2.2 2.2V6H18a2.2 2.2 0 0 1 2.2 2.2V17A2.2 2.2 0 0 1 18 19.2H6A2.2 2.2 0 0 1 3.8 17V8.2A2.2 2.2 0 0 1 6 6zm1.9 0h3.8V5.2a.4.4 0 0 0-.4-.4h-3a.4.4 0 0 0-.4.4z"/>`,
  weapon: `<path d="M3 8h13.6V6.5h4.4a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-2v2h-3v-2h-3.3l-1 4.4a2.4 2.4 0 1 1-4.7-1.1L6.5 12H4a1 1 0 0 1-1-1z"/>`,
  phone: `<path fill-rule="evenodd" d="M7.5 2.5h9A1.6 1.6 0 0 1 18.1 4.1v15.8a1.6 1.6 0 0 1-1.6 1.6h-9a1.6 1.6 0 0 1-1.6-1.6V4.1A1.6 1.6 0 0 1 7.5 2.5zm1.7 1.7a.55.55 0 0 0 0 1.1h5.6a.55.55 0 0 0 0-1.1zm2.8 12.9a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5z"/>`,
  account: `<path d="M12 3 2.5 8v1.6h19V8zM4.2 11h2.1v6H4.2zm4.8 0h2.1v6H9zm4.8 0h2.1v6h-2.1zM2.5 18.6h19V21h-19z"/>`,
  organization: `<path fill-rule="evenodd" d="M4 3h9.6v18H4zm11.1 6.5h5V21h-5zM6.5 6h2v2h-2zm3.6 0h2v2h-2zm-3.6 4h2v2h-2zm3.6 0h2v2h-2zm-3.6 4h2v2h-2zm3.6 0h2v2h-2zM16.9 12h1.9v2h-1.9zm0 4h1.9v2h-1.9z"/>`,
  premises: `<path d="M2.5 11 12 6l9.5 5v9.6h-5.6v-5.2h-7.8v5.2H2.5z"/>`,
  seizure: `<path d="M6 3v18h1.9v-6.7l9.7-3.2L14.6 8l3-4z"/>`,
  other: `<circle cx="12" cy="12" r="4.4"/>`
};
function typeOf(entity) {
  return entity?.type ?? entity?.data?.type ?? "other";
}
function isSubject(node) {
  return !!(node?.is_subject ?? node?.data?.is_subject);
}
function poleEdgeStyle(link) {
  const type = typeOf(link);
  return POLE_EDGE_STYLES[type] || POLE_EDGE_STYLES.other;
}
var POLE_REL_RINGS = { family: 1, associate: 2, address: 3, arrest: 4, other: 5 };
function poleRingOf(node, info = {}) {
  const link = info.link;
  const type = link ? link.type ?? link.data?.type : undefined;
  if (type != null && type in POLE_REL_RINGS)
    return POLE_REL_RINGS[type];
  return info.depth;
}
function poleNodeStyle(node) {
  const type = typeOf(node);
  const base = { ...POLE_NODE_STYLES[type] || POLE_NODE_STYLES.other, icon: POLE_NODE_ICONS[type] || POLE_NODE_ICONS.other };
  return isSubject(node) ? { ...base, ...POLE_SUBJECT_STYLE, subject: true } : base;
}
function applyPOLEEdgeStyles(graph) {
  const links = graph.linkList || graph.getLinks && graph.getLinks() || [];
  for (const link of links) {
    const style = poleEdgeStyle(link);
    link.color = style.color;
    link.width = style.width;
    link.dashArray = style.dashArray;
  }
  return graph;
}
function presentTypes(entities, styleMap) {
  const seen = new Set((entities || []).map(typeOf));
  return Object.keys(styleMap).filter((t) => seen.has(t));
}
function poleLegend(options = {}) {
  const { graph } = options;
  let nodeTypes = options.nodeTypes;
  let edgeTypes = options.edgeTypes;
  let hasSubject = false;
  if (graph) {
    const nodes = graph.getNodes ? graph.getNodes() : [];
    const links = graph.linkList || graph.getLinks && graph.getLinks() || [];
    nodeTypes = nodeTypes || presentTypes(nodes, POLE_NODE_STYLES);
    edgeTypes = edgeTypes || presentTypes(links, POLE_EDGE_STYLES);
    hasSubject = nodes.some(isSubject);
  }
  nodeTypes = nodeTypes || Object.keys(POLE_NODE_STYLES);
  edgeTypes = edgeTypes || Object.keys(POLE_EDGE_STYLES);
  return {
    nodes: nodeTypes.map((type) => {
      const style = POLE_NODE_STYLES[type] || POLE_NODE_STYLES.other;
      return { type, label: POLE_NODE_LABELS[type] || type, color: style.fill, shape: style.shape };
    }),
    edges: edgeTypes.map((type) => {
      const style = POLE_EDGE_STYLES[type] || POLE_EDGE_STYLES.other;
      return { type, label: POLE_EDGE_LABELS[type] || type, color: style.color, dashArray: style.dashArray };
    }),
    subject: hasSubject ? { label: "Subject", stroke: POLE_SUBJECT_STYLE.stroke } : null
  };
}

// src/index.js
var version = "1.0.0";
export {
  version,
  validatePOLEData,
  transformServiceNowData,
  to_radians,
  to_degrees,
  rotate,
  poleRingOf,
  poleNodeStyle,
  poleLegend,
  poleEdgeStyle,
  pointInCircle,
  pi,
  midpoint,
  getPointOnArc,
  findAngle,
  distanceXY,
  convertMousePositionToCoordinateGraph,
  applyPOLEEdgeStyles,
  TreeLayout,
  RadialLayout,
  POLE_TAXONOMY,
  POLE_SUBJECT_STYLE,
  POLE_REL_RINGS,
  POLE_REL_QUALIFIERS,
  POLE_NODE_TYPES,
  POLE_NODE_STYLES,
  POLE_NODE_LABELS,
  POLE_NODE_ICONS,
  POLE_EDGE_TYPES,
  POLE_EDGE_STYLES,
  POLE_EDGE_LABELS,
  Node2 as Node,
  NONE,
  Link2 as Link,
  GraphChart,
  Graph2 as Graph,
  ForceDirected,
  Graph as EngineGraph
};
