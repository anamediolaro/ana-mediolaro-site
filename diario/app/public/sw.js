// Service worker: guarda só a casca do app (HTML, JS, CSS, fontes).
// Respostas da API, que carregam conteúdo clínico, nunca entram em cache.
const CACHE = 'diario-v1'

self.addEventListener('install', (evento) => {
  evento.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(['/'])))
  self.skipWaiting()
})

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((chaves) =>
        Promise.all(chaves.filter((c) => c !== CACHE).map((c) => caches.delete(c)))
      )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (evento) => {
  const url = new URL(evento.request.url)
  if (evento.request.method !== 'GET') return
  if (url.origin !== location.origin) return
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/e/')) return

  evento.respondWith(
    caches.match(evento.request).then(
      (emCache) =>
        emCache ??
        fetch(evento.request).then((resposta) => {
          if (resposta.ok) {
            const copia = resposta.clone()
            caches.open(CACHE).then((cache) => cache.put(evento.request, copia))
          }
          return resposta
        })
    )
  )
})
