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
        // skip closing tags
        if (tag[0] === '/') return m;
    
        // detect self-closing
        const selfClose = /\s*\/\s*$/.test(attrs);
    
        let a = attrs || '';
    
        if (cfg.trimAttrWhitespace) {
          a = a.replace(/\s+/g, ' ');       // collapse runs
          a = a.replace(/\s*=\s*/g, '=');   // normalize =
          // trim quoted values
          a = a.replace(/="([^"]*)"/g, (_, v) => `="${v.trim()}"`)
               .replace(/='([^']*)'/g, (_, v) => `='${v.trim()}'`);
          a = a.trim();
        }
    
        if (cfg.removeEmptyAttributes) {
          // remove attr="" or attr='' or val-missing before > or />
          a = a.replace(/\s+([^\s=/>]+)=(?:""|''|\s*(?=>|\/>))/g, '');
        }
    
        // rebuild
        const attrsOut = a ? ` ${a}` : '';
        const slash = selfClose ? '/' : '';
        return `<${tag}${attrsOut}${slash}>`;
      });
    }

    if (cfg.collapseWhitespace) {
      const INLINE = /^(a|abbr|b|bdi|bdo|cite|code|data|dfn|em|i|kbd|label|mark|q|rp|rt|rtc|ruby|s|samp|small|span|strong|sub|sup|time|u|var)$/i;
    
      // 1) remove all inter-tag whitespace
      chunk = chunk.replace(/>\s+</g, '><');
    
      // 2) reinsert ONE space only when both adjacent tags are inline-level
      chunk = chunk.replace(
        /(>)(<\/?([A-Za-z][^\s/>]*)\b[^>]*>)(<\/?([A-Za-z][^\s/>]*)\b[^>]*>)/g,
        (m, gt, t1, n1, t2, n2) => (INLINE.test(n1) && INLINE.test(n2)) ? `${gt}${t1} ${t2}` : `${gt}${t1}${t2}`
      );
    
      // 3) trim text-node edges
      chunk = chunk.replace(/>\s+([^\s<])/g, '>$1');
      chunk = chunk.replace(/([^\s>])\s+</g, '$1<');
    
      // 4) trim start/end
      chunk = chunk.replace(/^\s+|\s+$/g, '');
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
