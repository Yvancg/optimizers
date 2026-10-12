# Optimizers

A collection of minimal, dependency-free, performance-focused utilities for improving and compressing code or data in modern web and edge environments.

## Overview

**Optimizers** provides safe, auditable modules designed to make code smaller and faster with conservative transformations and no runtime dependencies.
Each tool focuses on a single responsibility and runs without build steps or runtime polyfills.

Available modules:

- **is-dataset-minify** — High-performance dataset optimizer for JSON, JSONL, and CSV.  
  [![dataset gzip](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/yvancg/optimizers/main/metrics/dataset.js.json)](./metrics/dataset.js.json)
  [![dataset ops/s](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/yvancg/optimizers/main/bench/dataset.json)](./bench/dataset.json)
  
- **is-google-tag** — Optimizes Google Tag for async, non-blocking, simplified loading for recognized GA4 measurement IDs.  
  [![gtag gzip](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/yvancg/optimizers/main/metrics/gtag.js.json)](./metrics/gtag.js.json)
  [![gtag ops/s](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/yvancg/optimizers/main/bench/gtag.json)](./bench/gtag.json)
  
- **is-html-minify** — Safe HTML minifier that removes comments and collapses whitespace while preserving `<pre>`, `<textarea>`, `<script>`, and `<style>` content.  
  [![html gzip](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/yvancg/optimizers/main/metrics/html.js.json)](./metrics/html.js.json)
  [![html ops/s](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/yvancg/optimizers/main/bench/html-minify.json)](./bench/html.json)

- **is-minify** — Conservative JavaScript and CSS whitespace optimizer. Complex syntax is returned unchanged.  
  [![minify gzip](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/yvancg/optimizers/main/metrics/minify.js.json)](./metrics/minify.js.json)
  [![minify ops/s](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/yvancg/optimizers/main/bench/minify.json)](./bench/minify.json)
  
- **is-prompt-minify** — Compact large language model (LLM) prompts by removing redundancy, extra whitespace, and repeated phrases with semantic phrase deletion disabled by default.  
  [![prompt gzip](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/yvancg/optimizers/main/metrics/prompt.js.json)](./metrics/prompt.js.json)
  [![prompt ops/s](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/yvancg/optimizers/main/bench/prompt.json)](./bench/prompt.json)

- **is-strip-ansi** — Removes ANSI escape sequences (color codes, control characters) from strings safely.  
  [![strip gzip](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/yvancg/optimizers/main/metrics/strip.js.json)](./metrics/strip.js.json)
  [![strip ops/s](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/yvancg/optimizers/main/bench/strip.json)](./bench/strip.json)

All helpers are designed for use in:
- Browsers (ESM)
- Node.js / Deno / Bun
- Edge runtimes (Cloudflare Workers, Vercel Edge, etc.)

Each module has its own `README.md`, tests, and can be imported individually.

## 🔗 Live Demos (GitHub Pages)

You can try each optimizer interactively in your browser:

- [Dataset Optimizer Test](https://yvancg.github.io/optimizers/is-dataset-minify/dataset-test.html)
- [Google Tag Demo](https://yvancg.github.io/optimizers/is-google-tag/gtag-test.html)
- [html Minification Demo](https://yvancg.github.io/optimizers/is-html-minify/html-test.html)
- [JS/CSS Minification Demo](https://yvancg.github.io/optimizers/is-minify/minify-test.html)
- [Prompt Minify Demo](https://yvancg.github.io/optimizers/is-prompt-minify/prompt-test.html)
- [Strip ANSI Demo](https://yvancg.github.io/optimizers/is-strip-ansi/strip-test.html)

Each page loads its corresponding module.

## Use
Import individual ESM files directly. No package installation or build is required.

To run the dependency-free regression tests with Node.js 22+:

~~~bash
node --experimental-default-type=module --test tests/*.test.mjs
~~~

Benchmarks and gzip badges refresh through manually dispatched workflows only; correctness tests still run on pushes and PRs.

## Behavior and limitations
- `minifyJS` and `minifyCSS` are **heuristic**, not full parsers. They return certain complex inputs unchanged instead of risking a rewrite. Do not rely on them for production bundling or sanitization.
- `minifyHTML` preserves sensitive element contents, meaningful inline spacing, and attribute values by default; it is not a complete HTML parser.
- `optimizePrompt()` leaves semantic phrase deletion off by default (`noise: false`). Enable it only when you accept possible meaning changes.
- `optimizeGoogleTag()` processes recognized GA4 `G-...` measurement IDs and returns unrecognized input unchanged.

## Design Principles

1.	**Safety first**: Never execute or interpret arbitrary code during optimization.
2.	**No dependencies**: All logic is pure ESM JavaScript.
3.	**Performance**: Runs in O(n) time on typical input.
4.	**Portability**: Works the same in browser, Node, and edge runtimes.
5.	**Transparency**: Fully open-source, easy to audit.

## Example usage
~~~js
import { optimizeDataset } from './is-dataset-minify/dataset.js';
import { optimizeGoogleTag } from './is-google-tag/gtag.js';
import { minifyHTML } from './is-html-minify/html.js';
import { minifyJS, minifyCSS } from './is-minify/minify.js';
import { optimizePrompt } from './is-prompt-minify/prompt.js';
import { stripAnsi } from './is-strip-ansi/strip.js';

console.log(optimizeDataset('[{"id":1},{"id":1}]', { format: 'json' }));
console.log(optimizeGoogleTag('G-TEST123'));        // GA4 script snippet
console.log(minifyHTML('<p>Hello  world</p>'));
console.log(minifyJS('function x () { return 42; }'));
console.log(minifyCSS('body { color: red; }'));
console.log(optimizePrompt('Please keep this.').optimized); // phrase preserved
console.log(stripAnsi('\u001b[31mError\u001b[0m'));       // 'Error'
~~~

## Folder Structure

```
validators/
  ├─ .github/
  │   ├─ workflows/
  │   └─ FUNDING.yml
  ├─ LICENSE
  ├─ README.md
  ├─ SECURITY.md
  ├─ catalog.json
  ├─ is-dataset-minify/
  ├─ is-google-tag/
  ├─ is-html-minify/
  ├─ is-minify/
  ├─ is-prompt-minify/
  ├─ is-strip-ansi/
  ├─ bench/
  └─ metrics/
```

## Security Notes

- No dynamic code execution or new `Function()` calls.
- No guarantee of semantic equivalence for every possible language construct; regression-test real inputs.
- Do not use minification as a security sanitizer.

## Contributing

Pull requests for small, behavior-preserving optimizers are welcome. Please maintain the following rules:

- Pure functions only (no side effects)
- No external dependencies
- Regression tests for changed behavior
- TypeScript or plain ESM JavaScript

## License

Licensed under the **MIT License** — see [LICENSE](./LICENSE).

## Funding

If you find this project useful, please consider sponsoring its continued maintenance and security audits.

You can sponsor this project through:

- GitHub Sponsors: [https://github.com/sponsors/yvancg](https://github.com/sponsors/yvancg)
- Or any link listed in `.github/FUNDING.yml`

---

© 2025 Y Consulting LLC / Optimizers Project
