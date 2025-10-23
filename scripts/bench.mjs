// scripts/bench.mjs
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';

// --- Import targets explicitly to avoid discovery misses ---
import { optimizeGoogleTag } from '../is-google-tag/gtag.js';
import { minifyHTML }   from '../is-html-minify/html.js';
import { minifyJS }     from '../is-minify/minify.js';
import { promptMinify } from '../is-prompt-minify/prompt.js';
import { stripAnsi }    from '../is-strip-ansi/strip.js';

mkdirSync('bench', { recursive: true });

async function bench(fn, iters) {
  for (let i = 0; i < Math.min(100, iters); i++) await fn(); // warmup
  const t0 = performance.now();
  for (let i = 0; i < iters; i++) await fn();
  const ms = performance.now() - t0;
  return Math.round(iters / (ms / 1000)); // ops/s
}

const targets = [
  {
    name: 'gtag',
    fn: () => optimizeGoogleTag(String.raw`
      <script src="https://www.googletagmanager.com/gtag/js?id=G-TEST123"></script>
      <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-TEST123');
      </script>`),
    iters: 6_000,
  },
  {
    name: 'html-minify',
    fn: () => minifyHTML(`<!-- c --><div class="box"><p> Hello   world </p><pre> keep   this   </pre><script> const x = 1 + 2 </script></div>`),
    iters: 4_000,
  },
  { name: 'js-minify', fn: () => minifyJS('function x(){return 42}/*c*/'), iters: 2_000 },
  { name: 'prompt',    fn: () => promptMinify('You are a helpful helpful AI assistant. Please please respond clearly clearly.'), iters: 10_000 },
  { name: 'strip',     fn: () => stripAnsi('\u001B[31mError:\u001B[0m invalid token'), iters: 12_000 },
];

// 1) Pre-write error placeholders so badges always exist
for (const t of targets) {
  writeFileSync(`bench/${t.name}.json`, JSON.stringify({
    schemaVersion: 1, label: 'speed', message: 'error', color: 'red'
  }, null, 2));
}

// 2) Log targets and each run
console.log('targets:', targets.map(t => t.name).join(', '));

let wrote = 0;
let failed = 0;

for (const t of targets) {
  console.log('→ running', t.name);
  try {
    const ops = await bench(t.fn, t.iters);
    const color =
      ops > 1_000_000 ? 'brightgreen' :
      ops >   300_000 ? 'green'       :
      ops >   100_000 ? 'blue'        :
                         'lightgrey';
    const json = { schemaVersion: 1, label: 'speed', message: `${ops.toLocaleString()} ops/s`, color };
    writeFileSync(`bench/${t.name}.json`, JSON.stringify(json, null, 2));
    wrote++;
  } catch (e) {
    failed++;
    console.error(`[bench:${t.name}]`, e?.stack || e);
    // placeholder remains as "error"
  }
}

console.table(targets.map(t => {
  let badge = 'n/a';
  try {
    const { message } = JSON.parse(String(readFileSync(`bench/${t.name}.json`)));
    badge = message;
  } catch {}
  return { target: t.name, iters: t.iters.toLocaleString(), badge };
}));

// Do not exit non-zero; let workflow commit badges
