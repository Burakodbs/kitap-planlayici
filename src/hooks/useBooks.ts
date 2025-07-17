import { useState, useEffect, useCallback } from 'react';
import { Book, ReadingSession, NewBookForm, NewSessionForm } from '../types';
import { storageService } from '../services/storageService';
import { generateUniqueId } from '../utils';

export const useBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load books from storage on mount
  useEffect(() => {
    try {
      const savedBooks = storageService.getBooks();
      setBooks(savedBooks);
    } catch (err) {
      setError('Failed to load books from storage');
      console.error('Error loading books:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save books to storage whenever books change
  useEffect(() => {
    if (!loading) {
      try {
        storageService.saveBooks(books);
      } catch (err) {
        setError('Failed to save books to storage');
        console.error('Error saving books:', err);
      }
    }
  }, [books, loading]);

  const addBook = useCallback((bookForm: NewBookForm): Book => {
    const newBook: Book = {
      id: generateUniqueId(),
      title: bookForm.title.trim(),
      author: bookForm.author.trim(),
      totalPages: parseInt(bookForm.totalPages),
      currentPage: 0,
      category: bookForm.category.trim(),
      priority: bookForm.priority,
      status: 'to-read',
      startDate: null,
      readingSessions: [],
    };

    setBooks(prevBooks => [...prevBooks, newBook]);
    return newBook;
  }, []);

  const updateBook = useCallback((bookId: number, updates: Partial<Book>): boolean => {
    setBooks(prevBooks => {
      const bookIndex = prevBooks.findIndex(book => book.id === bookId);
      if (bookIndex === -1) {
        setError(`Book with ID ${bookId} not found`);
        return prevBooks;
      }

      const updatedBooks = [...prevBooks];
      updatedBooks[bookIndex] = { ...updatedBooks[bookIndex], ...updates };
      return updatedBooks;
    });
    return true;
  }, []);

  const deleteBook = useCallback((bookId: number): boolean => {
    setBooks(prevBooks => {
      const bookExists = prevBooks.some(book => book.id === bookId);
      if (!bookExists) {
        setError(`Book with ID ${bookId} not found`);
        return prevBooks;
      }

      return prevBooks.filter(book => book.id !== bookId);
    });
    return true;
  }, []);

  const addReadingSession = useCallback((sessionForm: NewSessionForm): boolean => {
    if (!sessionForm.bookId || !sessionForm.pages || !sessionForm.minutes) {
      setError('All session fields are required');
      return false;
    }

    const pages = parseInt(sessionForm.pages);
    const minutes = parseInt(sessionForm.minutes);

    if (pages <= 0 || minutes <= 0) {
      setError('Pages and minutes must be positive numbers');
      return false;
    }

    setBooks(prevBooks => {
      const bookIndex = prevBooks.findIndex(book => book.id === sessionForm.bookId);
      if (bookIndex === -1) {
        setError(`Book with ID ${sessionForm.bookId} not found`);
        return prevBooks;
      }

      const updatedBooks = [...prevBooks];
      const book = { ...updatedBooks[bookIndex] };
      
      // Add new reading session
      const newSession: ReadingSession = {
        date: sessionForm.date,
        pages,
        minutes,
      };

      book.readingSessions = [...(book.readingSessions || []), newSession];
      
      // Update current page
      const newCurrentPage = book.currentPage + pages;
      book.currentPage = Math.min(newCurrentPage, book.totalPages);
      
      // Update status
      if (book.status === 'to-read') {
        book.status = 'reading';
        book.startDate = sessionForm.date;
      }
      
      if (book.currentPage >= book.totalPages) {
        book.status = 'completed';
      }

      updatedBooks[bookIndex] = book;
      return updatedBooks;
    });

    return true;
  }, []);

  const getBooksByStatus = useCallback((status: Book['status']) => {
    return books.filter(book => book.status === status);
  }, [books]);

  const getBooksByCategory = useCallback(() => {
    return books.reduce((acc, book) => {
      acc[book.category] = (acc[book.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [books]);

  const searchBooks = useCallback((query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return books.filter(book => 
      book.title.toLowerCase().includes(lowercaseQuery) ||
      book.author.toLowerCase().includes(lowercaseQuery) ||
      book.category.toLowerCase().includes(lowercaseQuery)
    );
  }, [books]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    books,
    loading,
    error,
    addBook,
    updateBook,
    deleteBook,
    addReadingSession,
    getBooksByStatus,
    getBooksByCategory,
    searchBooks,
    clearError,
  };
};