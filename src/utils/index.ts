import { Book } from '../types';

// Math utilities
export const calculateProgress = (current: number, total: number): number => {
  if (total <= 0) return 0;
  return Math.min((current / total) * 100, 100);
};

export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

// Date utilities
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatShortDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const isToday = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
};

export const isThisWeek = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
  const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
  
  return dateObj >= weekStart && dateObj <= weekEnd;
};

export const isThisMonth = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return (
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
};

// Duration formatting
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} dakika`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} saat`;
  }
  
  return `${hours} saat ${remainingMinutes} dakika`;
};

// Text utilities
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const capitalizeFirst = (text: string): string => {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

// ID generation
export const generateUniqueId = (): number => {
  return Date.now() + Math.floor(Math.random() * 1000);
};

export const generateRandomId = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Array utilities
export const groupBy = <T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

export const sortBy = <T>(array: T[], keyFn: (item: T) => any, direction: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = keyFn(a);
    const bVal = keyFn(b);
    
    if (direction === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });
};

// Reading statistics calculations
export interface DetailedReadingStats {
  totalBooks: number;
  completedBooks: number;
  readingBooks: number;
  toReadBooks: number;
  totalPages: number;
  completedPages: number;
  totalReadingTime: number;
  averageReadingSpeed: number;
  monthlyBooks: number;
  monthlyPages: number;
  weeklyBooks: number;
  weeklyPages: number;
}

export const calculateReadingStats = (books: Book[]): DetailedReadingStats => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Calculate week start (Sunday)
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  let totalReadingTime = 0;
  let totalPagesRead = 0;
  let monthlyBooks = 0;
  let monthlyPages = 0;
  let weeklyBooks = 0;
  let weeklyPages = 0;

  books.forEach(book => {
    // Total stats
    totalPagesRead += book.currentPage;
    
    if (book.readingSessions) {
      book.readingSessions.forEach(session => {
        totalReadingTime += session.minutes;
        
        const sessionDate = new Date(session.date);
        
        // Monthly stats
        if (sessionDate.getMonth() === currentMonth && sessionDate.getFullYear() === currentYear) {
          monthlyPages += session.pages;
        }
        
        // Weekly stats
        if (sessionDate >= weekStart) {
          weeklyPages += session.pages;
        }
      });
    }
    
    // Monthly completed books
    if (book.status === 'completed' && book.readingSessions && book.readingSessions.length > 0) {
      const lastSession = book.readingSessions[book.readingSessions.length - 1];
      const completionDate = new Date(lastSession.date);
      
      if (completionDate.getMonth() === currentMonth && completionDate.getFullYear() === currentYear) {
        monthlyBooks++;
      }
      
      if (completionDate >= weekStart) {
        weeklyBooks++;
      }
    }
  });

  const averageReadingSpeed = totalReadingTime > 0 ? Math.round((totalPagesRead / totalReadingTime) * 60) : 0;

  return {
    totalBooks: books.length,
    completedBooks: books.filter(b => b.status === 'completed').length,
    readingBooks: books.filter(b => b.status === 'reading').length,
    toReadBooks: books.filter(b => b.status === 'to-read').length,
    totalPages: books.reduce((sum, book) => sum + book.totalPages, 0),
    completedPages: totalPagesRead,
    totalReadingTime,
    averageReadingSpeed,
    monthlyBooks,
    monthlyPages,
    weeklyBooks,
    weeklyPages,
  };
};

// Reading speed calculations
export interface ReadingSpeedData {
  date: string;
  pages: number;
  minutes: number;
  speed: number;
}

export const getReadingSpeedData = (books: Book[]): ReadingSpeedData[] => {
  const allSessions: ReadingSpeedData[] = [];
  
  books.forEach(book => {
    if (book.readingSessions) {
      book.readingSessions.forEach(session => {
        const speed = session.minutes > 0 ? (session.pages / session.minutes) * 60 : 0;
        allSessions.push({
          date: session.date,
          pages: session.pages,
          minutes: session.minutes,
          speed: Math.round(speed * 10) / 10, // Round to 1 decimal
        });
      });
    }
  });
  
  return allSessions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidNumber = (value: string, min?: number, max?: number): boolean => {
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
};

// Local storage utilities with error handling
export const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
};

export const safeJsonStringify = (obj: any): string | null => {
  try {
    return JSON.stringify(obj);
  } catch {
    return null;
  }
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Throttle utility
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void => {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

// Performance utilities
export const measurePerformance = <T>(name: string, fn: () => T): T => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  // eslint-disable-next-line no-console
  console.log(`${name} took ${end - start} milliseconds`);
  return result;
};

// Color utilities
export const getProgressColor = (percentage: number): string => {
  if (percentage < 25) return 'bg-red-500';
  if (percentage < 50) return 'bg-orange-500';
  if (percentage < 75) return 'bg-yellow-500';
  return 'bg-green-500';
};

export const getPriorityColor = (priority: 'low' | 'medium' | 'high'): string => {
  switch (priority) {
    case 'high': return 'text-red-600 bg-red-100';
    case 'medium': return 'text-yellow-600 bg-yellow-100';
    case 'low': return 'text-green-600 bg-green-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

// Error handling utilities
export const handleError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Bilinmeyen bir hata oluştu';
};

export const createErrorHandler = (context: string) => {
  return (error: unknown) => {
    const message = handleError(error);
    console.error(`[${context}] Error:`, message);
    return message;
  };
};