import React, { useState } from 'react';
import { ActiveTab, NotificationPermission } from '../../types';
import { Header } from './Header';
import { Navigation } from './Navigation';
import { MobileMenu } from './MobileMenu';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isInstallable: boolean;
  isInstalled: boolean;
  onInstallApp: () => void;
  notificationPermission: NotificationPermission;
  onRequestNotificationPermission: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  isInstallable,
  isInstalled,
  onInstallApp,
  notificationPermission,
  onRequestNotificationPermission,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTabChange = (tab: ActiveTab) => {
    onTabChange(tab);
    setIsMobileMenuOpen(false); // Close mobile menu when tab changes
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        onInstallApp={onInstallApp}
        notificationPermission={notificationPermission}
        onRequestNotificationPermission={onRequestNotificationPermission}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Mobile Navigation */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Desktop Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={onTabChange}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {children}
      </main>
    </div>
  );
};