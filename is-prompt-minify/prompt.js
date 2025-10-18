// is-prompt-minify/prompt.js
// Purpose: compact prompt strings for LLMs by removing redundancy, 
// formatting noise, noise phrase removal + token-based early stop. 
// Security: pure string processing; no eval, no parsing.
// Perf: O(n) single pass regex cleanup.

const MULTISPACE = /\s{2,}/g;
const DUP_WORDS  = /(\b\w+\b)(\s+\1\b)+/gi;
const TRIPLE_NL  = /\n{3,}/g;

// Common fluff/noise (case-insensitive). Safe, short, generic.
const NOISE_PATTERNS = [
  /\bplease\b/gi,
  /\bkindly\b/gi,
  /\bas an ai language model\b/gi,
  /\byou are (a|an) helpful assistant\b/gi,
  /\byour task is to\b/gi,
  /\bin this task( you)? will\b/gi,
  /\bmake sure to\b/gi,
  /\bensure that\b/gi,
  /\bnote that\b/gi,
  /\bremember that\b/gi,
  /\bthe following instructions\b/gi,
  /\bstep[-\s]?by[-\s]?step\b/gi,
  /\bthe user said:\b/gi,
  /\byou are chatgpt\b/gi
];

// Cheap token estimate (heuristic). Good enough for gating.
function estimateTokens(s) {
  if (!s) return 0;
  // split on whitespace and keep punctuation as separate units
  const parts = s
    .replace(/\r\n?/g, '\n')
    .split(/(\s+|[.,!?;:()[\]{}"'`“”‘’…\-_/\\|<>]+)/)
    .filter(x => x && !/^\s+$/.test(x));
  return parts.length;
}

function removeNoise(text) {
  let t = text;
  for (const re of NOISE_PATTERNS) t = t.replace(re, '');
  // collapse leftover “double spaces” from removals
  t = t.replace(MULTISPACE, ' ');
  // clean lines that became mostly punctuation/spaces
  t = t
    .split('\n')
    .map(line => line.trim())
    .filter(line => line !== '')
    .join('\n\n'); // preserve paragraph breaks
  return t;
}

/**
 * promptMinify
 * Base cleanup only (kept for backward-compat).
 */
export function promptMinify(input, opts = {}) {
  if (input == null) return '';
  let text = String(input).replace(/\r\n?/g, '\n');
  text = text.replace(MULTISPACE, ' ');
  text = text.replace(TRIPLE_NL, '\n\n');
  text = text.replace(DUP_WORDS, '$1');
  if (opts.trim !== false) text = text.trim();
  return text;
}

/**
 * optimizePrompt
 * Adds noise filtering and token-threshold early stop.
 * @param {string} input
 * @param {{ trim?: boolean, minGainPct?: number, noise?: boolean }} [opts]
 * @returns {{ optimized: string, stats: { bytesBefore:number, bytesAfter:number, savedBytesPct:number, tokensBefore:number, tokensAfter:number, savedTokensPct:number } }}
 */
export function optimizePrompt(input, opts = {}) {
  const cfg = {
    trim: true,
    minGainPct: 5,   // stop if token savings < 5%
    noise: true,
    ...opts
  };

  const encSize = s => new TextEncoder().encode(String(s)).length;

  const beforeTokens = estimateTokens(input || '');
  const beforeBytes  = encSize(input || '');

  // Pass 1: structural minify
  let out = promptMinify(input, { trim: cfg.trim });

  // Pass 2: noise filtering (optional)
  if (cfg.noise) out = removeNoise(out);

  // One more light structural pass to settle spacing after removals
  out = promptMinify(out, { trim: cfg.trim });

  const afterTokens = estimateTokens(out);
  const afterBytes  = encSize(out);

  const savedTokPct = beforeTokens
    ? Math.max(0, ((beforeTokens - afterTokens) / beforeTokens) * 100)
    : 0;

  // Early stop: if savings below threshold, return original
  if (savedTokPct < cfg.minGainPct) {
    return {
      optimized: String(input || '').trim(),
      stats: {
        bytesBefore: beforeBytes,
        bytesAfter: beforeBytes,
        savedBytesPct: 0,
        tokensBefore: beforeTokens,
        tokensAfter: beforeTokens,
        savedTokensPct: 0
      }
    };
  }

  const savedBytesPct = beforeBytes
    ? Math.max(0, ((beforeBytes - afterBytes) / beforeBytes) * 100)
    : 0;

  return {
    optimized: out,
    stats: {
      bytesBefore: beforeBytes,
      bytesAfter: afterBytes,
      savedBytesPct: Math.round(savedBytesPct * 10) / 10,
      tokensBefore: beforeTokens,
      tokensAfter: afterTokens,
      savedTokensPct: Math.round(savedTokPct * 10) / 10
    }
  };
}
