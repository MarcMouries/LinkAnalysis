# LinkAnalysis

![Screenshot](docs/LinkAnalysis.png)

A graph-visualization library for intelligence / link-analysis (POLE entity) networks.

## Status

The core is being modernized into ES modules bundled with [Bun](https://bun.sh).
The data model (`Graph`, `Node`, `Link`), the geometry helpers (`trigo`) and the
radial layout (`MRadialLayout`) are now ES modules with a test suite. The canvas
renderer, `PieMenu`, and `TreeLayout` are still being migrated and are loaded via
`<script>` tags by the manual harnesses under `test/`.

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
import { Graph, MRadialLayout } from "link-analysis";

const graph = new Graph();
graph.loadJSON({
  nodes: [{ id: "subject" }, { id: "a" }, { id: "b" }],
  links: [
    { source: "subject", target: "a" },
    { source: "subject", target: "b" },
  ],
});

const layout = new MRadialLayout();
layout.Calculate_Positions(graph, graph.getNode("subject"), { x: 400, y: 300 });
// each node now has x / y coordinates
```
