// is-strip-ansi/strip.js
// Purpose: remove ANSI escape codes from strings.
// Security: pure string processing; no eval; safe for untrusted logs.
// Perf: O(n) single regex pass.

// is-strip-ansi/strip.js
// Robust stripper with OSC-8 unwrap. No deps.

const ESC = 0x1B;    // \x1B
const BEL = 0x07;    // \x07
const CSI_C1 = 0x9B; // single-byte CSI

function isFinalByte(code) {
  // CSI final byte range @ (0x40) ... ~ (0x7E)
  return code >= 0x40 && code <= 0x7E;
}

export function stripAnsi(input) {
  if (input == null) return '';
  const s = String(input);
  const n = s.length;
  let i = 0;
  let out = '';

  while (i < n) {
    const c = s.charCodeAt(i);

    // ---- CSI via C1 (0x9B) ----
    if (c === CSI_C1) {
      i++; // consume C1
      while (i < n && !isFinalByte(s.charCodeAt(i))) i++;
      if (i < n) i++; // consume final
      continue;
    }

    if (c === ESC) {
      const next = s.charCodeAt(i + 1);

      // ---- CSI via ESC [ ----
      if (s[i + 1] === '[') {
        i += 2;
        while (i < n && !isFinalByte(s.charCodeAt(i))) i++;
        if (i < n) i++;
        continue;
      }

      // ---- OSC via ESC ] ----
      if (s[i + 1] === ']') {
        // i points to ESC, i+1 is ']'
        // Check for OSC-8 hyperlink: ESC ] 8 ; params ; url ST  TEXT  ESC ] 8 ; params ; ST
        let j = i + 2; // start after ']'
        // read up to ST of the first OSC
        const st1 = findST(s, j);
        if (st1 === -1) { i = n; break; }

        const isOSC8 = s[j] === '8' && s[j + 1] === ';';
        if (isOSC8) {
          // visible text starts after first ST, ends before closing OSC-8
          const textStart = st1 + stLen(s, st1);
          // find closing OSC-8 opener "ESC]8;"
          const closeOpen = s.indexOf('\x1B]8;', textStart);
          if (closeOpen !== -1) {
            const st2 = findST(s, closeOpen + 3);
            if (st2 !== -1) {
              // append only the visible text between the two OSC-8 sequences
              out += s.slice(textStart, closeOpen);
              i = st2 + stLen(s, st2);
              continue;
            }
          }
        }

        // Non-OSC8 or failed pairing: drop entire OSC block
        i = st1 + stLen(s, st1);
        continue;
      }

      // ---- DCS/SOS/PM/APC via ESC P/X/^/_ ----
      if (s[i + 1] === 'P' || s[i + 1] === 'X' || s[i + 1] === '^' || s[i + 1] === '_') {
        const st = findST(s, i + 2);
        i = st === -1 ? n : st + stLen(s, st);
        continue;
      }

      // ---- Other short ESC sequences: consume ESC + next ----
      i += 2;
      continue;
    }

    // ---- C0 controls except \n \r \t ----
    if ((c <= 0x1F || c === 0x7F) && c !== 0x09 && c !== 0x0A && c !== 0x0D) {
      i++;
      continue;
    }

    // keep visible char
    out += s[i++];
  }

  return out;
}

// Find String Terminator for OSC/DCS etc. ST is BEL (\x07) or ESC \
function findST(s, start) {
  const n = s.length;
  for (let i = start; i < n; i++) {
    const ch = s.charCodeAt(i);
    if (ch === BEL) return i;                 // BEL
    if (ch === ESC && s[i + 1] === '\\') return i; // ESC \
  }
  return -1;
}

function stLen(s, idx) {
  // returns the length in chars of the ST sequence at s[idx..]
  if (s.charCodeAt(idx) === BEL) return 1;
  if (s.charCodeAt(idx) === ESC && s[idx + 1] === '\\') return 2;
  return 0;
}

export function hasAnsi(input) {
  const str = String(input || '');
  // quick checks: ESC, C1 CSI, or BEL/ESC\ ST patterns
  return /[\x1B\x9B]/.test(str);
}
