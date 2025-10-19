# Optimizers

A collection of minimal, dependency-free, performance-focused utilities for improving and compressing code or data in modern web and edge environments.

## Overview

**Optimizers** provides safe, auditable modules designed to make code smaller and faster without unsafe parsing or heavy dependencies.
Each tool focuses on a single responsibility and runs without build steps or runtime polyfills.

Available modules:

- **is-html-minify** — Safe HTML minifier that removes comments and collapses whitespace while preserving `<pre>`, `<textarea>`, `<script>`, and `<style>` content.  
  [![html gzip](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/yvancg/optimizers/main/metrics/html-minify.js.json)](./metrics/html.js.json)
  [![html ops/s](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/yvancg/optimizers/main/bench/html-minify.json)](./bench/html.json)

- **is-minify** — Safe, dependency-free JavaScript and CSS minifier for browser and Node.  
  [![minify gzip](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/yvancg/optimizers/main/metrics/minify.js.json)](./metrics/minify.js.json)
  [![minify ops/s](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/yvancg/optimizers/main/bench/minify.json)](./bench/minify.json)
  
- **is-prompt-minify** — Compact large language model (LLM) prompts by removing redundancy, extra whitespace, and repeated phrases without altering meaning.  
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

You can try each validator interactively in your browser:

- [hhtml Minification Test](https://yvancg.github.io/optimizers/is-html-minify/html-test.html)
- [JS/CSS Minification Test](https://yvancg.github.io/optimizers/is-minify/minify-test.html)
- [Prompt Minify Test](https://yvancg.github.io/optimizers/is-prompt-minify/prompt-test.html)
- [Strip ANSI Test](https://yvancg.github.io/optimizers/is-strip-ansi/strip-test.html)

Each page loads its respective module and allows interactive validation.

## Install

```bash
npm i @yvancg/optimizers
```
# or per-module packages when published

## API Guarantees

- No eval or dynamic code.
- No untrusted regular expressions.
- Deterministic output with consistent whitespace and comment removal.

## Design Principles

1.	**Safety first**: Never execute or interpret arbitrary code during optimization.
2.	**No dependencies**: All logic is pure ESM JavaScript.
3.	**Performance**: Runs in O(n) time on typical input.
4.	**Portability**: Works the same in browser, Node, and edge runtimes.
5.	**Transparency**: Fully open-source, easy to audit.

## Example Usage

```js
import { minifyHTML }   from './is-html-minify/html.js';
import { minifyJS, minifyCSS } from './is-minify/minify.js';
import { promptMinify } from './is-prompt-minify/prompt.js';
import { stripAnsi } from './is-strip-ansi/strip.js';

console.log(minifyHTML(`
  <!-- comment -->
  <div class="box">
    <p> Hello   world </p>
    <pre> keep   this   </pre>
    <script> const x =  1 + 2 </script>
  </div>
`));
// → '<div class="box"><p>Hello world</p><pre> keep   this   </pre><script> const x =  1 + 2 </script></div>'

console.log(minifyJS('function x () { return 1 + 2 ; }'));
// → 'function x(){return 1+2;}'

console.log(minifyCSS('body { color : red ; }'));
// → 'body{color:red;}'

console.log(promptMinify('You are a helpful helpful AI assistant. Please please respond clearly clearly.'));
// → 'You are a helpful AI assistant. Please respond clearly.'

console.log(stripAnsi('\u001B[31mError:\u001B[0m invalid token'));
// → 'Error: invalid token'
```

## Folder Structure

```
validators/
  ├─ .github/
  │   └─ FUNDING.yml
  ├─ LICENSE
  ├─ README.md
  ├─ SECURITY.md
  ├─ is-html-minify/
  ├─ is-minify/
  ├─ is-prompt-minify/
  ├─ is-strip-ansi/
  ├─ bench/
  └─ metrics/
```

## Security Notes

- No dynamic code execution or new `Function()` calls.
- All regexes are tested for ReDoS safety.
- Produces deterministic minified output safe for sandboxed environments.

## Contributing

Pull requests for additional safe validators (e.g., IBAN, domain names, etc.) are welcome. Please maintain the following rules:

- Pure functions only (no side effects)
- No external dependencies
- 100% test coverage for new logic
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
