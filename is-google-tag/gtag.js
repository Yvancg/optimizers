// is-google-tag/gtag.js
// Ensures gtag or GTM snippet is async, safe, and minimal.

export function optimizeGoogleTag(input, opts = {}) {
  if (typeof input !== 'string') return '';
  const cfg = {
    anonymizeIP: true,
    transport: 'beacon',
    async: true,
    ...opts
  };

  // Extract measurement ID
  const id = input.match(/\bG-[A-Z0-9]+\b/i)?.[0];
  // Do not invent a measurement ID or treat GTM containers as GA4 tags.
  if (!id) return input;

  // Build async snippet
  const asyncAttr = cfg.async ? 'async' : 'defer';
  const params = [
    ['beacon', 'image', 'xhr'].includes(cfg.transport) ? `transport_type: '${cfg.transport}'` : '',
    cfg.anonymizeIP ? 'anonymize_ip: true' : ''
  ].filter(Boolean).join(', ');

  return `<!-- Optimized Google Tag -->
<script ${asyncAttr} src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', Date.now());
gtag('config', '${id}'${params ? ', {' + params + '}' : ''});
</script>`;
}
