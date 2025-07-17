const CACHE_NAME = 'kitap-planlayici-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico'
];

// Service Worker yükleme
self.addEventListener('install', (event) => {
  console.log('Service Worker: Yükleniyor...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache açıldı');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Service Worker: Cache hatası', error);
      })
  );
  self.skipWaiting();
});

// Ağ isteklerini yakalama ve cache'den sunma
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache'de varsa oradan dön
        if (response) {
          return response;
        }
        
        // Yoksa ağdan al ve cache'e ekle
        return fetch(event.request).then((response) => {
          // Geçersiz response kontrolü
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Response'u klonla (stream sadece bir kez okunabilir)
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // Offline durumda cache'den serve et
          return caches.match('/');
        });
      }
    )
  );
});

// Eski cache'leri temizleme
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Aktifleştiriliyor...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Eski cache siliniyor', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Push bildirimleri için
self.addEventListener('push', (event) => {
  console.log('Push bildirimi alındı');
  
  const options = {
    body: event.data ? event.data.text() : 'Okuma vaktiniz geldi! 📚',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'open',
        title: 'Uygulamayı Aç',
        icon: '/favicon.ico'
      },
      {
        action: 'close',
        title: 'Kapat'
      }
    ],
    requireInteraction: true,
    tag: 'reading-reminder'
  };

  event.waitUntil(
    self.registration.showNotification('Kitap Planlayıcı', options)
  );
});

// Bildirim tıklama olayları
self.addEventListener('notificationclick', (event) => {
  console.log('Bildirime tıklandı:', event.action);
  
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync için (gelecekte kullanım)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  console.log('Background sync çalışıyor');
  // Burada offline sırasında yapılan değişiklikleri senkronize edebiliriz
}