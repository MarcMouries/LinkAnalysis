# LinkAnalysis examples

Interactive, browser-based demos (open the `.html` files via a local static
server). These are **manual demos**, not automated tests — the `bun test` suite
lives in [`../test/`](../test/).

Several demos predate the ES-module migration and are being rewired. Current status:

| Demo | Exercises | Status |
|------|-----------|--------|
| `test_PieMenu.html` | `PieMenu` (radial context menu) | ✅ works (self-contained) |
| `test_trackmousetouch.html` | mouse / touch tracking | ✅ works (inline) |
| `ascii-tree-to-json.html` | ASCII-tree → JSON tool | ✅ works (inline) |
| `test_MCanvas.html` | `MCanvas` canvas primitives | ⚠️ needs rewiring — `trigo.js` is now an ES module, not a global `<script>` |
| `test_Icons.html` | POLE entity icons | ⚠️ needs rewiring — depends on the now-ESM `trigo.js` |
| `test_Graph.html` | `Graph` traversal + tree | ⚠️ broken — loads the now-ESM `Graph.js` as a global and the removed `TreeLayout.js` |
| `test_LinkAnalysis.html` | full canvas component | ⚠️ broken — loads ESM `Graph.js` and the removed `MRadialLayout.js` / `TreeLayout.js` |

**Migration notes**

- Layout algorithms (`TreeLayout`, `RadialLayout`, `ForceDirected`) now live in the
  [GraphJS](https://github.com/MarcMouries/GraphJS) engine. The old tree-layout demo
  (`test_Tree_Layout.html`) moved to `GraphJS/examples/tree-layout.html`.
- The core (`Graph`, `trigo`) is now ES modules, so demos must load them with
  `<script type="module">` + `import`, or use the built `dist/umd/link-analysis.min.js`
  bundle and its `window.LinkAnalysis` global.
- `MCanvas.js`, `LinkAnalysis.js`, `PieMenu.js`, `links_icons.js` and `image_utils.js`
  are still global-style and will be converted to ES modules as they are rewired onto
  the GraphJS engine.

Supporting files: `data-json-*.js` (sample datasets), `walker_tree_data.js`,
`postorder.js` (a traversal scratch script) and `style.css`.
