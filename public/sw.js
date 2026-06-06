// Service Worker — 接收推送通知
self.addEventListener('push', (event) => {
  const data = event.data?.json() || { title: '食记簿', body: '记得记录今天的美食哦 🍽️' }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/vite.svg',
      badge: '/vite.svg',
      tag: 'foodrecord-reminder',
      requireInteraction: true,
      vibrate: [200, 100, 200],
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) return client.focus()
      }
      if (clients.openWindow) return clients.openWindow('/')
    })
  )
})
