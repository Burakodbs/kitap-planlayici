import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Service Worker kaydı - PWA için
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker başarıyla kaydedildi:', registration.scope);
        
        // Güncellemeler için kontrol
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🔄 Yeni versiyon mevcut!');
              
              // Kullanıcıya güncelleme bildirimi göster
              if (window.confirm('Yeni bir versiyon mevcut! Sayfayı yenilemek ister misiniz?')) {
                window.location.reload();
              }
            }
          });
        });
      })
      .catch((registrationError) => {
        console.log('❌ Service Worker kaydı başarısız:', registrationError);
      });
  });

  // Service Worker mesajlarını dinle
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      window.location.reload();
    }
  });
}

// PWA kurulum durumunu kontrol et
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('📱 PWA kurulum prompt\'ı hazır');
});

window.addEventListener('appinstalled', () => {
  console.log('🎉 PWA başarıyla kuruldu!');
  
  // Kurulum başarılı bildirimi
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Kitap Planlayıcı Kuruldu! 🎉', {
      body: 'Artık uygulamayı offline olarak da kullanabilirsiniz.',
      icon: '/favicon.ico'
    });
  }
});

// Online/Offline durumu izle
window.addEventListener('online', () => {
  console.log('🌐 İnternet bağlantısı geri geldi');
});

window.addEventListener('offline', () => {
  console.log('📵 Offline modda çalışıyor');
});