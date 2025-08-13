self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener('push', event => {
  let data = {};
  try { data = event.data.json(); } catch (e) {}
  const title = data.title || 'Agent Match';
  const body = data.body || 'New property match';
  const url = data.url || '/';
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      data: { url },
      icon: undefined,
      badge: undefined
    })
  );
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification?.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
