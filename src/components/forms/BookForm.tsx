import React, { useState } from 'react';
import { Book, NewBookForm, Priority } from '../../types';
import { Modal } from '../ui/Modal';
import { InlineSpinner } from '../ui/LoadingSpinner';

interface BookFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (book: NewBookForm) => void;
  editingBook?: Book | null;
  loading?: boolean;
}

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'low', label: 'Düşük Öncelik' },
  { value: 'medium', label: 'Orta Öncelik' },
  { value: 'high', label: 'Yüksek Öncelik' },
];

const CATEGORY_SUGGESTIONS = [
  'Roman',
  'Bilim Kurgu',
  'Tarih',
  'Bilim',
  'Felsefe',
  'Psikoloji',
  'Biyografi',
  'İş & Ekonomi',
  'Sanat',
  'Sağlık',
  'Kişisel Gelişim',
  'Gezi',
  'Şiir',
  'Çocuk',
  'Gençlik',
];

export const BookForm: React.FC<BookFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingBook,
  loading = false,
}) => {
  const [formData, setFormData] = useState<NewBookForm>(() => {
    if (editingBook) {
      return {
        title: editingBook.title,
        author: editingBook.author,
        totalPages: editingBook.totalPages.toString(),
        category: editingBook.category,
        priority: editingBook.priority,
      };
    }
    return {
      title: '',
      author: '',
      totalPages: '',
      category: '',
      priority: 'medium',
    };
  });

  const [errors, setErrors] = useState<Partial<NewBookForm>>({});
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<NewBookForm> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Kitap adı gereklidir';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Kitap adı 200 karakterden uzun olamaz';
    }

    if (!formData.author.trim()) {
      newErrors.author = 'Yazar adı gereklidir';
    } else if (formData.author.length > 100) {
      newErrors.author = 'Yazar adı 100 karakterden uzun olamaz';
    }

    const pages = parseInt(formData.totalPages);
    if (!formData.totalPages || isNaN(pages) || pages <= 0) {
      newErrors.totalPages = 'Geçerli bir sayfa sayısı giriniz';
    } else if (pages > 10000) {
      newErrors.totalPages = 'Sayfa sayısı 10,000\'den fazla olamaz';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Kategori gereklidir';
    } else if (formData.category.length > 50) {
      newErrors.category = 'Kategori 50 karakterden uzun olamaz';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const cleanedData: NewBookForm = {
      title: formData.title.trim(),
      author: formData.author.trim(),
      totalPages: formData.totalPages.trim(),
      category: formData.category.trim(),
      priority: formData.priority,
    };

    onSubmit(cleanedData);
  };

  const handleInputChange = (field: keyof NewBookForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCategorySelect = (category: string) => {
    handleInputChange('category', category);
    setShowCategorySuggestions(false);
  };

  const filteredSuggestions = CATEGORY_SUGGESTIONS.filter(cat =>
    cat.toLowerCase().includes(formData.category.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      totalPages: '',
      category: '',
      priority: 'medium',
    });
    setErrors({});
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingBook ? 'Kitabı Düzenle' : 'Yeni Kitap Ekle'}
      size="md"
      closeOnBackdropClick={!loading}
      closeOnEscape={!loading}
    >
      <form onSubmit={handleSubmit} className="p-4 sm:p-6">
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Kitap Adı *
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full p-3 border rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Örn: 1984"
              disabled={loading}
              maxLength={200}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Author */}
          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
              Yazar *
            </label>
            <input
              id="author"
              type="text"
              value={formData.author}
              onChange={(e) => handleInputChange('author', e.target.value)}
              className={`w-full p-3 border rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.author ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Örn: George Orwell"
              disabled={loading}
              maxLength={100}
            />
            {errors.author && (
              <p className="mt-1 text-sm text-red-600">{errors.author}</p>
            )}
          </div>

          {/* Total Pages */}
          <div>
            <label htmlFor="totalPages" className="block text-sm font-medium text-gray-700 mb-1">
              Toplam Sayfa *
            </label>
            <input
              id="totalPages"
              type="number"
              value={formData.totalPages}
              onChange={(e) => handleInputChange('totalPages', e.target.value)}
              className={`w-full p-3 border rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.totalPages ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Örn: 300"
              min="1"
              max="10000"
              disabled={loading}
            />
            {errors.totalPages && (
              <p className="mt-1 text-sm text-red-600">{errors.totalPages}</p>
            )}
          </div>

          {/* Category */}
          <div className="relative">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Kategori *
            </label>
            <input
              id="category"
              type="text"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              onFocus={() => setShowCategorySuggestions(true)}
              onBlur={() => setTimeout(() => setShowCategorySuggestions(false), 200)}
              className={`w-full p-3 border rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Örn: Roman"
              disabled={loading}
              maxLength={50}
            />
            
            {/* Category Suggestions */}
            {showCategorySuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredSuggestions.slice(0, 8).map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategorySelect(category)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
            
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
              Öncelik
            </label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              {PRIORITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
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
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <InlineSpinner />}
            {editingBook ? 'Güncelle' : 'Ekle'}
          </button>
        </div>
      </form>
    </Modal>
  );
};