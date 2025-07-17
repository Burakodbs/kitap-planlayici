import { useState, useEffect, useCallback } from 'react';
import { NotificationPermission } from '../types';
import { notificationService } from '../services/notificationService';
import { storageService } from '../services/storageService';

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize notification state
  useEffect(() => {
    const currentPermission = notificationService.getCurrentPermission();
    setPermission(currentPermission);
    
    const savedSettings = storageService.getNotificationSettings();
    setEnabled(savedSettings && currentPermission === 'granted');
  }, []);

  // Schedule daily reminders when enabled
  useEffect(() => {
    if (enabled && permission === 'granted') {
      // Get daily page target from goals
      const goals = storageService.getGoals();
      const dailyPagesTarget = Math.ceil(goals.weekly.pages / 7);
      
      notificationService.scheduleDailyReminder(dailyPagesTarget, true);
    } else {
      notificationService.cancelScheduledReminder();
    }

    return () => {
      notificationService.cancelScheduledReminder();
    };
  }, [enabled, permission]);

  const requestPermission = useCallback(async () => {
    if (!notificationService.isSupported()) {
      setError('Bu tarayıcı bildirimleri desteklemiyor!');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newPermission = await notificationService.requestPermission();
      setPermission(newPermission);
      
      if (newPermission === 'granted') {
        setEnabled(true);
        storageService.saveNotificationSettings(true);
        
        // Show welcome notification
        try {
          await notificationService.showWelcome();
        } catch (welcomeError) {
          console.warn('Could not show welcome notification:', welcomeError);
        }
      } else {
        setError('Bildirim izni reddedildi. Tarayıcı ayarlarından manuel olarak açabilirsiniz.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bildirim izni alınırken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleNotifications = useCallback((newEnabled: boolean) => {
    if (permission !== 'granted') {
      setError('Önce bildirim izni vermeniz gerekiyor!');
      return;
    }

    setEnabled(newEnabled);
    storageService.saveNotificationSettings(newEnabled);
    
    if (newEnabled) {
      const goals = storageService.getGoals();
      const dailyPagesTarget = Math.ceil(goals.weekly.pages / 7);
      notificationService.scheduleDailyReminder(dailyPagesTarget, true);
    } else {
      notificationService.cancelScheduledReminder();
    }
  }, [permission]);

  const sendTestNotification = useCallback(async () => {
    if (permission !== 'granted') {
      setError('Bildirim izni verilmemiş!');
      return;
    }

    setError(null);

    try {
      await notificationService.showTest();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test bildirimi gönderilemedi');
    }
  }, [permission]);

  const sendDailyReminder = useCallback(async (dailyPagesTarget: number) => {
    if (permission !== 'granted' || !enabled) {
      return;
    }

    try {
      await notificationService.showDailyReminder(dailyPagesTarget);
    } catch (err) {
      console.error('Daily reminder failed:', err);
    }
  }, [permission, enabled]);

  const getPermissionInstructions = useCallback(() => {
    return notificationService.getPermissionInstructions();
  }, []);

  const getDebugInfo = useCallback(() => {
    return {
      ...notificationService.getDebugInfo(),
      enabled,
      error,
      loading,
    };
  }, [enabled, error, loading]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    permission,
    enabled,
    error,
    loading,
    requestPermission,
    toggleNotifications,
    sendTestNotification,
    sendDailyReminder,
    getPermissionInstructions,
    getDebugInfo,
    clearError,
  };
};