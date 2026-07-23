// Browser / <script>-tag entry point.
// Bundled with `--format=iife`; exposes the whole public API as `window.LinkAnalysis`.
// NOTE: bun's `--global-name` flag is a no-op for the iife format in some versions,
// so we assign onto globalThis explicitly here instead of relying on it.
import * as LinkAnalysis from "./index.js";

globalThis.LinkAnalysis = LinkAnalysis;

export default LinkAnalysis;
