import React, { useState, useEffect } from 'react';
import { Book, NewSessionForm } from '../../types';
import { Modal } from '../ui/Modal';
import { InlineSpinner } from '../ui/LoadingSpinner';

interface SessionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (session: NewSessionForm) => void;
  books: Book[];
  preselectedBookId?: number | null;
  loading?: boolean;
}

export const SessionForm: React.FC<SessionFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  books,
  preselectedBookId,
  loading = false,
}) => {
  const [formData, setFormData] = useState<NewSessionForm>({
    bookId: preselectedBookId || null,
    pages: '',
    minutes: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<Partial<NewSessionForm>>({});

  // Update bookId when preselectedBookId changes
  useEffect(() => {
    if (preselectedBookId) {
      setFormData(prev => ({ ...prev, bookId: preselectedBookId }));
    }
  }, [preselectedBookId]);

  // Filter books that are not completed
  const availableBooks = books.filter(book => book.status !== 'completed');

  const selectedBook = formData.bookId ? books.find(book => book.id === formData.bookId) : null;
  const remainingPages = selectedBook ? selectedBook.totalPages - selectedBook.currentPage : 0;

  const validateForm = (): boolean => {
    const newErrors: Partial<NewSessionForm> = {};

    if (!formData.bookId) {
      newErrors.bookId = 'Lütfen bir kitap seçiniz' as any;
    }

    const pages = parseInt(formData.pages);
    if (!formData.pages || isNaN(pages) || pages <= 0) {
      newErrors.pages = 'Geçerli bir sayfa sayısı giriniz';
    } else if (selectedBook && pages > remainingPages) {
      newErrors.pages = `En fazla ${remainingPages} sayfa girebilirsiniz`;
    } else if (pages > 1000) {
      newErrors.pages = 'Bir oturumda en fazla 1000 sayfa girebilirsiniz';
    }

    const minutes = parseInt(formData.minutes);
    if (!formData.minutes || isNaN(minutes) || minutes <= 0) {
      newErrors.minutes = 'Geçerli bir okuma süresi giriniz';
    } else if (minutes > 1440) { // 24 hours
      newErrors.minutes = 'Okuma süresi 24 saatten fazla olamaz';
    }

    if (!formData.date) {
      newErrors.date = 'Lütfen bir tarih seçiniz';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);

      if (selectedDate > today) {
        newErrors.date = 'Gelecek tarih seçilemez';
      } else if (selectedDate < oneYearAgo) {
        newErrors.date = 'Bir yıldan eski tarih seçilemez';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit({
      ...formData,
      pages: formData.pages.trim(),
      minutes: formData.minutes.trim(),
    });
  };

  const handleInputChange = (field: keyof NewSessionForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const calculateReadingSpeed = (): number => {
    const pages = parseInt(formData.pages);
    const minutes = parseInt(formData.minutes);
    
    if (!pages || !minutes || isNaN(pages) || isNaN(minutes)) {
      return 0;
    }
    
    return Math.round(pages / (minutes / 60));
  };

  const resetForm = () => {
    setFormData({
      bookId: preselectedBookId || null,
      pages: '',
      minutes: '',
      date: new Date().toISOString().split('T')[0],
    });
    setErrors({});
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  const readingSpeed = calculateReadingSpeed();

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Okuma Oturumu Ekle"
      size="md"
      closeOnBackdropClick={!loading}
      closeOnEscape={!loading}
    >
      <form onSubmit={handleSubmit} className="p-4 sm:p-6">
        <div className="space-y-4">
          {/* Book Selection */}
          <div>
            <label htmlFor="bookId" className="block text-sm font-medium text-gray-700 mb-1">
              Kitap *
            </label>
            <select
              id="bookId"
              value={formData.bookId || ''}
              onChange={(e) => handleInputChange('bookId', parseInt(e.target.value) || null)}
              className={`w-full p-3 border rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.bookId ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            >
              <option value="">Kitap seçiniz</option>
              {availableBooks.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title} - {book.author}
                </option>
              ))}
            </select>
            {errors.bookId && (
              <p className="mt-1 text-sm text-red-600">{errors.bookId}</p>
            )}
            
            {/* Book Progress Info */}
            {selectedBook && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-800">
                  <div className="flex justify-between">
                    <span>Mevcut İlerleme:</span>
                    <span>{selectedBook.currentPage}/{selectedBook.totalPages} sayfa</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kalan Sayfa:</span>
                    <span>{remainingPages} sayfa</span>
                  </div>
                </div>
                <div className="mt-2 bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(selectedBook.currentPage / selectedBook.totalPages) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Pages Read */}
          <div>
            <label htmlFor="pages" className="block text-sm font-medium text-gray-700 mb-1">
              Okunan Sayfa *
            </label>
            <input
              id="pages"
              type="number"
              value={formData.pages}
              onChange={(e) => handleInputChange('pages', e.target.value)}
              className={`w-full p-3 border rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.pages ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Örn: 25"
              min="1"
              max={selectedBook ? remainingPages : 1000}
              disabled={loading}
            />
            {errors.pages && (
              <p className="mt-1 text-sm text-red-600">{errors.pages}</p>
            )}
            {selectedBook && remainingPages > 0 && (
              <p className="mt-1 text-xs text-gray-600">
                En fazla {remainingPages} sayfa girebilirsiniz
              </p>
            )}
          </div>

          {/* Reading Time */}
          <div>
            <label htmlFor="minutes" className="block text-sm font-medium text-gray-700 mb-1">
              Okuma Süresi (dakika) *
            </label>
            <input
              id="minutes"
              type="number"
              value={formData.minutes}
              onChange={(e) => handleInputChange('minutes', e.target.value)}
              className={`w-full p-3 border rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.minutes ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Örn: 45"
              min="1"
              max="1440"
              disabled={loading}
            />
            {errors.minutes && (
              <p className="mt-1 text-sm text-red-600">{errors.minutes}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Okuma Tarihi *
            </label>
            <input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className={`w-full p-3 border rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
              max={new Date().toISOString().split('T')[0]}
              disabled={loading}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date}</p>
            )}
          </div>

          {/* Reading Speed Calculation */}
          {readingSpeed > 0 && (
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-sm text-green-800">
                <div className="flex justify-between">
                  <span>Hesaplanan Okuma Hızı:</span>
                  <span className="font-medium">{readingSpeed} sayfa/saat</span>
                </div>
                <div className="text-xs text-green-600 mt-1">
                  {readingSpeed < 30 && '📚 Yavaş ve dikkatli okuma'}
                  {readingSpeed >= 30 && readingSpeed < 60 && '📖 Normal okuma hızı'}
                  {readingSpeed >= 60 && readingSpeed < 100 && '⚡ Hızlı okuma'}
                  {readingSpeed >= 100 && '🚀 Çok hızlı okuma!'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:justify-end">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={loading || availableBooks.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <InlineSpinner />}
            Oturum Ekle
          </button>
        </div>

        {availableBooks.length === 0 && (
          <p className="text-sm text-gray-500 mt-4 text-center">
            Okuma oturumu eklemek için önce bir kitap eklemeniz gerekiyor.
          </p>
        )}
      </form>
    </Modal>
  );
};