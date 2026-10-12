# is-google-tag

[![gtag gzip](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/yvancg/optimizers/main/metrics/gtag.js.json)](./metrics/gtag.js.json)
[![gtag ops/s](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/yvancg/optimizers/main/bench/gtag.json)](./bench/gtag.json)

**Optimize Google Tag** for async, non-blocking, privacy-safe loading.
Supports GA4 measurement IDs with a `G-` prefix; it does not convert GTM or Google Ads snippets.

---

## 🚀 Why

Default Google Tag snippets often block rendering or run synchronously.
`is-google-tag` cleans, rewrites, and re-emits a safe async version that loads instantly.
- Forces async loading (async or defer)
- Adds anonymize_ip and transport_type options
- Rebuilds a simple GA4 snippet; it is not a sanitizer
- Leaves unrecognized IDs, including GTM-* and AW-*, unchanged

---

## 🌟 Features

- ✅ Converts blocking <script> to async or defer
- ✅ Adds privacy (anonymize_ip: true) automatically
- ✅ Uses non-blocking beacon transport
- ✅ Works in browsers, Node, or edge runtimes
- ✅ Output remains valid HTML 

---

## 📦 Usage

```js
import { optimizeGoogleTag } from './gtag.js';

const raw = `
<script src="https://www.googletagmanager.com/gtag/js?id=G-ABC123"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-ABC123');
</script>`;

console.log(optimizeGoogleTag(raw));
```
**Output:**
```html
<!-- Optimized Google Tag -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ABC123"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', Date.now());
  gtag('config', 'G-ABC123', { transport_type: 'beacon', anonymize_ip: true });
</script>
```

---

## 🧠 API

```ts
optimizeGoogleTag(input: string, opts?: {
  anonymizeIP?: boolean;     // default true
  transport?: 'beacon'|'xhr'|'image'; // default 'beacon'
  async?: boolean;           // true = async, false = defer
  idFallback?: string;       // default 'G-XXXXXX'
}): string
```

---

Unrecognized input is returned unchanged rather than inventing a placeholder ID. Review the output before deployment: the function does not preserve existing events or custom configuration.

## 🧪 Browser test

Clone the repo, open `gtag-test.html` — interactive test in your browser  
or click 👉🏻 [Google Tag Demo](https://yvancg.github.io/optimizers/is-google-tag/gtag-test.html)

---

## 🛠 Development

This module is standalone. You can copy `gtag.js` into your own project.  
No `npm install` or build step required.

### Node one-liners

```bash
node --input-type=module -e "import('./gtag.js').then(m=>console.log(m.optimizeGoogleTag('<script src=https://www.googletagmanager.com/gtag/js?id=G-TEST></script>')))"
```

---

## 🪪 License

MIT License  

Copyright (c) 2025 **Y Consulting LLC**

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---

## ❤️ Support the project

If this library helped you, consider sponsoring its maintenance.

### GitHub Sponsors

[👉 Sponsor me on GitHub](https://github.com/sponsors/yvancg)

### Buy Me a Coffee

[☕ Support via BuyMeACoffee](https://buymeacoffee.com/yconsulting)

### Custom link
[💸 Direct Contribution via Paypal](https://www.paypal.com/ncp/payment/4HT7CA3E7HYBA)
