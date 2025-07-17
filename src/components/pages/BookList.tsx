import React, { useState } from 'react';
import { Plus, Search, Filter, Trash2, Edit, Clock } from 'lucide-react';
import { Book, NewBookForm, NewSessionForm, BookStatus, Priority } from '../../types';
import { BookForm } from '../forms/BookForm';
import { SessionForm } from '../forms/SessionForm';
import { ConfirmModal } from '../ui/Modal';
import { calculateProgress, truncateText } from '../../utils';
import { PRIORITY_COLORS, STATUS_COLORS, PRIORITY_LABELS, STATUS_LABELS } from '../../constants';

interface BookListProps {
  books: Book[];
  onAddBook: (book: NewBookForm) => Book;
  onUpdateBook: (bookId: number, updates: Partial<Book>) => boolean;
  onDeleteBook: (bookId: number) => boolean;
  onAddSession: (session: NewSessionForm) => boolean;
  showToast: (message: string) => void;
}

export const BookList: React.FC<BookListProps> = ({
  books,
  onAddBook,
  onUpdateBook,
  onDeleteBook,
  onAddSession,
  showToast,
}) => {
  const [showBookForm, setShowBookForm] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deletingBookId, setDeletingBookId] = useState<number | null>(null);
  const [preselectedBookId, setPreselectedBookId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [sortBy, setSortBy] = useState<'title' | 'author' | 'progress' | 'priority' | 'recent'>('recent');

  // Filter and sort books
  const filteredBooks = books
    .filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           book.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || book.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || book.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title, 'tr');
        case 'author':
          return a.author.localeCompare(b.author, 'tr');
        case 'progress':
          const progressA = (a.currentPage / a.totalPages) * 100;
          const progressB = (b.currentPage / b.totalPages) * 100;
          return progressB - progressA;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'recent':
        default:
          return b.id - a.id;
      }
    });

  const handleAddBook = (bookData: NewBookForm) => {
    try {
      const newBook = onAddBook(bookData);
      setShowBookForm(false);
      setEditingBook(null);
      showToast(`"${newBook.title}" başarıyla eklendi!`);
    } catch (error) {
      showToast('Kitap eklenirken bir hata oluştu.');
    }
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setShowBookForm(true);
  };

  const handleUpdateBook = (bookData: NewBookForm) => {
    if (!editingBook) return;
    
    try {
      const success = onUpdateBook(editingBook.id, {
        title: bookData.title,
        author: bookData.author,
        totalPages: parseInt(bookData.totalPages),
        category: bookData.category,
        priority: bookData.priority,
      });
      
      if (success) {
        setShowBookForm(false);
        setEditingBook(null);
        showToast('Kitap başarıyla güncellendi!');
      }
    } catch (error) {
      showToast('Kitap güncellenirken bir hata oluştu.');
    }
  };

  const handleDeleteBook = (bookId: number) => {
    setDeletingBookId(bookId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteBook = () => {
    if (!deletingBookId) return;
    
    try {
      const success = onDeleteBook(deletingBookId);
      if (success) {
        setShowDeleteConfirm(false);
        setDeletingBookId(null);
        showToast('Kitap başarıyla silindi!');
      }
    } catch (error) {
      showToast('Kitap silinirken bir hata oluştu.');
    }
  };

  const handleAddSession = (book: Book) => {
    setPreselectedBookId(book.id);
    setShowSessionForm(true);
  };

  const handleSessionSubmit = (sessionData: NewSessionForm) => {
    try {
      const success = onAddSession(sessionData);
      if (success) {
        setShowSessionForm(false);
        setPreselectedBookId(null);
        showToast('Okuma oturumu başarıyla eklendi!');
      }
    } catch (error) {
      showToast('Okuma oturumu eklenirken bir hata oluştu.');
    }
  };

  const getLastReadingDate = (book: Book): string => {
    if (!book.readingSessions || book.readingSessions.length === 0) {
      return 'Hiç okunmamış';
    }
    
    const lastSession = book.readingSessions[book.readingSessions.length - 1];
    return new Date(lastSession.date).toLocaleDateString('tr-TR');
  };

  const BookCard: React.FC<{ book: Book }> = ({ book }) => {
    const progress = calculateProgress(book.currentPage, book.totalPages);
    const remainingPages = book.totalPages - book.currentPage;
    const lastRead = getLastReadingDate(book);
    
    return (
      <div className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow">
        {/* Header with badges */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex gap-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${PRIORITY_COLORS[book.priority]}`}>
              {PRIORITY_LABELS[book.priority]}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[book.status]}`}>
              {STATUS_LABELS[book.status]}
            </span>
          </div>
          
          <div className="flex gap-1">
            <button
              onClick={() => handleEditBook(book)}
              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Düzenle"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDeleteBook(book.id)}
              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Sil"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Book Info */}
        <div className="space-y-2 mb-4">
          <h3 className="font-semibold text-sm sm:text-base" title={book.title}>
            {truncateText(book.title, 40)}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600" title={book.author}>
            {truncateText(book.author, 30)}
          </p>
          <p className="text-xs text-gray-500">{book.category}</p>
          
          {lastRead !== 'Hiç okunmamış' && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              Son okuma: {lastRead}
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-xs sm:text-sm">
            <span>İlerleme</span>
            <span>{book.currentPage}/{book.totalPages}</span>
          </div>
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                book.status === 'completed' ? 'bg-green-500' :
                book.status === 'reading' ? 'bg-blue-500' :
                'bg-gray-400'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{Math.round(progress)}% tamamlandı</span>
            {book.status !== 'completed' && (
              <span>{remainingPages} sayfa kaldı</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {book.status !== 'completed' && (
            <button
              onClick={() => handleAddSession(book)}
              className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition-colors"
            >
              Oturum Ekle
            </button>
          )}
          
          {book.status === 'completed' && (
            <div className="flex-1 bg-green-100 text-green-800 px-3 py-2 rounded text-sm text-center">
              ✅ Tamamlandı
            </div>
          )}
        </div>
      </div>
    );
  };

  const deletingBook = deletingBookId ? books.find(b => b.id === deletingBookId) : null;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold">Kitap Listem</h2>
          <p className="text-sm text-gray-600">
            {books.length} kitap • {books.filter(b => b.status === 'reading').length} okunuyor • {books.filter(b => b.status === 'completed').length} tamamlandı
          </p>
        </div>
        <button
          onClick={() => setShowBookForm(true)}
          className="bg-blue-600 text-white px-4 py-3 sm:py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Kitap Ekle
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Kitap, yazar veya kategori ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as BookStatus | 'all')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="to-read">Okunacak</option>
            <option value="reading">Okunuyor</option>
            <option value="completed">Tamamlandı</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tüm Öncelikler</option>
            <option value="high">Yüksek</option>
            <option value="medium">Orta</option>
            <option value="low">Düşük</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="recent">En Yeni</option>
            <option value="title">Kitap Adı</option>
            <option value="author">Yazar</option>
            <option value="progress">İlerleme</option>
            <option value="priority">Öncelik</option>
          </select>
        </div>

        {/* Active Filters Summary */}
        {(searchQuery || statusFilter !== 'all' || priorityFilter !== 'all') && (
          <div className="flex items-center gap-2 text-sm">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">
              {filteredBooks.length} / {books.length} kitap gösteriliyor
            </span>
            {(searchQuery || statusFilter !== 'all' || priorityFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setPriorityFilter('all');
                }}
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Filtreleri Temizle
              </button>
            )}
          </div>
        )}
      </div>

      {/* Books Grid */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredBooks.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-300 mb-4">
            <Search className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {books.length === 0 ? 'Henüz kitap eklenmemiş' : 'Arama kriterlerine uygun kitap bulunamadı'}
          </h3>
          <p className="text-gray-600 mb-6">
            {books.length === 0 
              ? 'İlk kitabınızı ekleyerek okuma yolculuğunuza başlayın!'
              : 'Farklı arama terimleri deneyebilir veya filtreleri değiştirebilirsiniz.'
            }
          </p>
          {books.length === 0 && (
            <button
              onClick={() => setShowBookForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              İlk Kitabımı Ekle
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      <BookForm
        isOpen={showBookForm}
        onClose={() => {
          setShowBookForm(false);
          setEditingBook(null);
        }}
        onSubmit={editingBook ? handleUpdateBook : handleAddBook}
        editingBook={editingBook}
      />

      <SessionForm
        isOpen={showSessionForm}
        onClose={() => {
          setShowSessionForm(false);
          setPreselectedBookId(null);
        }}
        onSubmit={handleSessionSubmit}
        books={books}
        preselectedBookId={preselectedBookId}
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeletingBookId(null);
        }}
        onConfirm={confirmDeleteBook}
        title="Kitabı Sil"
        message={`"${deletingBook?.title}" adlı kitabı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Evet, Sil"
        cancelText="İptal"
        variant="danger"
      />
    </div>
  );
};