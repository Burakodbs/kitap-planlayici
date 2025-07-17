export interface Book {
  id: number;
  title: string;
  author: string;
  totalPages: number;
  currentPage: number;
  category: string;
  status: BookStatus;
  priority: Priority;
  startDate: string | null;
  readingSessions: ReadingSession[];
}

export interface ReadingSession {
  date: string;
  pages: number;
  minutes: number;
}

export interface Goals {
  monthly: {
    books: number;
    pages: number;
  };
  weekly: {
    books: number;
    pages: number;
  };
}

export interface ReadingStats {
  monthlyPages: number;
  monthlyBooks: number;
  weeklyPages: number;
  weeklyBooks: number;
  totalReadingTime: number;
  averageReadingSpeed: number;
  totalPages: number;
}

export type BookStatus = 'to-read' | 'reading' | 'completed';
export type Priority = 'low' | 'medium' | 'high';
export type NotificationPermission = 'default' | 'granted' | 'denied';
export type ActiveTab = 'dashboard' | 'books' | 'statistics' | 'goals';

export interface NewBookForm {
  title: string;
  author: string;
  totalPages: string;
  category: string;
  priority: Priority;
}

export interface NewSessionForm {
  bookId: number | null;
  pages: string;
  minutes: string;
  date: string;
}

export interface AppState {
  books: Book[];
  goals: Goals;
  activeTab: ActiveTab;
  readingStreak: number;
  notifications: boolean;
  notificationPermission: NotificationPermission;
  isMobileMenuOpen: boolean;
}

export interface ModalState {
  showBookForm: boolean;
  showGoalForm: boolean;
  showSessionForm: boolean;
  editingBook: Book | null;
}