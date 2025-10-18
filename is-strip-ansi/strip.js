// is-strip-ansi/strip.js
// Purpose: remove ANSI escape codes from strings.
// Security: pure string processing; no eval; safe for untrusted logs.
// Perf: O(n) single regex pass.

const ANSI_PATTERN =
  // \u001B (ESC) followed by [ or ], then control sequence
  // Handles CSI (e.g., \x1b[31m) and OSC (e.g., \x1b]8;;url\x07)
  /[\u001B\u009B][[\]()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;

/**
 * stripAnsi
 * Removes ANSI escape sequences (color, cursor, etc.) from text.
 * @param {string} input
 * @returns {string}
 */
export function stripAnsi(input) {
  if (input == null) return '';
  return String(input).replace(ANSI_PATTERN, '');
}

/**
 * hasAnsi
 * Detect if a string contains ANSI escape sequences.
 * @param {string} input
 * @returns {boolean}
 */
export function hasAnsi(input) {
  return ANSI_PATTERN.test(String(input || ''));
}

/**
 * safeLog
 * Strips ANSI before logging (optional helper).
 * @param {any} value
 * @returns {void}
 */
export function safeLog(value) {
  console.log(stripAnsi(String(value)));
}

export default { stripAnsi, hasAnsi, safeLog };
