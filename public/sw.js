// Service Worker for Web Push Notifications

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {
    title: "Novo Pedido Recebido!",
    body: "Um novo pedido de Decapante de Limpeza foi efetuado.",
    icon: "/produto.png",
    badge: "/produto.png",
    url: "/_authenticated/pedidos",
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || "/produto.png",
    badge: data.badge || "/favicon.ico",
    vibrate: [200, 100, 200],
    data: {
      url: data.url || "/_authenticated/pedidos",
    },
    actions: [
      { action: "open", title: "Ver Pedidos" }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) || "/_authenticated/pedidos";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes("/_authenticated/pedidos") && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
