import { useState, useEffect } from 'react';

export const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // PWA yükleme prompt'ı için
    const handleBeforeInstallPrompt = (e) => {
      console.log('PWA kurulum prompt\'ı yakalandı');
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // PWA yüklendikten sonra
    const handleAppInstalled = () => {
      console.log('PWA başarıyla yüklendi');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    // Zaten yüklenmiş mi kontrol et
    const checkIfInstalled = () => {
      // Standalone modda çalışıyorsa yüklenmiş demektir
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        console.log('PWA zaten kurulu (standalone mode)');
      }
      
      // iOS Safari kontrolü
      if (window.navigator.standalone === true) {
        setIsInstalled(true);
        console.log('PWA zaten kurulu (iOS)');
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    checkIfInstalled();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      console.log('Yükleme prompt\'ı mevcut değil');
      return false;
    }

    try {
      // Prompt'ı göster
      deferredPrompt.prompt();
      
      // Kullanıcının seçimini bekle
      const result = await deferredPrompt.userChoice;

      if (result.outcome === 'accepted') {
        console.log('Kullanıcı PWA yüklemeyi kabul etti');
        setDeferredPrompt(null);
        setIsInstallable(false);
        return true;
      } else {
        console.log('Kullanıcı PWA yüklemeyi reddetti');
        return false;
      }
    } catch (error) {
      console.error('PWA yükleme hatası:', error);
      return false;
    }
  };

  const getInstallInstructions = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    if (isIOS && isSafari) {
      return 'Safari\'de Share tuşuna basın ve "Add to Home Screen" seçin';
    } else if (isAndroid) {
      return 'Chrome menüsünden "Add to Home screen" seçin';
    } else {
      return 'Tarayıcınızın adres çubuğunda kurulum ikonuna tıklayın';
    }
  };

  const canInstall = () => {
    return deferredPrompt !== null || !isInstalled;
  };

  return { 
    isInstallable, 
    isInstalled, 
    installApp, 
    getInstallInstructions,
    canInstall
  };
};