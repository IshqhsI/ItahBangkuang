// Penangan notifikasi Web Push. Dimuat ke service worker utama lewat importScripts (lihat vite.config.js).

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { isi: event.data ? event.data.text() : '' };
  }

  event.waitUntil(
    self.registration.showNotification(data.judul || 'ItahBangkuang', {
      body: data.isi || '',
      icon: '/pwa-192x192.png',
      badge: '/badge-notif.png',
      image: data.gambar || undefined,
      tag: data.tag || 'itahbangkuang',
      renotify: true,
      vibrate: [160, 80, 160, 80, 240],
      timestamp: Date.now(),
      silent: false,
      requireInteraction: Boolean(data.penting),
      actions: data.urlKonfirmasi
        ? [
            { action: 'konfirmasi', title: 'Konfirmasi' },
            { action: 'buka', title: 'Lihat pesanan' },
          ]
        : data.url
          ? [{ action: 'buka', title: 'Lihat pesanan' }]
          : [],
      data: { url: data.url || '/', urlKonfirmasi: data.urlKonfirmasi || '' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const alamat = event.action === 'konfirmasi' && data.urlKonfirmasi ? data.urlKonfirmasi : data.url || '/';
  const tujuan = new URL(alamat, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((daftar) => {
      for (const jendela of daftar) {
        if (new URL(jendela.url).origin === self.location.origin && 'focus' in jendela) {
          if ('navigate' in jendela) jendela.navigate(tujuan);
          return jendela.focus();
        }
      }
      return self.clients.openWindow(tujuan);
    }),
  );
});
