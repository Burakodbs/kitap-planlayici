import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const usePWA = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if app is already installed (standalone mode)
  useEffect(() => {
    const checkInstallation = () => {
      // Check if running in standalone mode
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      
      // Check if running as PWA on iOS
      const isIOSPWA = 'standalone' in window.navigator && (window.navigator as any).standalone === true;
      
      // Check if running as PWA on Android/Chrome
      const isAndroidPWA = window.matchMedia('(display-mode: standalone)').matches;
      
      setIsInstalled(isStandalone || isIOSPWA || isAndroidPWA);
    };

    checkInstallation();

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsInstalled(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  // Listen for beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      
      const beforeInstallPromptEvent = e as BeforeInstallPromptEvent;
      setInstallPrompt(beforeInstallPromptEvent);
      setIsInstallable(true);
      
      // eslint-disable-next-line no-console
      console.log('PWA install prompt available');
    };

    const handleAppInstalled = () => {
      // eslint-disable-next-line no-console
      console.log('PWA was installed');
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = useCallback(async () => {
    if (!installPrompt) {
      setError('Install prompt not available');
      return;
    }

    try {
      await installPrompt.prompt();
      const result = await installPrompt.userChoice;
      
      // eslint-disable-next-line no-console
      console.log('Install prompt result:', result);
      
      if (result.outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
        setInstallPrompt(null);
      }
    } catch (err) {
      console.error('Error during installation:', err);
      setError(err instanceof Error ? err.message : 'Installation failed');
    }
  }, [installPrompt]);

  const getInstallInstructions = useCallback((): string => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      return 'Safari\'de Share düğmesine basın ve "Ana Ekrana Ekle" seçin';
    } else if (userAgent.includes('android')) {
      if (userAgent.includes('chrome')) {
        return 'Chrome menüsünden "Ana ekrana ekle" seçin';
      } else if (userAgent.includes('firefox')) {
        return 'Firefox menüsünden "Ana sayfaya yükle" seçin';
      }
      return 'Tarayıcı menüsünden "Ana ekrana ekle" seçin';
    } else if (userAgent.includes('chrome')) {
      return 'Adres çubuğundaki kur simgesine tıklayın veya menüden "Yükle" seçin';
    } else if (userAgent.includes('firefox')) {
      return 'Adres çubuğundaki ev simgesine tıklayın';
    } else if (userAgent.includes('edge')) {
      return 'Menüden "Uygulamalar" → "Bu siteyi uygulama olarak yükle" seçin';
    }
    
    return 'Tarayıcınızın menüsünden "Ana ekrana ekle" veya "Yükle" seçeneğini arayın';
  }, []);

  const canInstall = useCallback((): boolean => {
    // Check if PWA installation is supported
    return 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window;
  }, []);

  const isServiceWorkerSupported = useCallback((): boolean => {
    return 'serviceWorker' in navigator;
  }, []);

  const registerServiceWorker = useCallback(async () => {
    if (!isServiceWorkerSupported()) {
      console.warn('Service Worker not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      // eslint-disable-next-line no-console
      console.log('Service Worker registered successfully:', registration);

      registration.addEventListener('updatefound', () => {
        // eslint-disable-next-line no-console
        console.log('New service worker version available');
      });

      return registration;
    } catch (err) {
      console.error('Service Worker registration failed:', err);
      setError(err instanceof Error ? err.message : 'Service Worker registration failed');
    }
  }, [isServiceWorkerSupported]);

  // Register service worker on mount
  useEffect(() => {
    registerServiceWorker();
  }, [registerServiceWorker]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getDebugInfo = useCallback(() => {
    return {
      isInstallable,
      isInstalled,
      hasInstallPrompt: !!installPrompt,
      canInstall: canInstall(),
      serviceWorkerSupported: isServiceWorkerSupported(),
      userAgent: navigator.userAgent,
      displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser',
      error,
    };
  }, [isInstallable, isInstalled, installPrompt, canInstall, isServiceWorkerSupported, error]);

  return {
    isInstallable,
    isInstalled,
    installApp,
    getInstallInstructions,
    canInstall,
    isServiceWorkerSupported,
    registerServiceWorker,
    error,
    clearError,
    getDebugInfo,
  };
};