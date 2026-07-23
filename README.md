# LinkAnalysis

![Screenshot](docs/LinkAnalysis.png)

A graph-visualization library for intelligence / link-analysis (POLE entity) networks.

## Status

The core is being modernized into ES modules bundled with [Bun](https://bun.sh).
The data model (`Graph`, `Node`, `Link`) and the geometry helpers (`trigo`) are
now ES modules with a test suite.

**Layout algorithms live in the [GraphJS](https://github.com/MarcMouries/GraphJS)
engine, not here.** LinkAnalysis depends on GraphJS and consumes its
`ForceDirected`, `RadialLayout` and `TreeLayout`:

```javascript
import { RadialLayout, ForceDirected } from "graphjs";
```

LinkAnalysis owns the domain layer: the data model, the POLE data adapter, and
(upcoming) POLE node/edge templates and presets. The legacy canvas renderer and
`PieMenu` are still `<script>`-loaded by the manual harnesses under `test/` and
will be rewired onto the GraphJS engine.

## Development

```bash
bun install        # install dev tooling (nothing external is required to build)
bun run build      # produce dist/esm, dist/cjs and dist/umd bundles
bun test           # run the test suite
bun run dev        # rebuild the ESM bundle on change (watch mode)
```

### Build outputs

| Field     | File                            | Format |
|-----------|---------------------------------|--------|
| `module`  | `dist/esm/index.js`             | ESM (`import`) |
| `main`    | `dist/cjs/index.cjs`            | CommonJS (`require`) |
| `browser` | `dist/umd/link-analysis.min.js` | IIFE — exposes `window.LinkAnalysis` |

Build artifacts under `dist/` are generated on demand (and on `prepublishOnly`);
they are not committed.

## Usage

```javascript
import { Graph } from "link-analysis";
import { RadialLayout } from "graphjs";

const graph = new Graph();
graph.loadJSON({
  nodes: [{ id: "subject" }, { id: "a" }, { id: "b" }],
  links: [
    { source: "subject", target: "a" },
    { source: "subject", target: "b" },
  ],
});

// The layout algorithm comes from the GraphJS engine.
new RadialLayout(graph, { centerNode: "subject", center: { x: 400, y: 300 } }).run();
// each node now has x / y coordinates
```
