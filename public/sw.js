// Service Worker para TWA (Trusted Web Activity)
// Necessario para que o Chrome reconheca o site como PWA
// Com tratamento de erros para evitar crash offline no Android

const CACHE_NAME = 'bl-portal-v2';
const OFFLINE_URL = '/offline.html';
const PRECACHE_URLS = [
  '/',
  '/offline.html',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.svg'
];

// Install: pre-cache recursos essenciais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch(() => {
        // Se falhar o pre-cache, continua sem ele
        console.warn('SW: Pre-cache parcial');
      });
    })
  );
  self.skipWaiting();
});

// Activate: limpar caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names.filter((name) => name !== CACHE_NAME)
             .map((name) => caches.delete(name))
      );
    })
  );
  event.waitUntil(clients.claim());
});

// Fetch: network-first com fallback para cache e pagina offline
self.addEventListener('fetch', (event) => {
  // Ignorar requests que nao sao GET
  if (event.request.method !== 'GET') return;

  // Ignorar requests para APIs externas (Supabase, etc)
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache a resposta valida para uso futuro
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        // Rede falhou: tentar cache
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // Sem cache: mostrar pagina offline para navegacao
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL).then((offline) => {
              return offline || new Response(
                '<html><body style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;background:#16213e;color:#fff;text-align:center;padding:20px"><div><h1>Sem conexao</h1><p>Verifique sua internet e tente novamente.</p></div></body></html>',
                { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
              );
            });
          }
          // Para outros recursos, retornar erro silencioso
          return new Response('', { status: 503 });
        });
      })
  );
});
