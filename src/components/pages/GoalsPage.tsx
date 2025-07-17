import React, { useState } from 'react';
import { Download, CheckCircle, Bell, Edit, Settings, Smartphone, Globe, AlertTriangle } from 'lucide-react';
import { Goals, NotificationPermission } from '../../types';
import { Modal } from '../ui/Modal';
import { InlineSpinner } from '../ui/LoadingSpinner';
import { calculateProgress } from '../../utils';

interface GoalsPageProps {
  goals: Goals;
  onUpdateGoals: (goals: Partial<Goals>) => void;
  isInstallable: boolean;
  isInstalled: boolean;
  onInstallApp: () => void;
  getInstallInstructions: () => string;
  notificationPermission: NotificationPermission;
  notificationsEnabled: boolean;
  onRequestNotificationPermission: () => void;
  onToggleNotifications: (enabled: boolean) => void;
  onSendTestNotification: () => void;
  showToast: (message: string) => void;
}

export const GoalsPage: React.FC<GoalsPageProps> = ({
  goals,
  onUpdateGoals,
  isInstallable,
  isInstalled,
  onInstallApp,
  getInstallInstructions,
  notificationPermission,
  notificationsEnabled,
  onRequestNotificationPermission,
  onToggleNotifications,
  onSendTestNotification,
  showToast,
}) => {
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoals, setEditingGoals] = useState<Goals>(goals);
  const [loading, setLoading] = useState(false);

  // Mock current progress - in real app this would come from actual reading data
  const currentProgress = {
    monthlyBooks: 1,
    monthlyPages: 320,
    weeklyBooks: 0,
    weeklyPages: 80,
  };

  const handleEditGoals = () => {
    setEditingGoals(goals);
    setShowGoalForm(true);
  };

  const handleSaveGoals = () => {
    setLoading(true);
    
    // Validation
    if (editingGoals.monthly.books <= 0 || editingGoals.monthly.pages <= 0 ||
        editingGoals.weekly.books <= 0 || editingGoals.weekly.pages <= 0) {
      showToast('Hedefler pozitif sayılar olmalıdır');
      setLoading(false);
      return;
    }

    if (editingGoals.weekly.books > editingGoals.monthly.books ||
        editingGoals.weekly.pages > editingGoals.monthly.pages) {
      showToast('Haftalık hedefler aylık hedeflerden büyük olamaz');
      setLoading(false);
      return;
    }

    try {
      onUpdateGoals(editingGoals);
      setShowGoalForm(false);
      showToast('Hedefler başarıyla güncellendi!');
    } catch (error) {
      showToast('Hedefler güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleInstallApp = async () => {
    try {
      await onInstallApp();
      showToast('Uygulama başarıyla kuruldu!');
    } catch (error) {
      showToast('Uygulama kurulurken bir hata oluştu');
    }
  };

  const handleRequestNotifications = async () => {
    try {
      await onRequestNotificationPermission();
      if (notificationPermission === 'granted') {
        showToast('Bildirim izni verildi!');
      }
    } catch (error) {
      showToast('Bildirim izni alınırken bir hata oluştu');
    }
  };

  const handleTestNotification = async () => {
    try {
      await onSendTestNotification();
      showToast('Test bildirimi gönderildi!');
    } catch (error) {
      showToast('Test bildirimi gönderilemedi');
    }
  };

  const GoalCard: React.FC<{
    title: string;
    current: number;
    target: number;
    unit: string;
    color: string;
    period: string;
  }> = ({ title, current, target, unit, color, period }) => {
    const progress = calculateProgress(current, target);
    const isAchieved = current >= target;
    
    return (
      <div className="bg-white p-4 sm:p-6 rounded-lg border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
          <span className="text-xs sm:text-sm text-gray-500">{period}</span>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl sm:text-3xl font-bold">{current}</span>
            <span className="text-sm text-gray-600">/ {target} {unit}</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>İlerleme</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="bg-gray-200 rounded-full h-2 sm:h-3">
              <div 
                className={`h-2 sm:h-3 rounded-full transition-all duration-300 ${color}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          {isAchieved ? (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="h-4 w-4" />
              Hedef tamamlandı! 🎉
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              {target - current} {unit} daha gerekiyor
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold">Hedeflerim</h2>
          <p className="text-sm text-gray-600">Okuma hedeflerinizi belirleyin ve takip edin</p>
        </div>
        <button
          onClick={handleEditGoals}
          className="bg-blue-600 text-white px-4 py-3 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto flex items-center justify-center gap-2"
        >
          <Edit className="h-4 w-4" />
          Hedefleri Düzenle
        </button>
      </div>

      {/* Goals Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <GoalCard
          title="Aylık Kitap Hedefi"
          current={currentProgress.monthlyBooks}
          target={goals.monthly.books}
          unit="kitap"
          color="bg-blue-500"
          period="Bu ay"
        />
        
        <GoalCard
          title="Aylık Sayfa Hedefi"
          current={currentProgress.monthlyPages}
          target={goals.monthly.pages}
          unit="sayfa"
          color="bg-green-500"
          period="Bu ay"
        />
        
        <GoalCard
          title="Haftalık Kitap Hedefi"
          current={currentProgress.weeklyBooks}
          target={goals.weekly.books}
          unit="kitap"
          color="bg-purple-500"
          period="Bu hafta"
        />
        
        <GoalCard
          title="Haftalık Sayfa Hedefi"
          current={currentProgress.weeklyPages}
          target={goals.weekly.pages}
          unit="sayfa"
          color="bg-orange-500"
          period="Bu hafta"
        />
      </div>

      {/* PWA Installation */}
      <div className="bg-white p-4 sm:p-6 rounded-lg border">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Smartphone className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold">Mobil Uygulama Kurulumu</h3>
            <p className="text-sm text-gray-600">Uygulamayı cihazınıza kurun ve offline kullanın</p>
          </div>
        </div>

        <div className="space-y-4">
          {isInstalled ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Uygulama başarıyla kuruldu!</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Artık uygulamayı offline olarak da kullanabilir, ana ekrandan hızlıca erişebilirsiniz.
              </p>
            </div>
          ) : isInstallable ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="font-medium text-blue-900">Uygulamayı cihazınıza kurun</p>
                  <p className="text-sm text-blue-700">
                    Native uygulama deneyimi ve offline erişim
                  </p>
                </div>
                <button
                  onClick={handleInstallApp}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  <Download className="h-4 w-4" />
                  Şimdi Kur
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Manuel Kurulum</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {getInstallInstructions()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* PWA Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-xs font-medium text-gray-900">Offline Çalışma</p>
              <p className="text-xs text-gray-600">İnternet olmadan kullanın</p>
            </div>
            
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Smartphone className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-xs font-medium text-gray-900">Native Deneyim</p>
              <p className="text-xs text-gray-600">Uygulama gibi hissettirin</p>
            </div>
            
            <div className="text-center">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Bell className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-xs font-medium text-gray-900">Push Bildirimler</p>
              <p className="text-xs text-gray-600">Hatırlatıcılar alın</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white p-4 sm:p-6 rounded-lg border">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Bell className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold">Bildirim Ayarları</h3>
            <p className="text-sm text-gray-600">Günlük okuma hatırlatıcılarını yönetin</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Current Status */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Günlük Okuma Hatırlatıcıları</span>
                {notificationPermission === 'granted' && notificationsEnabled && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Aktif</span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {notificationPermission === 'granted' ? 
                  notificationsEnabled ? 
                    'Her gün saat 20:00\'da bildirim alacaksınız' :
                    'Bildirim izni var ama hatırlatıcılar kapalı' :
                  notificationPermission === 'denied' ?
                    'Bildirimler engellendi - Tarayıcı ayarlarından açabilirsiniz' :
                    'Bildirim izni verilmedi'
                }
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {notificationPermission !== 'granted' && (
                <button
                  onClick={handleRequestNotifications}
                  className="bg-orange-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-orange-700 transition-colors flex items-center gap-1"
                >
                  <Bell className="h-4 w-4" />
                  İzin Ver
                </button>
              )}
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationsEnabled && notificationPermission === 'granted'}
                  onChange={(e) => onToggleNotifications(e.target.checked)}
                  disabled={notificationPermission !== 'granted'}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
              </label>
            </div>
          </div>

          {/* Troubleshooting for denied permissions */}
          {notificationPermission === 'denied' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800 mb-2">Bildirimler Nasıl Açılır?</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• <strong>Chrome:</strong> Adres çubuğundaki kilit ikonuna tıklayın → Bildirimler → İzin Ver</li>
                    <li>• <strong>Firefox:</strong> Adres çubuğundaki kalkan ikonuna tıklayın → İzinler → Bildirimler</li>
                    <li>• <strong>Safari:</strong> Safari → Tercihler → Web Siteleri → Bildirimler</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Test notification and debug info */}
          {notificationPermission === 'granted' && (
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleTestNotification}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                🧪 Test Bildirimi Gönder
              </button>
              
              {/* Debug Info */}
              <details className="text-xs text-gray-500">
                <summary className="cursor-pointer font-medium mb-2">Teknik Bilgiler</summary>
                <div className="bg-gray-50 p-3 rounded space-y-1">
                  <div>Bildirim Durumu: {notificationPermission}</div>
                  <div>Tarayıcı Desteği: {'Notification' in window ? 'Var' : 'Yok'}</div>
                  <div>Service Worker: {navigator.serviceWorker ? 'Aktif' : 'Yok'}</div>
                  <div>HTTPS: {window.location.protocol === 'https:' || window.location.hostname === 'localhost' ? 'OK' : 'Gerekli'}</div>
                  <div>Platform: {navigator.platform}</div>
                </div>
              </details>
            </div>
          )}
        </div>
      </div>

      {/* Additional Settings */}
      <div className="bg-white p-4 sm:p-6 rounded-lg border">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Settings className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold">Ek Ayarlar</h3>
            <p className="text-sm text-gray-600">Gelecekte eklenecek özellikler</p>
          </div>
        </div>

        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span>Günlük hedef hatırlatıcısı</span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">Yakında</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span>Haftalık ilerleme raporu</span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">Yakında</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span>Sosyal paylaşım</span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">Yakında</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span>Veri dışa aktarma</span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">Yakında</span>
          </div>
        </div>
      </div>

      {/* Goal Edit Modal */}
      <Modal
        isOpen={showGoalForm}
        onClose={() => !loading && setShowGoalForm(false)}
        title="Hedefleri Düzenle"
        size="md"
        closeOnBackdropClick={!loading}
        closeOnEscape={!loading}
      >
        <div className="p-4 sm:p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aylık Kitap Hedefi
              </label>
              <input
                type="number"
                value={editingGoals.monthly.books}
                onChange={(e) => setEditingGoals({
                  ...editingGoals,
                  monthly: { ...editingGoals.monthly, books: parseInt(e.target.value) || 0 }
                })}
                className="w-full p-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max="50"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aylık Sayfa Hedefi
              </label>
              <input
                type="number"
                value={editingGoals.monthly.pages}
                onChange={(e) => setEditingGoals({
                  ...editingGoals,
                  monthly: { ...editingGoals.monthly, pages: parseInt(e.target.value) || 0 }
                })}
                className="w-full p-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max="10000"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Haftalık Kitap Hedefi
              </label>
              <input
                type="number"
                value={editingGoals.weekly.books}
                onChange={(e) => setEditingGoals({
                  ...editingGoals,
                  weekly: { ...editingGoals.weekly, books: parseInt(e.target.value) || 0 }
                })}
                className="w-full p-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max={editingGoals.monthly.books}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Haftalık Sayfa Hedefi
              </label>
              <input
                type="number"
                value={editingGoals.weekly.pages}
                onChange={(e) => setEditingGoals({
                  ...editingGoals,
                  weekly: { ...editingGoals.weekly, pages: parseInt(e.target.value) || 0 }
                })}
                className="w-full p-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max={editingGoals.monthly.pages}
                disabled={loading}
              />
            </div>

            {/* Guidelines */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">💡 Hedef Belirleme İpuçları</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Gerçekçi hedefler belirleyin</li>
                <li>• Haftalık hedefler aylık hedeflerden küçük olmalı</li>
                <li>• Ortalama 30-50 sayfa/saat okuma hızı normal</li>
                <li>• Başlangıçta küçük hedeflerle başlayın</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:justify-end">
            <button
              onClick={() => setShowGoalForm(false)}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              İptal
            </button>
            <button
              onClick={handleSaveGoals}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <InlineSpinner />}
              Kaydet
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};