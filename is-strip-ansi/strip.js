// is-strip-ansi/strip.js
// Purpose: remove ANSI escape codes from strings.
// Security: pure string processing; no eval; safe for untrusted logs.
// Perf: O(n) single regex pass.

// Unwrap OSC 8 hyperlinks: \x1B]8;...;<url>\x07TEXT\x1B]8;...;\x07  ->  TEXT
const OSC8_LINK = /\x1B\]8;[^;]*;[^\x07\x1B]*\x07([\s\S]*?)\x1B\]8;[^;]*;\x07/g;

// Any other OSC: \x1B] ... (ST = BEL or ESC\)
const OSC_ANY   = /\x1B\][^\x07\x1B]*(?:\x07|\x1B\\)/g;

// CSI control sequences: \x1B[ ... final byte @-~
const CSI       = /\x1B\[[0-?]*[ -/]*[@-~]/g;
const CSI_C1    = /\u009B[0-?]*[ -/]*[@-~]/g; // single-byte C1 CSI

// DCS/SOS/PM/APC blocks using ST (BEL or ESC\)
const DCS_SOS_PM_APC = /\x1B(?:P|X|\^|_)[^\x07\x1B]*(?:\x07|\x1B\\)/g;

export function stripAnsi(input) {
  if (input == null) return '';
  let s = String(input);

  // 1) unwrap links to keep human text
  s = s.replace(OSC8_LINK, '$1');

  // 2) drop remaining control sequences
  s = s.replace(OSC_ANY, '');
  s = s.replace(DCS_SOS_PM_APC, '');
  s = s.replace(CSI, '');
  s = s.replace(CSI_C1, '');

  return s;
}

export function hasAnsi(input) {
  const str = String(input || '');
  return (
    OSC8_LINK.test(str) ||
    OSC_ANY.test(str) ||
    DCS_SOS_PM_APC.test(str) ||
    CSI.test(str) ||
    CSI_C1.test(str)
  );
}
