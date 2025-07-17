import React from 'react';
import { BarChart3, BookOpen, TrendingUp, Target } from 'lucide-react';
import { ActiveTab } from '../../types';
import { NAVIGATION_TABS } from '../../constants';

interface MobileMenuProps {
  isOpen: boolean;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

const TAB_ICONS = {
  dashboard: BarChart3,
  books: BookOpen,
  statistics: TrendingUp,
  goals: Target,
} as const;

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  activeTab,
  onTabChange,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="lg:hidden bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="grid grid-cols-2 gap-2 py-3">
          {NAVIGATION_TABS.map(tab => {
            const Icon = TAB_ICONS[tab.id as keyof typeof TAB_ICONS];
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id as ActiveTab)}
                className={`flex items-center justify-center gap-2 py-3 px-2 rounded-lg font-medium text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};