// is-strip-ansi/strip.js
// Purpose: remove ANSI escape codes from strings.
// Security: pure string processing; no eval; safe for untrusted logs.
// Perf: O(n) single regex pass.

// 1) Unwrap OSC-8 hyperlinks: ESC ] 8 ; params ; URL ST  TEXT  ESC ] 8 ; params ; ST  → TEXT
const OSC8_LINK = /\x1B\]8;[^\x07\x1B]*;[^\x07\x1B]*?(?:\x07|\x1B\\)([\s\S]*?)\x1B\]8;[^\x07\x1B]*;(?:\x07|\x1B\\)/g;

// 2) Any OSC block (non-greedy, ST = BEL or ESC\)
const OSC_ANY = /\x1B\][\s\S]*?(?:\x07|\x1B\\)/g;

// 3) DCS/SOS/PM/APC blocks using ST
const DCS_SOS_PM_APC = /\x1B(?:P|X|\^|_)[\s\S]*?(?:\x07|\x1B\\)/g;

// 4) CSI (ESC[ … or C1 0x9B …)
const CSI = /(?:\x1B\[|\u009B)[0-?]*[ -/]*[@-~]/g;

// 5) Residual C0 controls except \n\r\t
const C0 = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

export function stripAnsi(input) {
  if (input == null) return '';
  let s = String(input);

  // unwrap links first so we keep the visible text
  s = s.replace(OSC8_LINK, '$1');

  // drop remaining control sequences
  s = s.replace(OSC_ANY, '');
  s = s.replace(DCS_SOS_PM_APC, '');
  s = s.replace(CSI, '');
  s = s.replace(C0, '');

  return s;
}

export function hasAnsi(input) {
  const str = String(input || '');
  return (
    OSC8_LINK.test(str) || OSC_ANY.test(str) ||
    DCS_SOS_PM_APC.test(str) || CSI.test(str) || C0.test(str)
  );
}
