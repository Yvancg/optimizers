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

// Single regex reused for preserve segmentation
const PRESERVE_RX = /<(pre|textarea|script|style)\b/i;

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

  // 1) Segment by preserve tags
  const segs = segmentByPreserveTags(html, htmlLower, cfg.preserveTags);

  // 2) Process non-preserved segments
  for (const s of segs) {
    if (s.preserve) continue;
    let chunk = s.text;

    // 2.1) Comments
    if (cfg.removeComments) {
      // avoid conditional comments / downlevel-revealed hacks
      chunk = chunk.replace(/<!--(?!\[if|\s*<!)[\s\S]*?-->/g, '');
    }

    // 2.2) Attribute-level cleanup
    if (cfg.trimAttrWhitespace || cfg.removeEmptyAttributes || cfg.booleanAttrShortening || cfg.removeDefaultType) {
      chunk = chunk.replace(/<([A-Za-z][^\s/>]*)([^>]*)>/g, (m, tag, attrs) => {
        // closing tag: leave untouched
        if (tag[0] === '/') return m;

        const tagLower = tag.toLowerCase();
        const selfClose = /\s*\/\s*$/.test(attrs);
        let a = attrs || '';

        if (cfg.trimAttrWhitespace) {
          // collapse spaces and normalize equals
          a = a.replace(/\s+/g, ' ');
          a = a.replace(/\s*=\s*/g, '=');
          // trim quoted attribute values
          a = a.replace(/="([^"]*)"/g, (_, v) => `="${v.trim()}"`)
               .replace(/='([^']*)'/g, (_, v) => `='${v.trim()}'`);
          a = a.trim();
        }

        if (cfg.removeEmptyAttributes) {
          // remove attr="" or attr='' or missing value
          a = a.replace(/\s+([^\s=/>]+)=(?:""|''|\s*(?=>|\/>))/g, '');
        }

        if (cfg.booleanAttrShortening) {
          a = a.replace(
            /\s+(disabled|checked|selected|readonly|required|autoplay|controls|hidden|multiple|novalidate)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,
            (m2, name) => ` ${name.toLowerCase()}`
          );
        }

        if (cfg.removeDefaultType) {
          a = a.replace(/\s+type=(?:"text\/javascript"|'text\/javascript')/i, '');
          a = a.replace(/\s+type=(?:"text\/css"|'text\/css')/i, '');
        }

        const attrsOut = a ? ` ${a}` : '';
        const isVoid = VOID_TAGS.has(tagLower);
        const slash = (selfClose || isVoid) ? '/' : '';
        return `<${tag}${attrsOut}${slash}>`;
      });
    }

    // 2.3) Collapse runs inside text nodes only (guard NBSP)
    chunk = chunk.replace(/>([^<]+)</g, (m, text) => {
      if (text.indexOf('\u00A0') !== -1) return m; // keep &nbsp; spacing
      // collapse 2+ whitespace to single, then trim
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
        (m, gt, t1, n1, t2, n2) => {
          const n1Lower = n1.toLowerCase();
          const n2Lower = n2.toLowerCase();
          return (INLINE_TAGS.has(n1Lower) && INLINE_TAGS.has(n2Lower))
            ? `${gt}${t1} ${t2}`
            : `${gt}${t1}${t2}`;
        }
      );

      // trim text-node edges
      chunk = chunk.replace(/>\s+([^\s<])/g, '>$1')
                   .replace(/([^\s>])\s+</g, '$1<');

      // trim global edges
      chunk = chunk.replace(/^\s+|\s+$/g, '');
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
  let i = 0;
  const n = html.length;

  while (i < n) {
    const restLower = htmlLower.slice(i);
    const open = restLower.search(PRESERVE_RX);
    if (open === -1) {
      out.push({ preserve: false, text: html.slice(i) });
      break;
    }

    const at = i + open;
    if (at > i) {
      out.push({ preserve: false, text: html.slice(i, at) });
    }

    const sliceLower = htmlLower.slice(at);
    const tagMatch = /<\s*(pre|textarea|script|style)\b/i.exec(sliceLower);
    if (!tagMatch) {
      out.push({ preserve: false, text: html.slice(at) });
      break;
    }

    const tag = tagMatch[1].toLowerCase();
    const tagOpenLen = tagMatch[0].length;

    if (!PRESERVE_SET.has(tag)) {
      out.push({ preserve: false, text: html.slice(at, at + tagOpenLen) });
      i = at + tagOpenLen;
      continue;
    }

    const openEnd = html.indexOf('>', at);
    if (openEnd === -1) {
      out.push({ preserve: false, text: html.slice(at) });
      break;
    }

    const closeTag = `</${tag}>`;
    const closeAt = htmlLower.indexOf(closeTag, openEnd + 1);
    if (closeAt === -1) {
      out.push({ preserve: true, text: html.slice(at) });
      break;
    }

    const end = closeAt + closeTag.length;
    out.push({ preserve: true, text: html.slice(at, end) });
    i = end;
  }

  return out;
}

function escapeRx(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
