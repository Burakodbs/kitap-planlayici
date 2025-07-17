import React from 'react';
import { BookOpen, Download, CheckCircle, Bell, Menu, X } from 'lucide-react';
import { NotificationPermission } from '../../types';
import { formatDate } from '../../utils';

interface HeaderProps {
  isInstallable: boolean;
  isInstalled: boolean;
  onInstallApp: () => void;
  notificationPermission: NotificationPermission;
  onRequestNotificationPermission: () => void;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isInstallable,
  isInstalled,
  onInstallApp,
  notificationPermission,
  onRequestNotificationPermission,
  isMobileMenuOpen,
  onToggleMobileMenu,
}) => {
  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center py-3 sm:py-4">
          <div className="flex items-center gap-2 min-w-0">
            <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
            <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
              <span className="hidden sm:inline">Kitap Okuma Planlayıcısı</span>
              <span className="sm:hidden">Kitap Planlayıcı</span>
            </h1>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* PWA Install Button */}
            {isInstallable && (
              <button
                onClick={onInstallApp}
                className="bg-green-600 text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm hover:bg-green-700 flex items-center gap-1 transition-colors"
                title="Uygulamayı cihazınıza kurun"
                aria-label="Install app"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden lg:inline">Kur</span>
              </button>
            )}

            {/* Installed Indicator */}
            {isInstalled && (
              <div 
                className="bg-green-100 text-green-800 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm flex items-center gap-1"
                title="Uygulama kurulu"
              >
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden lg:inline">Kurulu</span>
              </div>
            )}

            {/* Notification Status */}
            {notificationPermission === 'granted' && (
              <div 
                className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm flex items-center gap-1"
                title="Bildirimler aktif"
              >
                <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden lg:inline">Aktif</span>
              </div>
            )}

            {/* Request Notification Permission */}
            {notificationPermission === 'default' && (
              <button
                onClick={onRequestNotificationPermission}
                className="bg-orange-600 text-white px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm hover:bg-orange-700 flex items-center gap-1 transition-colors"
                title="Bildirim izni ver"
                aria-label="Enable notifications"
              >
                <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden lg:inline">Bildirim</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? 
                <X className="h-5 w-5" /> : 
                <Menu className="h-5 w-5" />
              }
            </button>

            {/* Current Date - Desktop Only */}
            <div className="hidden lg:block text-xs sm:text-sm text-gray-600">
              {formatDate(new Date())}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};