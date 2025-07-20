import { NotificationPermission } from '../types';
import { NOTIFICATION_CONFIG } from '../constants';

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
}

class NotificationService {
  private timeoutId: NodeJS.Timeout | null = null;

  isSupported(): boolean {
    return 'Notification' in window;
  }

  getCurrentPermission(): NotificationPermission {
    if (!this.isSupported()) {
      return 'denied';
    }
    return Notification.permission as NotificationPermission;
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error('Notifications are not supported in this browser');
    }

    if (this.getCurrentPermission() === 'granted') {
      return 'granted';
    }

    if (this.getCurrentPermission() === 'denied') {
      throw new Error('Notifications are blocked. Please enable them in browser settings.');
    }

    try {
      const permission = await Notification.requestPermission();
      return permission as NotificationPermission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      throw new Error('Failed to request notification permission');
    }
  }

  show(options: NotificationOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        reject(new Error('Notifications are not supported'));
        return;
      }

      if (this.getCurrentPermission() !== 'granted') {
        reject(new Error('Notification permission not granted'));
        return;
      }

      try {
        const notification = new Notification(options.title, {
          body: options.body,
          icon: options.icon || '/favicon.ico',
          tag: options.tag,
          requireInteraction: options.requireInteraction || false,
          silent: options.silent || false,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        notification.onerror = (error) => {
          console.error('Notification error:', error);
          reject(error);
        };

        notification.onshow = () => {
          resolve();
        };

        // Auto-close after 5 seconds unless requireInteraction is true
        if (!options.requireInteraction) {
          setTimeout(() => {
            notification.close();
          }, 5000);
        }

      } catch (error) {
        console.error('Error creating notification:', error);
        reject(error);
      }
    });
  }

  showWelcome(): Promise<void> {
    return this.show({
      title: 'Kitap Planlayıcı Bildirimleri Aktif! 📚',
      body: 'Artık günlük okuma hatırlatıcıları alacaksınız.',
      tag: NOTIFICATION_CONFIG.WELCOME_TAG,
    });
  }

  showTest(): Promise<void> {
    return this.show({
      title: 'Test Bildirimi 🧪',
      body: 'Bildirimler düzgün çalışıyor! Okuma vaktiniz geldiğinde hatırlatacağız.',
      tag: NOTIFICATION_CONFIG.TEST_TAG,
    });
  }

  showDailyReminder(dailyPagesTarget: number): Promise<void> {
    return this.show({
      title: 'Günlük Okuma Zamanı! 📚',
      body: `Bugün ${dailyPagesTarget} sayfa okuma hedefiniz var. Hangi kitabınızı okuyacaksınız?`,
      tag: NOTIFICATION_CONFIG.DAILY_REMINDER_TAG,
      requireInteraction: true,
    });
  }

  scheduleDailyReminder(dailyPagesTarget: number, enabled: boolean): void {
    // Clear existing timeout
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (!enabled || this.getCurrentPermission() !== 'granted') {
      return;
    }

    const scheduleNext = () => {
      const now = new Date();
      const target = new Date(now);
      target.setHours(
        NOTIFICATION_CONFIG.DAILY_REMINDER_HOUR,
        NOTIFICATION_CONFIG.DAILY_REMINDER_MINUTE,
        0,
        0
      );

      // If today's reminder time has passed, schedule for tomorrow
      if (target <= now) {
        target.setDate(target.getDate() + 1);
      }

      const timeout = target.getTime() - now.getTime();

      this.timeoutId = setTimeout(async () => {
        try {
          await this.showDailyReminder(dailyPagesTarget);
        } catch (error) {
          console.error('Error showing daily reminder:', error);
        }

        // Schedule next reminder
        scheduleNext();
      }, timeout);

      // eslint-disable-next-line no-console
      console.log(`Next reading reminder scheduled for: ${target.toLocaleString('tr-TR')}`);
    };

    scheduleNext();
  }

  cancelScheduledReminder(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
      // eslint-disable-next-line no-console
      console.log('Scheduled reminder cancelled');
    }
  }

  getPermissionInstructions(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      return 'Safari\'de Share tuşuna basın ve "Add to Home Screen" seçin';
    } else if (userAgent.includes('android')) {
      return 'Chrome menüsünden "Add to Home screen" seçin';
    } else if (userAgent.includes('chrome')) {
      return 'Adres çubuğundaki kilit ikonuna tıklayın → Bildirimler → İzin Ver';
    } else if (userAgent.includes('firefox')) {
      return 'Adres çubuğundaki kalkan ikonuna tıklayın → İzinler → Bildirimler';
    } else if (userAgent.includes('safari')) {
      return 'Safari → Tercihler → Web Siteleri → Bildirimler';
    } else {
      return 'Tarayıcınızın ayarlarından bildirim izni verin';
    }
  }

  isHttpsOrLocalhost(): boolean {
    return window.location.protocol === 'https:' || 
           window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1';
  }

  getDebugInfo() {
    return {
      supported: this.isSupported(),
      permission: this.getCurrentPermission(),
      httpsOrLocalhost: this.isHttpsOrLocalhost(),
      serviceWorkerSupported: 'serviceWorker' in navigator,
      userAgent: navigator.userAgent,
    };
  }
}

export const notificationService = new NotificationService();