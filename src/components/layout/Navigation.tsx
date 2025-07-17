import React from 'react';
import { BarChart3, BookOpen, TrendingUp, Target } from 'lucide-react';
import { ActiveTab } from '../../types';
import { NAVIGATION_TABS } from '../../constants';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

const TAB_ICONS = {
  dashboard: BarChart3,
  books: BookOpen,
  statistics: TrendingUp,
  goals: Target,
} as const;

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <nav className="hidden lg:block bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {NAVIGATION_TABS.map(tab => {
            const Icon = TAB_ICONS[tab.id as keyof typeof TAB_ICONS];
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id as ActiveTab)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
    </nav>
  );
};