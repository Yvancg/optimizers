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
  const idMatch = input.match(/id=([A-Z0-9\-]+)/i);
  const id = idMatch ? idMatch[1] : 'G-XXXXXX';

  // Build async snippet
  const asyncAttr = cfg.async ? 'async' : 'defer';
  const params = [
    cfg.transport ? `transport_type: '${cfg.transport}'` : '',
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
