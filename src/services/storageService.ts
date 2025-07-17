import { Book, Goals } from '../types';
import { STORAGE_KEYS, DEFAULT_GOALS } from '../constants';

class StorageService {
  private isStorageAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, 'test');
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  private getItem<T>(key: string, defaultValue: T): T {
    if (!this.isStorageAvailable()) {
      return defaultValue;
    }

    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    if (!this.isStorageAvailable()) {
      console.warn('localStorage is not available');
      return;
    }

    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error);
    }
  }

  // Books
  getBooks(): Book[] {
    return this.getItem<Book[]>(STORAGE_KEYS.BOOKS, []);
  }

  saveBooks(books: Book[]): void {
    this.setItem(STORAGE_KEYS.BOOKS, books);
  }

  addBook(book: Book): void {
    const books = this.getBooks();
    books.push(book);
    this.saveBooks(books);
  }

  updateBook(bookId: number, updates: Partial<Book>): void {
    const books = this.getBooks();
    const index = books.findIndex(book => book.id === bookId);
    
    if (index !== -1) {
      books[index] = { ...books[index], ...updates };
      this.saveBooks(books);
    }
  }

  deleteBook(bookId: number): void {
    const books = this.getBooks();
    const filteredBooks = books.filter(book => book.id !== bookId);
    this.saveBooks(filteredBooks);
  }

  // Goals
  getGoals(): Goals {
    return this.getItem<Goals>(STORAGE_KEYS.GOALS, DEFAULT_GOALS);
  }

  saveGoals(goals: Goals): void {
    this.setItem(STORAGE_KEYS.GOALS, goals);
  }

  // Reading Streak
  getReadingStreak(): number {
    return this.getItem<number>(STORAGE_KEYS.READING_STREAK, 0);
  }

  saveReadingStreak(streak: number): void {
    this.setItem(STORAGE_KEYS.READING_STREAK, streak);
  }

  // Notifications
  getNotificationSettings(): boolean {
    return this.getItem<boolean>(STORAGE_KEYS.NOTIFICATIONS, false);
  }

  saveNotificationSettings(enabled: boolean): void {
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, enabled);
  }

  // Utility methods
  clearAllData(): void {
    if (!this.isStorageAvailable()) return;

    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  exportData(): string {
    const data = {
      books: this.getBooks(),
      goals: this.getGoals(),
      readingStreak: this.getReadingStreak(),
      notifications: this.getNotificationSettings(),
      exportDate: new Date().toISOString(),
    };
    
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.books) this.saveBooks(data.books);
      if (data.goals) this.saveGoals(data.goals);
      if (typeof data.readingStreak === 'number') this.saveReadingStreak(data.readingStreak);
      if (typeof data.notifications === 'boolean') this.saveNotificationSettings(data.notifications);
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

export const storageService = new StorageService();