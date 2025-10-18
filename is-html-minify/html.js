// is-html-minify/html.js
// Safe HTML minifier: removes comments, collapses inter-tag whitespace,
// trims attributes, and preserves <pre|textarea|script|style> content.
// No DOM parsing. O(n) single pass + a few regex passes on safe regions.

const PRESERVE_TAGS = new Set(['pre', 'textarea', 'script', 'style']);

export function minifyHTML(input, opts = {}) {
  const cfg = {
    removeComments: true,
    collapseWhitespace: true,
    trimAttrWhitespace: true,
    removeEmptyAttributes: false, // conservative default
    booleanAttrShortening: true,  // disabled|checked => keep as-is by default (no change)
    ...opts
  };
  if (typeof input !== 'string') return '';

  // 1) Split into segments that are either in a preserved tag or not
  const segs = segmentByPreserveTags(input);

  // 2) Process non-preserved segments with regex passes
  for (const s of segs) {
    if (s.preserve) continue;
    let chunk = s.text;

    if (cfg.removeComments) {
      // Remove standard comments: <!-- ... --> (not IE conditionals)
      chunk = chunk.replace(/<!--(?!\[if|\s*<!)[\s\S]*?-->/g, '');
    }

    if (cfg.trimAttrWhitespace || cfg.removeEmptyAttributes) {
      chunk = chunk.replace(/<([A-Za-z][^\s/>]*)([^>]*)>/g, (m, tag, attrs) => {
        if (!attrs) return `<${tag}>`;
        let a = attrs;

        if (cfg.trimAttrWhitespace) {
          // Collapse runs of whitespace in attributes
          a = a.replace(/\s+/g, ' ');
          // Trim around equals and quotes
          a = a.replace(/\s*=\s*/g, '=');
          // Trim leading space before first attr and trailing before '>'
          a = a.replace(/^\s+/, ' ').replace(/\s+$/, '');
          // Trim quoted attribute whitespace
          a = a.replace(/="([^"]+)"/g, (_, v) => `="${v.trim()}"`)
               .replace(/='([^']+)'/g, (_, v) => `='${v.trim()}'`);
        }

        if (cfg.removeEmptyAttributes) {
          a = a.replace(/\s+([^\s=/>]+)=(""\|''|\s*(?=>))/g, '');
        }

        return `<${tag}${a}>`;
      });
    }

    if (cfg.collapseWhitespace) {
      // Collapse whitespace between tags and around text nodes, but not inside words
      // Convert sequences like ">   <" to "><"
      chunk = chunk.replace(/>\s+</g, '><');
      // Collapse leading/trailing whitespace
      chunk = chunk.replace(/^\s+|\s+$/g, '');
      // Collapse runs of spaces and newlines to a single space
      chunk = chunk.replace(/\s{2,}/g, ' ');
    }

    s.text = chunk;
  }

  // 3) Rejoin
  return segs.map(s => s.text).join('');
}

// --- helpers ---

function segmentByPreserveTags(html) {
  const out = [];
  let i = 0;
  const n = html.length;
  let mode = 'plain';          // 'plain' or tagName (inside preserve)
  let tagStack = [];

  while (i < n) {
    if (mode === 'plain') {
      const open = html.slice(i).search(/<(pre|textarea|script|style)\b/i);
      if (open === -1) {
        out.push({ preserve: false, text: html.slice(i) });
        break;
      }
      const at = i + open;
      // push plain segment before the tag
      if (at > i) out.push({ preserve: false, text: html.slice(i, at) });

      // capture the opening tag
      const m = /<(pre|textarea|script|style)\b/ig.exec(html.slice(at));
      const tag = m[1].toLowerCase();
      const closeOfOpen = html.indexOf('>', at);
      if (closeOfOpen === -1) { // malformed, dump rest
        out.push({ preserve: false, text: html.slice(at) });
        break;
      }
      const openTagEnd = closeOfOpen + 1;
      const closeTag = `</${tag}>`;
      const closeAt = html.toLowerCase().indexOf(closeTag, openTagEnd);
      if (closeAt === -1) {
        // no close, treat rest as preserved to avoid breaking content
        out.push({ preserve: true, text: html.slice(at) });
        break;
      }
      const preserved = html.slice(at, closeAt + closeTag.length);
      out.push({ preserve: true, text: preserved });
      i = closeAt + closeTag.length;
    } else {
      // unused path; we always switch back to 'plain'
      i++;
    }
  }
  return out;
}
