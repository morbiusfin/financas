/* Service Worker — network-first (sempre busca a versão nova; cache só offline) */
const CACHE = "financas-v82";
const ASSETS = [
  "./", "./index.html",
  "./css/styles.css",
  "./js/data.js", "./js/app.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png", "./icons/icon-512.png",
  "https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE && k !== "fin-meta").map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  const sameOrigin = url.origin === self.location.origin;

  if (sameOrigin) {
    // network-first: pega a versão mais nova; se offline, usa cache
    e.respondWith(
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(e.request).then(hit => hit || caches.match("./index.html")))
    );
  } else {
    // CDN (Chart.js versionado): cache-first
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    })));
  }
});
self.addEventListener("message", (e) => { if (e.data === "skipWaiting") self.skipWaiting(); });

/* ---- Web Push ---- */
self.addEventListener("push", (e) => {
  e.waitUntil((async () => {
    // título = nome do app; corpo = só o nome da conta mais perto de vencer
    let title = "MorbiusFin", body = "Você tem uma conta perto de vencer.";
    try { if (e.data) { const d = e.data.json(); if (d.title) title = d.title; if (d.body) body = d.body; } } catch (err) {}
    // se o app salvou o nome da conta mais próxima, usa ele
    try {
      const c = await caches.open("fin-meta");
      const r = await c.match("/next-bill");
      if (r) { const nb = await r.json(); if (nb && nb.name) body = nb.name; }
    } catch (err) {}
    await self.registration.showNotification(title, {
      body, icon: "icons/icon-192.png", badge: "icons/icon-192.png",
      tag: "contas", renotify: true, data: { url: "./index.html" }
    });
  })());
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "./index.html";
  e.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    for (const c of list) { if ("focus" in c) return c.focus(); }
    if (clients.openWindow) return clients.openWindow(url);
  }));
});
