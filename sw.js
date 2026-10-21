// Smash Client - guarda o conversor no aparelho.
// pyodide/ nunca muda (versao fixa): sai do cache direto, sem internet.
// pagina, worker e conversor.zip: tenta a rede primeiro (pega atualizacoes) e usa o cache se estiver sem internet.
const VERSAO = 'smash-v3';
const FIXOS = 'smash-pyodide-0.26.4';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== VERSAO && k !== FIXOS) await caches.delete(k);
  await self.clients.claim();
})()));

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.includes('/pyodide/')) {
    e.respondWith((async () => {
      const c = await caches.open(FIXOS);
      const hit = await c.match(req);
      if (hit) return hit;
      const r = await fetch(req);
      if (r.ok) c.put(req, r.clone());
      return r;
    })());
    return;
  }
  e.respondWith((async () => {
    const c = await caches.open(VERSAO);
    try {
      const r = await fetch(req);
      if (r.ok) c.put(req, r.clone());
      return r;
    } catch (err) {
      const hit = await c.match(req, { ignoreSearch: true });
      if (hit) return hit;
      throw err;
    }
  })());
});
