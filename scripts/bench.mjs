import { writeFileSync } 		from 'node:fs';
import { performance }   		from 'node:perf_hooks';

// --- Import targets explicitly to avoid discovery misses ---
import { minifyJS }     			from '../is-minify/minify.js';

function bench(fn, input, iters) {
  // warmup
  for (let i = 0; i < Math.min(100, iters); i++) fn(input);
  const t0 = performance.now();
  for (let i = 0; i < iters; i++) fn(input);
  const ms = performance.now() - t0;
  const ops = Math.round(iters / (ms / 1000));
  return ops;
}

const targets = [
  { name: 'minify', fn: () => minifyJS('function x(){return 42}/*c*/'),         iters: 2000 },
];

let wrote = 0;
for (const t of targets) {
  try {
    const ops = bench(t.fn, undefined, t.iters);
    const json = {
      schemaVersion: 1,
      label: 'throughput',
      message: `${ops.toLocaleString()} ops/s`,
      color: 'informational'
    };
    writeFileSync(`bench/${t.name}.json`, JSON.stringify(json, null, 2));
    wrote++;
  } catch (e) {
    const json = {
      schemaVersion: 1,
      label: 'throughput',
      message: 'error',
      color: 'red'
    };
    writeFileSync(`bench/${t.name}.json`, JSON.stringify(json, null, 2));
  }
}
if (!wrote) process.exit(1);
