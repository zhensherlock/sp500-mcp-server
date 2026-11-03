// The outer frame is a trusted proxy. App HTML runs in an opaque-origin inner
// frame, so it cannot read the host DOM, cookies, or local storage.
const html = `<!doctype html><html><head><meta charset="utf-8"><style>html,body,iframe{margin:0;width:100%;height:100%;border:0;display:block}body{overflow:hidden}</style></head><body><script>
(() => {
  const hostOrigin = location.origin;
  let frame;
  addEventListener('message', event => {
    const message = event.data;
    if (!message || message.jsonrpc !== '2.0') return;
    if (event.source === parent && event.origin === hostOrigin) {
      if (message.method === 'ui/notifications/sandbox-resource-ready') {
        if (frame) return;
        const params = message.params || {};
        if (typeof params.html !== 'string' || typeof params.csp !== 'string') return;
        frame = document.createElement('iframe');
        frame.setAttribute('sandbox', 'allow-scripts allow-forms');
        frame.setAttribute('referrerpolicy', 'no-referrer');
        frame.title = 'Interactive company data';
        const escape = text => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
        frame.srcdoc = '<meta http-equiv="Content-Security-Policy" content="' + escape(params.csp) + '">' + params.html;
        document.body.append(frame);
      } else if (frame) frame.contentWindow.postMessage(message, '*');
    } else if (frame && event.source === frame.contentWindow) {
      parent.postMessage(message, hostOrigin);
    }
  });
  parent.postMessage({jsonrpc:'2.0', method:'ui/notifications/sandbox-proxy-ready'}, hostOrigin);
})();
</script></body></html>`

export function GET() {
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'Content-Security-Policy':
        "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; frame-src about:; frame-ancestors 'self'",
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
