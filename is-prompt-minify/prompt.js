// is-prompt-minify/prompt.js
// Purpose: compact prompt strings for LLMs by removing redundancy and formatting noise.
// Security: pure string processing; no eval, no parsing.
// Perf: O(n) single pass regex cleanup.

const MULTISPACE = /\s{2,}/g;
const DUP_SPACES = /(\b\w+\b)(\s+\1\b)+/gi; // repeated words
const SECTION_DUPES = /(\n{2,})(\s*\1)+/g;

/**
 * promptMinify
 * Clean up a prompt string: collapse whitespace, normalize newlines,
 * remove duplicates and trailing noise.
 * @param {string} input
 * @param {object} [opts]
 * @param {boolean} [opts.trim=true]
 * @returns {string}
 */
export function promptMinify(input, opts = {}) {
  if (input == null) return '';
  let text = String(input);

  // normalize line endings
  text = text.replace(/\r\n?/g, '\n');

  // collapse multiple spaces
  text = text.replace(MULTISPACE, ' ');

  // collapse repeated blank lines
  text = text.replace(/\n{3,}/g, '\n\n');

  // remove repeated words like "very very good"
  text = text.replace(DUP_SPACES, '$1');

  // collapse redundant empty paragraphs
  text = text.replace(SECTION_DUPES, '\n\n');

  // trim unless disabled
  if (opts.trim !== false) text = text.trim();

  return text;
}

/**
 * promptDiff
 * Compare input vs. minimized text and return compression stats.
 * @param {string} input
 * @param {string} [output]
 * @returns {{ before: number, after: number, savedPct: number }}
 */
export function promptDiff(input, output) {
  const orig = new TextEncoder().encode(String(input || '')).length;
  const min = new TextEncoder().encode(String(output || '')).length;
  const pct = orig ? ((orig - min) / orig) * 100 : 0;
  return { before: orig, after: min, savedPct: Math.max(0, Math.round(pct * 10) / 10) };
}

export default { promptMinify, promptDiff };
