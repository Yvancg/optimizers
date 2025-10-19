// is-html-minify/html.js
// Safe HTML minifier: removes comments, collapses whitespace,
// trims attributes, and preserves <pre|textarea|script|style> content.
// No DOM parsing. O(n) segmentation + linear regex passes on safe regions.

const DEFAULT_PRESERVE = ['pre', 'textarea', 'script', 'style'];
const PRESERVE_RX = /<(pre|textarea|script|style)\b/i;
const VOID = /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i;
const INLINE = /^(a|abbr|b|bdi|bdo|cite|code|data|dfn|em|i|kbd|label|mark|q|rp|rt|rtc|ruby|s|samp|small|span|strong|sub|sup|time|u|var)$/i;

export function minifyHTML(input, opts = {}) {
  let html = typeof input === 'string' ? input : '';
  if (!html) return '';

  const cfg = {
    removeComments: true,
    collapseWhitespace: true,
    trimAttrWhitespace: true,
    removeEmptyAttributes: false,
    booleanAttrShortening: false,
    removeDefaultType: true,
    keepMarkers: [],               // e.g. ['prettier-ignore']
    preserveTags: DEFAULT_PRESERVE,
    ...opts
  };

  // 0) Normalize doctype
  html = html.replace(/^\s*<!doctype[^>]*>/i, '<!DOCTYPE html>');

  // 0.1) Extract keep-markers so they survive minification
  const kept = new Map();
  if (cfg.keepMarkers && cfg.keepMarkers.length) {
    const keep = new RegExp(
      `<!--\\s*(?:${cfg.keepMarkers.map(escapeRx).join('|')})\\b[\\s\\S]*?-->`,
      'ig'
    );
    let i = 0;
    html = html.replace(keep, m => {
      const ph = `__KEEP_${++i}__`;
      kept.set(ph, m);
      return ph;
    });
  }

  // 1) Segment by preserve tags
  const segs = segmentByPreserveTags(html, cfg.preserveTags);

  // 2) Process non-preserved segments
  for (const s of segs) {
    if (s.preserve) continue;
    let chunk = s.text;

    // 2.1) Comments
    if (cfg.removeComments) {
      chunk = chunk.replace(/<!--(?!\[if|\s*<!)[\s\S]*?-->/g, '');
    }

    // 2.2) Attribute-level cleanup
    if (cfg.trimAttrWhitespace || cfg.removeEmptyAttributes || cfg.booleanAttrShortening || cfg.removeDefaultType) {
      chunk = chunk.replace(/<([A-Za-z][^\s/>]*)([^>]*)>/g, (m, tag, attrs) => {
        if (tag[0] === '/') return m; // closing tag
        const selfClose = /\s*\/\s*$/.test(attrs);
        let a = attrs || '';

        if (cfg.trimAttrWhitespace) {
          a = a.replace(/\s+/g, ' ');      // collapse runs
          a = a.replace(/\s*=\s*/g, '=');  // normalize '='
          a = a.replace(/="([^"]*)"/g, (_, v) => `="${v.trim()}"`)
               .replace(/='([^']*)'/g, (_, v) => `='${v.trim()}'`);
          a = a.trim();
        }

        if (cfg.removeEmptyAttributes) {
          // remove attr="" or attr='' or val-missing before > or />
          a = a.replace(/\s+([^\s=/>]+)=(?:""|''|\s*(?=>|\/>))/g, '');
        }

        if (cfg.booleanAttrShortening) {
          // e.g., disabled="disabled" → disabled
          a = a.replace(
            /\s+(disabled|checked|selected|readonly|required|autoplay|controls|hidden|multiple|novalidate)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,
            (m2, name) => ` ${name.toLowerCase()}`
          );
        }

        if (cfg.removeDefaultType) {
          // remove default type attributes
          a = a.replace(/\s+type=(?:"text\/javascript"|'text\/javascript')/i, '');
          a = a.replace(/\s+type=(?:"text\/css"|'text\/css')/i, '');
        }

        const attrsOut = a ? ` ${a}` : '';
        const isVoid = VOID.test(tag);
        const slash = selfClose ? '/' : '';
        // Do not invent a slash for non-self-closing non-void tags
        return `<${tag}${attrsOut}${(selfClose || isVoid) ? slash : ''}>`;
      });
    }

    // 2.3) Collapse runs inside text nodes only (guard NBSP)
    chunk = chunk.replace(/>([^<]+)</g, (m, text) => {
      if (/\u00A0/.test(text)) return m; // keep &nbsp; spacing
      const cleaned = text.replace(/\s{2,}/g, ' ').trim();
      return '>' + cleaned + '<';
    });

    // 2.4) Inter-tag whitespace logic
    if (cfg.collapseWhitespace) {
      // remove all spaces between tags
      chunk = chunk.replace(/>\s+</g, '><');

      // reinsert one space when both adjacent tags are inline-level
      chunk = chunk.replace(
        /(>)(<\/?([A-Za-z][^\s/>]*)\b[^>]*>)(<\/?([A-Za-z][^\s/>]*)\b[^>]*>)/g,
        (m, gt, t1, n1, t2, n2) => (INLINE.test(n1) && INLINE.test(n2)) ? `${gt}${t1} ${t2}` : `${gt}${t1}${t2}`
      );

      // trim text-node edges
      chunk = chunk.replace(/>\s+([^\s<])/g, '>$1').replace(/([^\s>])\s+</g, '$1<');

      // trim global edges
      chunk = chunk.replace(/^\s+|\s+$/g, '');
    }

    s.text = chunk;
  }

  // 3) Rejoin
  let out = segs.map(s => s.text).join('');

  // 4) Restore kept comments/markers
  if (kept.size) {
    for (const [ph, m] of kept) out = out.replace(ph, m);
  }

  return out;
}

// --- helpers ---

function segmentByPreserveTags(html, preserveList) {
  const PRESERVE_SET = new Set(preserveList.map(s => s.toLowerCase()));
  const out = [];
  let i = 0;
  const n = html.length;

  while (i < n) {
    const rest = html.slice(i);
    const open = rest.search(PRESERVE_RX);
    if (open === -1) {
      out.push({ preserve: false, text: rest });
      break;
    }
    const at = i + open;
    if (at > i) out.push({ preserve: false, text: html.slice(i, at) });

    // identify tag
    const tagMatch = /<\s*(pre|textarea|script|style)\b/i.exec(html.slice(at));
    if (!tagMatch) { out.push({ preserve: false, text: html.slice(at) }); break; }
    const tag = tagMatch[1].toLowerCase();
    if (!PRESERVE_SET.has(tag)) { // unexpected, treat as plain
      out.push({ preserve: false, text: html.slice(at, at + tagMatch[0].length) });
      i = at + tagMatch[0].length;
      continue;
    }

    const openEnd = html.indexOf('>', at);
    if (openEnd === -1) { out.push({ preserve: false, text: html.slice(at) }); break; }
    const closeTag = `</${tag}>`;
    const closeAt = html.toLowerCase().indexOf(closeTag, openEnd + 1);
    if (closeAt === -1) {
      out.push({ preserve: true, text: html.slice(at) }); // keep rest untouched
      break;
    }
    const preserved = html.slice(at, closeAt + closeTag.length);
    out.push({ preserve: true, text: preserved });
    i = closeAt + closeTag.length;
  }
  return out;
}

function escapeRx(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
