// is-dataset-minify/dataset.js
// Minimal dataset optimizer for JSON / JSONL / CSV.
// Cleans, prunes, dedupes, and shuffles for fine-tuning style data.

export function optimizeDataset(input, options = {}) {
  if (typeof input !== 'string') throw new Error('input must be a string');

  const {
    format: userFormat = 'auto',           // 'auto' | 'json' | 'jsonl' | 'csv'
    outputFormat = 'same',                 // 'same' | 'json' | 'jsonl' | 'csv'
    keyCase = 'none',                      // 'none' | 'snake' | 'camel'
    trimStrings = true,
    collapseWhitespace = true,
    maxCharsPerField = null,               // number | null
    dropEmptyColumns = true,
    emptyColumnThreshold = 0.95,           // drop if > 95% empty
    dropDuplicateRows = true,
    primaryKey = null,                     // name of key for dedupe if present
    shuffle = false,
    seed = null
  } = options;

  const text = input.trim();
  if (!text) return '';

  let format = userFormat;
  if (format === 'auto') {
    format = detectFormat(text);
  }
  if (format !== 'json' && format !== 'jsonl' && format !== 'csv') {
    throw new Error("format must be 'json' | 'jsonl' | 'csv' | 'auto'");
  }

  const rowsInfo = parseToRows(text, format);
  let rows = rowsInfo.rows;
  let headers = rowsInfo.headers; // only for CSV

  if (!rows.length) {
    return format === 'csv' ? (headers ? headers.join(',') : '') : '';
  }

  // RNG for shuffling
  const R = seed ? seededRNG(String(seed)) : cryptoRNG();

  // 1. Normalize keys if requested
  if (keyCase !== 'none') {
    const keyMap = new Map();
    const first = rows[0];
    for (const key of Object.keys(first)) {
      keyMap.set(key, normalizeKey(key, keyCase));
    }
    rows = rows.map(row => {
      const out = {};
      for (const k in row) {
        const nk = keyMap.get(k) || k;
        out[nk] = row[k];
      }
      return out;
    });
    if (headers) {
      headers = headers.map(h => keyMap.get(h) || h);
    }
  }

  // 2. Per field cleanup (strings) + empty column stats
  const keys = Object.keys(rows[0]);
  const keyCount = keys.length;
  const emptyCounts = new Array(keyCount).fill(0);

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    for (let j = 0; j < keyCount; j++) {
      const k = keys[j];
      let v = r[k];

      if (v == null) {
        emptyCounts[j]++;
        continue;
      }

      if (typeof v === 'string') {
        let s = v;
        if (trimStrings) s = s.trim();
        if (collapseWhitespace && s.length) s = s.replace(/\s+/g, ' ');
        if (maxCharsPerField && maxCharsPerField > 0 && s.length > maxCharsPerField) {
          s = s.slice(0, maxCharsPerField);
        }
        if (s === '') emptyCounts[j]++;
        r[k] = s;
      } else if (Number.isNaN(v)) {
        emptyCounts[j]++;
      }
    }
  }

  // 3. Drop mostly empty columns
  let keptKeys = keys;
  if (dropEmptyColumns && rows.length > 0) {
    const rowCount = rows.length;
    const newKeys = [];
    for (let j = 0; j < keyCount; j++) {
      const emptyRatio = emptyCounts[j] / rowCount;
      if (emptyRatio <= emptyColumnThreshold) {
        newKeys.push(keys[j]);
      }
    }
    keptKeys = newKeys;

    if (newKeys.length !== keys.length) {
      rows = rows.map(r => {
        const out = {};
        for (let j = 0; j < newKeys.length; j++) {
          const k = newKeys[j];
          out[k] = r[k];
        }
        return out;
      });
      if (headers) {
        headers = headers.filter(h => newKeys.includes(h));
      }
    }
  }

  // 4. Deduplicate rows
  if (dropDuplicateRows) {
    const seen = new Set();
    const out = [];
    const hasPK = primaryKey && keptKeys.includes(primaryKey);

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const key = hasPK && r[primaryKey] != null
        ? `pk:${String(r[primaryKey])}`
        : 'row:' + JSON.stringify(r);

      if (!seen.has(key)) {
        seen.add(key);
        out.push(r);
      }
    }
    rows = out;
  }

  // 5. Shuffle rows if requested
  if (shuffle && rows.length > 1) {
    fisherYates(rows, R);
  }

  // 6. Serialize back to desired format
  const outFormat = outputFormat === 'same' ? format : outputFormat;
  if (outFormat === 'json') {
    return JSON.stringify(rows, null, 2);
  }
  if (outFormat === 'jsonl') {
    return rows.map(r => JSON.stringify(r)).join('\n');
  }
  if (outFormat === 'csv') {
    const headerRow = headers || keptKeys;
    const parts = [];
    parts.push(headerRow.join(','));
    for (const r of rows) {
      const line = headerRow
        .map(name => csvCell(r[name], ','))
        .join(',');
      parts.push(line);
    }
    return parts.join('\n');
  }

  throw new Error("outputFormat must be 'same' | 'json' | 'jsonl' | 'csv'");
}

// ------------ format detection + parsing ------------

function detectFormat(text) {
  const t = text.trim();
  if (!t) return 'json';

  if (t[0] === '[') return 'json';

  if (t[0] === '{') {
    if (t.indexOf('\n{') !== -1) return 'jsonl';
    return 'json';
  }

  const firstNL = t.indexOf('\n');
  const firstLine = firstNL === -1 ? t : t.slice(0, firstNL);
  if (firstLine.includes(',')) return 'csv';

  return 'jsonl';
}

function parseToRows(text, format) {
  if (format === 'json') {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return { rows: parsed, headers: null };
    if (parsed && typeof parsed === 'object') return { rows: [parsed], headers: null };
    throw new Error('JSON input must be an array or object');
  }

  if (format === 'jsonl') {
    const lines = text.split(/\r?\n/);
    const rows = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      rows.push(JSON.parse(line));
    }
    return { rows, headers: null };
  }

  return parseCSV(text);
}

function parseCSV(str) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  const len = str.length;

  for (let i = 0; i < len; i++) {
    const ch = str[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < len && str[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        row.push(field);
        field = '';
      } else if (ch === '\r') {
      } else if (ch === '\n') {
        row.push(field);
        field = '';
        if (row.length > 1 || (row.length === 1 && row[0].trim() !== '')) {
          rows.push(row);
        }
        row = [];
      } else {
        field += ch;
      }
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }

  if (!rows.length) return { rows: [], headers: [] };

  const header = rows.shift().map(h => h.trim());
  const objs = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (!r.length || (r.length === 1 && !r[0].trim())) continue;
    const obj = {};
    for (let j = 0; j < header.length; j++) {
      obj[header[j]] = r[j] != null ? r[j] : '';
    }
    objs.push(obj);
  }

  return { rows: objs, headers: header };
}

// ------------ key normalization ------------

function normalizeKey(key, mode) {
  if (mode === 'none') return key;
  if (mode === 'snake') return toSnakeCase(key);
  if (mode === 'camel') return toCamelCase(key);
  return key;
}

function toSnakeCase(str) {
  return String(str)
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[\s\-]+/g, '_')
    .toLowerCase();
}

function toCamelCase(str) {
  const s = String(str).trim().replace(/[\s_\-]+/g, ' ').toLowerCase();
  const parts = s.split(' ');
  if (!parts.length) return '';
  let out = parts[0];
  for (let i = 1; i < parts.length; i++) {
    const p = parts[i];
    if (!p) continue;
    out += p[0].toUpperCase() + p.slice(1);
  }
  return out;
}

// ------------ CSV helpers ------------

function csvCell(v, delim) {
  if (v == null) return '';
  const s = String(v);
  if (s === '') return '';
  const needsQuote =
    s.includes('"') || s.includes('\n') || s.includes('\r') || s.includes(delim);
  if (!needsQuote) return s;
  return '"' + s.replace(/"/g, '""') + '"';
}

// ------------ shuffle + RNG ------------

function fisherYates(arr, R) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = R() % (i + 1);
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
}

function cryptoRNG() {
  if (globalThis.crypto && typeof globalThis.crypto.getRandomValues === 'function') {
    const buf = new Uint32Array(256);
    let idx = buf.length;
    return () => {
      if (idx >= buf.length) {
        globalThis.crypto.getRandomValues(buf);
        idx = 0;
      }
      return buf[idx++] >>> 0;
    };
  }
  let x = 0x9e3779b9 ^ Date.now();
  return () => {
    x = (x + 0x6d2b79f5) | 0;
    x ^= x >>> 15;
    x = Math.imul(x, 1 | x);
    x ^= x >>> 7;
    return (x ^ (x >>> 14)) >>> 0;
  };
}

function seededRNG(seed) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return (t ^ (t >>> 14)) >>> 0;
  };
}
