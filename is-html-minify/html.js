// is-html-minify/html.js
// Safe HTML minifier: removes comments, collapses whitespace,
// trims attributes, and preserves <pre|textarea|script|style> content.
// No DOM parsing. O(n) segmentation + linear regex passes on safe regions.

const DEFAULT_PRESERVE = ['pre', 'textarea', 'script', 'style'];

// Precomputed tag sets for faster lookup than regex
const VOID_TAGS = new Set([
  'area','base','br','col','embed','hr','img','input','link',
  'meta','param','source','track','wbr'
]);
const INLINE_TAGS = new Set([
  'a','abbr','b','bdi','bdo','cite','code','data','dfn','em','i','kbd',
  'label','mark','q','rp','rt','rtc','ruby','s','samp','small','span',
  'strong','sub','sup','time','u','var'
]);

// Shared regexes (compiled once)
const PRESERVE_OPEN_RX = /<(pre|textarea|script|style)\b/gi;
const COMMENT_RX       = /<!--(?!\[if|\s*<!)[\s\S]*?-->/g;
const TAG_ATTR_RX      = /<([A-Za-z][^\s/>]*)([^>]*)>/g;
const BETWEEN_TAGS_RX  = />([^<]+)</g;
const INTERTAG_WS_RX   = />\s+</g;
const EDGE_WS_RX       = /^\s+|\s+$/g;
const TRIM_EQ_RX       = /\s*=\s*/g;
const MULTISPACE_RX    = /\s+/g;
const TRIM_DQUOT_RX    = /="([^"]*)"/g;
const TRIM_SQUOT_RX    = /='([^']*)'/g;
const EMPTY_ATTR_RX    = /\s+([^\s=/>]+)=(?:""|''|\s*(?=>|\/>))/g;
const BOOL_ATTR_RX     = /\s+(disabled|checked|selected|readonly|required|autoplay|controls|hidden|multiple|novalidate)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const TYPE_JS_RX       = /\s+type=(?:"text\/javascript"|'text\/javascript')/i;
const TYPE_CSS_RX      = /\s+type=(?:"text\/css"|'text\/css')/i;

// Lowercase-only regex for preserve detection in lowercased HTML
const PRESERVE_SCAN_RX = /<(pre|textarea|script|style)\b/g;

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

  // Precompute lowercased HTML once for case-insensitive operations
  const htmlLower = html.toLowerCase();

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

  // 1) Segment by preserve tags (single pass with global regex)
  const segs = segmentByPreserveTags(html, htmlLower, cfg.preserveTags);

  // 2) Process non-preserved segments
  for (const s of segs) {
    if (s.preserve) continue;
    let chunk = s.text;

    // 2.1) Comments
    if (cfg.removeComments) {
      chunk = chunk.replace(COMMENT_RX, '');
    }

    // 2.2) Attribute-level cleanup
    if (cfg.trimAttrWhitespace || cfg.removeEmptyAttributes || cfg.booleanAttrShortening || cfg.removeDefaultType) {
      chunk = chunk.replace(TAG_ATTR_RX, (m, tag, attrs) => {
        // closing tag: leave untouched
        if (tag[0] === '/') return m;

        const tagLower = tag.toLowerCase();
        const selfClose = /\s*\/\s*$/.test(attrs);
        let a = attrs || '';

        if (cfg.trimAttrWhitespace) {
          // collapse spaces and normalize equals
          a = a.replace(MULTISPACE_RX, ' ');
          a = a.replace(TRIM_EQ_RX, '=');
          // trim quoted attribute values
          a = a
            .replace(TRIM_DQUOT_RX, (_, v) => `="${v.trim()}"`)
            .replace(TRIM_SQUOT_RX, (_, v) => `='${v.trim()}'`);
          a = a.trim();
        }

        if (cfg.removeEmptyAttributes) {
          a = a.replace(EMPTY_ATTR_RX, '');
        }

        if (cfg.booleanAttrShortening) {
          a = a.replace(BOOL_ATTR_RX, (m2, name) => ` ${name.toLowerCase()}`);
        }

        if (cfg.removeDefaultType) {
          a = a.replace(TYPE_JS_RX, '');
          a = a.replace(TYPE_CSS_RX, '');
        }

        const attrsOut = a ? ` ${a}` : '';
        const isVoid = VOID_TAGS.has(tagLower);
        const slash = (selfClose || isVoid) ? '/' : '';
        return `<${tag}${attrsOut}${slash}>`;
      });
    }

    // 2.3) Collapse runs inside text nodes only (guard NBSP)
    chunk = chunk.replace(BETWEEN_TAGS_RX, (m, text) => {
      if (text.indexOf('\u00A0') !== -1) return m;
      const cleaned = text.length > 1
        ? text.replace(/\s{2,}/g, ' ').trim()
        : text.trim();
      return '>' + cleaned + '<';
    });

    // 2.4) Inter-tag whitespace logic
    if (cfg.collapseWhitespace) {
      // remove all spaces between tags
      chunk = chunk.replace(INTERTAG_WS_RX, '><');

      // reinsert one space when both adjacent tags are inline-level
      chunk = chunk.replace(
        /(>)(<\/?([A-Za-z][^\s/>]*)\b[^>]*>)(<\/?([A-Za-z][^\s/>]*)\b[^>]*>)/g,
        (m, gt, t1, n1, t2, n2) => {
          const n1Lower = n1.toLowerCase();
          const n2Lower = n2.toLowerCase();
          return (INLINE_TAGS.has(n1Lower) && INLINE_TAGS.has(n2Lower))
            ? `${gt}${t1} ${t2}`
            : `${gt}${t1}${t2}`;
        }
      );

      // trim text-node edges
      chunk = chunk
        .replace(/>\s+([^\s<])/g, '>$1')
        .replace(/([^\s>])\s+</g, '$1<');

      // trim global edges
      chunk = chunk.replace(EDGE_WS_RX, '');
    }

    s.text = chunk;
  }

  // 3) Rejoin
  let out = segs.length === 1 ? segs[0].text : segs.map(s => s.text).join('');

  // 4) Restore kept comments/markers
  if (kept.size) {
    for (const [ph, m] of kept) out = out.replace(ph, m);
  }

  return out;
}

// --- helpers ---

function segmentByPreserveTags(html, htmlLower, preserveList) {
  const PRESERVE_SET = new Set(preserveList.map(s => s.toLowerCase()));
  const out = [];
  const n = html.length;

  let lastIndex = 0;
  PRESERVE_SCAN_RX.lastIndex = 0; // reset global regex

  let match;
  while ((match = PRESERVE_SCAN_RX.exec(htmlLower)) !== null) {
    const openIdx = match.index;
    const tag = match[1]; // already lowercased by htmlLower

    // push preceding non-preserved text
    if (openIdx > lastIndex) {
      out.push({ preserve: false, text: html.slice(lastIndex, openIdx) });
    }

    // if tag not in preserve set, treat this as normal text up to the tag end
    if (!PRESERVE_SET.has(tag)) {
      const gtIdx = html.indexOf('>', openIdx);
      if (gtIdx === -1) {
        out.push({ preserve: false, text: html.slice(openIdx) });
        lastIndex = n;
        break;
      }
      out.push({ preserve: false, text: html.slice(openIdx, gtIdx + 1) });
      lastIndex = gtIdx + 1;
      continue;
    }

    // find closing tag
    const openEnd = html.indexOf('>', openIdx);
    if (openEnd === -1) {
      out.push({ preserve: true, text: html.slice(openIdx) });
      lastIndex = n;
      break;
    }

    const closeTag = `</${tag}>`;
    const closeAt = htmlLower.indexOf(closeTag, openEnd + 1);
    if (closeAt === -1) {
      out.push({ preserve: true, text: html.slice(openIdx) });
      lastIndex = n;
      break;
    }

    const end = closeAt + closeTag.length;
    out.push({ preserve: true, text: html.slice(openIdx, end) });
    lastIndex = end;

    // move regex cursor to end to avoid rescanning
    PRESERVE_SCAN_RX.lastIndex = end;
  }

  if (lastIndex < n) {
    out.push({ preserve: false, text: html.slice(lastIndex) });
  }

  return out;
}

function escapeRx(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
