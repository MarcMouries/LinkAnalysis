import { test, expect, describe } from "bun:test";
import { Graph, Node, Link } from "../src/Graph.js";

describe("Node", () => {
	test("tracks children and adjacency", () => {
		const root = new Node("root", {});
		const child = new Node("child", {});
		root.addChild(child);
		expect(root.getChildrenCount()).toBe(1);
		expect(root.getFirstChild()).toBe(child);
		expect(root.isAdjacent(child)).toBe(true);
		expect(root.isLeaf()).toBe(false);
		expect(child.isLeaf()).toBe(true);
	});
});

describe("Link", () => {
	test("derives an id from source and target", () => {
		const a = new Node("a", {});
		const b = new Node("b", {});
		const link = new Link(a, b);
		expect(link.id).toBe("a-b");
		expect(link.source).toBe(a);
		expect(link.target).toBe(b);
	});
});

describe("Graph", () => {
	test("addObject / addNode / getNode", () => {
		const g = new Graph();
		g.addObject({ id: "a", name: "A" });
		expect(g.getNode("a").data.name).toBe("A");
		expect(g.getRootNode().id).toBe("a");
		expect(g.getNodes()).toHaveLength(1);
	});

	test("addLink wires children + adjacency and de-duplicates", () => {
		const g = new Graph();
		g.addObject({ id: "a" });
		g.addObject({ id: "b" });
		g.addLink("a", "b");
		g.addLink("a", "b"); // duplicate link id → not added to linkList/children twice
		expect(g.getLinks()).toHaveLength(1);
		expect(g.getNode("a").getAdjacents().map((n) => n.id)).toEqual(["b"]);
		expect(g.adjacency["a"]).toHaveProperty("b");
	});

	test("addLink throws for a missing endpoint", () => {
		const g = new Graph();
		g.addObject({ id: "a" });
		expect(() => g.addLink("a", "ghost")).toThrow(TypeError);
	});

	test("isRoot is true only for non-targets", () => {
		const g = new Graph();
		g.loadJSON({
			nodes: [{ id: "a" }, { id: "b" }],
			links: [{ source: "a", target: "b" }],
		});
		expect(g.isRoot(g.getNode("a"))).toBe(true);
		expect(g.isRoot(g.getNode("b"))).toBe(false);
	});

	test("loadJSON accepts a JSON string", () => {
		const g = new Graph();
		g.loadJSON(
			JSON.stringify({
				nodes: [{ id: "a" }, { id: "b" }, { id: "c" }],
				links: [
					{ source: "a", target: "b" },
					{ source: "a", target: "c" },
				],
			}),
		);
		expect(g.getNodes()).toHaveLength(3);
		expect(g.getLinks()).toHaveLength(2);
	});

	test("pre-order traversal visits root before children", () => {
		const g = new Graph();
		g.loadJSON({
			nodes: [{ id: "a" }, { id: "b" }, { id: "c" }],
			links: [
				{ source: "a", target: "b" },
				{ source: "a", target: "c" },
			],
		});
		// For a link-defined graph the center/root is the isRoot() node ("a"),
		// which a caller passes explicitly (getRootNode only tracks parentId trees).
		const order = [];
		g.visit_Preorder(g.getNode("a"), (n) => order.push(n.id));
		expect(order[0]).toBe("a");
		expect(order.sort()).toEqual(["a", "b", "c"]);
	});
});
