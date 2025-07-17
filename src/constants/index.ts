export const STORAGE_KEYS = {
  BOOKS: 'books',
  GOALS: 'goals',
  READING_STREAK: 'readingStreak',
  NOTIFICATIONS: 'notifications',
} as const;

export const DEFAULT_GOALS = {
  monthly: { books: 3, pages: 1000 },
  weekly: { books: 1, pages: 250 },
};

export const PRIORITY_LABELS = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
} as const;

export const STATUS_LABELS = {
  'to-read': 'Okunacak',
  reading: 'Okunuyor',
  completed: 'Tamamlandı',
} as const;

export const PRIORITY_COLORS = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
} as const;

export const STATUS_COLORS = {
  'to-read': 'bg-gray-100 text-gray-800',
  reading: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
} as const;

export const NOTIFICATION_CONFIG = {
  DAILY_REMINDER_HOUR: 20, // 20:00
  DAILY_REMINDER_MINUTE: 0,
  WELCOME_TAG: 'welcome',
  TEST_TAG: 'test',
  DAILY_REMINDER_TAG: 'daily-reminder',
} as const;

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
} as const;

export const NAVIGATION_TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'books', label: 'Kitaplarım' },
  { id: 'statistics', label: 'İstatistikler' },
  { id: 'goals', label: 'Hedefler' },
] as const;

export const MILESTONE_THRESHOLDS = {
  READING_SPEED_TARGET: 50, // sayfa/saat
  WEEKLY_STREAK_TARGET: 7, // gün
} as const;