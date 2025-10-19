import { writeFileSync, mkdirSync } from 'node:fs';
import { performance }              from 'node:perf_hooks';

import { minifyHTML }  from '../is-html-minify/html.js';
import { minifyJS }    from '../is-minify/minify.js';
import { promptMinify }from '../is-prompt-minify/prompt.js';
import { stripAnsi }   from '../is-strip-ansi/strip.js';

function bench(fn, iters) {
  for (let i = 0; i < Math.min(100, iters); i++) fn();
  const t0 = performance.now();
  for (let i = 0; i < iters; i++) fn();
  const ms = performance.now() - t0;
  return Math.round(iters / (ms / 1000)); // ops/s
}

const targets = [
  {
    name: 'html-minify',
    fn: () => minifyHTML(`<!-- c --><div class="box"><p> Hello   world </p><pre> keep   this   </pre><script> const x = 1 + 2 </script></div>`),
    iters: 4000,
  },
  { name: 'js-minify', fn: () => minifyJS('function x(){return 42}/*c*/'), iters: 2000 },
  { name: 'prompt',    fn: () => promptMinify('You are a helpful helpful AI assistant. Please please respond clearly clearly.'), iters: 10000 },
  { name: 'strip',     fn: () => stripAnsi('\u001B[31mError:\u001B[0m invalid token'), iters: 12000 },
];

mkdirSync('bench', { recursive: true });

let wrote = 0;
for (const t of targets) {
  try {
    const ops = bench(t.fn, t.iters);
    const color = ops > 1_000_000 ? 'brightgreen'
                : ops >   300_000 ? 'green'
                : ops >   100_000 ? 'blue'
                : 'lightgrey';
    const json = {
      schemaVersion: 1,
      label: 'speed',
      message: `${ops.toLocaleString()} ops/s`,
      color
    };
    writeFileSync(`bench/${t.name}.json`, JSON.stringify(json, null, 2));
    wrote++;
  } catch {
    const json = { schemaVersion: 1, label: 'speed', message: 'error', color: 'red' };
    writeFileSync(`bench/${t.name}.json`, JSON.stringify(json, null, 2));
  }
}
if (!wrote) process.exit(1);
