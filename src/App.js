import React, { useState, useEffect } from 'react';
import { BookOpen, Target, BarChart3, Calendar, Plus, Trash2, Edit, CheckCircle, Clock, Flame, Trophy, TrendingUp } from 'lucide-react';

const BookReadingPlanner = () => {
  // LocalStorage ile veri yükleme ve kaydetme
  const [books, setBooks] = useState(() => {
    const savedBooks = localStorage.getItem('books');
    return savedBooks ? JSON.parse(savedBooks) : [];
  });
  
  const [goals, setGoals] = useState(() => {
    const savedGoals = localStorage.getItem('goals');
    return savedGoals ? JSON.parse(savedGoals) : {
      monthly: { books: 3, pages: 1000 },
      weekly: { books: 1, pages: 250 }
    };
  });
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [readingStreak, setReadingStreak] = useState(() => {
    return parseInt(localStorage.getItem('readingStreak')) || 0;
  });
  const [notifications, setNotifications] = useState(() => {
    return localStorage.getItem('notifications') === 'true';
  });
  
  // Forms and modals
  const [showBookForm, setShowBookForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [newBook, setNewBook] = useState({
    title: '', author: '', totalPages: '', category: '', priority: 'medium'
  });
  const [newSession, setNewSession] = useState({
    bookId: null, pages: '', minutes: '', date: new Date().toISOString().split('T')[0]
  });

  // LocalStorage'a kaydetme
  useEffect(() => {
    localStorage.setItem('books', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('readingStreak', readingStreak.toString());
  }, [readingStreak]);

  useEffect(() => {
    localStorage.setItem('notifications', notifications.toString());
  }, [notifications]);

  // Calculate statistics
  const calculateStats = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    let monthlyPages = 0;
    let monthlyBooks = 0;
    let totalReadingTime = 0;
    let totalPages = 0;
    
    books.forEach(book => {
      if (book.status === 'completed') {
        monthlyBooks++;
        totalPages += book.totalPages;
      }
      
      book.readingSessions?.forEach(session => {
        const sessionDate = new Date(session.date);
        if (sessionDate.getMonth() === currentMonth && sessionDate.getFullYear() === currentYear) {
          monthlyPages += session.pages;
        }
        totalReadingTime += session.minutes;
        totalPages += session.pages;
      });
    });
    
    const averageReadingSpeed = totalReadingTime > 0 ? Math.round(totalPages / (totalReadingTime / 60)) : 0;
    
    return {
      monthlyPages,
      monthlyBooks,
      totalReadingTime,
      averageReadingSpeed,
      totalPages
    };
  };

  const stats = calculateStats();

  // Add new book
  const addBook = () => {
    if (newBook.title && newBook.author && newBook.totalPages) {
      const book = {
        id: Date.now(),
        ...newBook,
        totalPages: parseInt(newBook.totalPages),
        currentPage: 0,
        status: 'to-read',
        startDate: null,
        readingSessions: []
      };
      setBooks([...books, book]);
      setNewBook({ title: '', author: '', totalPages: '', category: '', priority: 'medium' });
      setShowBookForm(false);
    }
  };

  // Add reading session
  const addReadingSession = () => {
    if (newSession.bookId && newSession.pages && newSession.minutes) {
      const updatedBooks = books.map(book => {
        if (book.id === newSession.bookId) {
          const newCurrentPage = book.currentPage + parseInt(newSession.pages);
          const isCompleted = newCurrentPage >= book.totalPages;
          
          return {
            ...book,
            currentPage: Math.min(newCurrentPage, book.totalPages),
            status: isCompleted ? 'completed' : book.status === 'to-read' ? 'reading' : book.status,
            startDate: book.startDate || newSession.date,
            readingSessions: [...(book.readingSessions || []), {
              date: newSession.date,
              pages: parseInt(newSession.pages),
              minutes: parseInt(newSession.minutes)
            }]
          };
        }
        return book;
      });
      
      setBooks(updatedBooks);
      setNewSession({ bookId: null, pages: '', minutes: '', date: new Date().toISOString().split('T')[0] });
      setShowSessionForm(false);
    }
  };

  // Dashboard Component
  const Dashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Bu Ay Okunan Sayfa</p>
              <p className="text-2xl font-bold text-blue-900">{stats.monthlyPages}</p>
              <p className="text-xs text-blue-600">{goals.monthly.pages} hedef</p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-600" />
          </div>
          <div className="mt-2 bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((stats.monthlyPages / goals.monthly.pages) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Bu Ay Tamamlanan</p>
              <p className="text-2xl font-bold text-green-900">{stats.monthlyBooks}</p>
              <p className="text-xs text-green-600">{goals.monthly.books} kitap hedef</p>
            </div>
            <Target className="h-8 w-8 text-green-600" />
          </div>
          <div className="mt-2 bg-green-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((stats.monthlyBooks / goals.monthly.books) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Okuma Serisi</p>
              <p className="text-2xl font-bold text-orange-900">{readingStreak}</p>
              <p className="text-xs text-orange-600">gün üst üste</p>
            </div>
            <Flame className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Okuma Hızı</p>
              <p className="text-2xl font-bold text-purple-900">{stats.averageReadingSpeed}</p>
              <p className="text-xs text-purple-600">sayfa/saat</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Currently Reading */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Şu Anda Okuduklarım
        </h3>
        <div className="space-y-3">
          {books.filter(book => book.status === 'reading').map(book => (
            <div key={book.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium">{book.title}</h4>
                <p className="text-sm text-gray-600">{book.author}</p>
                <div className="mt-2 flex items-center gap-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(book.currentPage / book.totalPages) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">
                    {book.currentPage}/{book.totalPages} sayfa
                  </span>
                </div>
              </div>
            </div>
          ))}
          {books.filter(book => book.status === 'reading').length === 0 && (
            <p className="text-gray-500 text-center py-8">Şu anda okuduğunuz kitap yok</p>
          )}
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Başarılar & Milestone'lar
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-3 rounded-lg border-2 ${stats.monthlyPages >= goals.monthly.pages ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-2">
              {stats.monthlyPages >= goals.monthly.pages ? 
                <CheckCircle className="h-5 w-5 text-green-600" /> : 
                <Clock className="h-5 w-5 text-gray-400" />
              }
              <span className="font-medium">Aylık Sayfa Hedefi</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{stats.monthlyPages}/{goals.monthly.pages} sayfa</p>
          </div>
          
          <div className={`p-3 rounded-lg border-2 ${readingStreak >= 7 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-2">
              {readingStreak >= 7 ? 
                <CheckCircle className="h-5 w-5 text-green-600" /> : 
                <Clock className="h-5 w-5 text-gray-400" />
              }
              <span className="font-medium">Haftalık Seri</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{readingStreak}/7 gün</p>
          </div>
          
          <div className={`p-3 rounded-lg border-2 ${stats.averageReadingSpeed >= 50 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-2">
              {stats.averageReadingSpeed >= 50 ? 
                <CheckCircle className="h-5 w-5 text-green-600" /> : 
                <Clock className="h-5 w-5 text-gray-400" />
              }
              <span className="font-medium">Hız Hedefi</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{stats.averageReadingSpeed}/50 sayfa/saat</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Book List Component
  const BookList = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Kitap Listem</h2>
        <button
          onClick={() => setShowBookForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Kitap Ekle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map(book => (
          <div key={book.id} className="bg-white p-4 rounded-lg border">
            <div className="flex justify-between items-start mb-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                book.priority === 'high' ? 'bg-red-100 text-red-800' :
                book.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {book.priority === 'high' ? 'Yüksek' : book.priority === 'medium' ? 'Orta' : 'Düşük'}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                book.status === 'completed' ? 'bg-green-100 text-green-800' :
                book.status === 'reading' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {book.status === 'completed' ? 'Tamamlandı' : book.status === 'reading' ? 'Okunuyor' : 'Okunacak'}
              </span>
            </div>
            <h3 className="font-semibold">{book.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{book.author}</p>
            <p className="text-sm text-gray-600 mb-3">{book.category}</p>
            
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span>İlerleme</span>
                <span>{book.currentPage}/{book.totalPages}</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(book.currentPage / book.totalPages) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setNewSession({ ...newSession, bookId: book.id });
                  setShowSessionForm(true);
                }}
                className="flex-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                Oturum Ekle
              </button>
              <button
                onClick={() => setBooks(books.filter(b => b.id !== book.id))}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Book Modal */}
      {showBookForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Yeni Kitap Ekle</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Kitap Adı"
                value={newBook.title}
                onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Yazar"
                value={newBook.author}
                onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <input
                type="number"
                placeholder="Toplam Sayfa"
                value={newBook.totalPages}
                onChange={(e) => setNewBook({ ...newBook, totalPages: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Kategori"
                value={newBook.category}
                onChange={(e) => setNewBook({ ...newBook, category: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <select
                value={newBook.priority}
                onChange={(e) => setNewBook({ ...newBook, priority: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="low">Düşük Öncelik</option>
                <option value="medium">Orta Öncelik</option>
                <option value="high">Yüksek Öncelik</option>
              </select>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={addBook} className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                Ekle
              </button>
              <button onClick={() => setShowBookForm(false)} className="flex-1 bg-gray-600 text-white p-2 rounded hover:bg-gray-700">
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Session Modal */}
      {showSessionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Okuma Oturumu Ekle</h3>
            <div className="space-y-3">
              <select
                value={newSession.bookId || ''}
                onChange={(e) => setNewSession({ ...newSession, bookId: parseInt(e.target.value) })}
                className="w-full p-2 border rounded"
              >
                <option value="">Kitap Seçin</option>
                {books.filter(book => book.status !== 'completed').map(book => (
                  <option key={book.id} value={book.id}>{book.title}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Okunan Sayfa"
                value={newSession.pages}
                onChange={(e) => setNewSession({ ...newSession, pages: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <input
                type="number"
                placeholder="Okuma Süresi (dakika)"
                value={newSession.minutes}
                onChange={(e) => setNewSession({ ...newSession, minutes: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <input
                type="date"
                value={newSession.date}
                onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={addReadingSession} className="flex-1 bg-green-600 text-white p-2 rounded hover:bg-green-700">
                Ekle
              </button>
              <button onClick={() => setShowSessionForm(false)} className="flex-1 bg-gray-600 text-white p-2 rounded hover:bg-gray-700">
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Statistics Component
  const Statistics = () => {
    const chartData = books.flatMap(book => 
      book.readingSessions?.map(session => ({
        date: session.date,
        pages: session.pages,
        minutes: session.minutes,
        speed: session.pages / (session.minutes / 60)
      })) || []
    ).sort((a, b) => new Date(a.date) - new Date(b.date));

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">İstatistikler ve Analizler</h2>
        
        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-600">Toplam Kitap</h3>
            <p className="text-2xl font-bold">{books.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-600">Tamamlanan</h3>
            <p className="text-2xl font-bold">{books.filter(b => b.status === 'completed').length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-600">Toplam Sayfa</h3>
            <p className="text-2xl font-bold">{stats.totalPages}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-600">Toplam Süre</h3>
            <p className="text-2xl font-bold">{Math.round(stats.totalReadingTime / 60)}sa</p>
          </div>
        </div>

        {/* Reading Speed Chart */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Okuma Hızı Gelişimi</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {chartData.slice(-10).map((data, index) => (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className="bg-blue-600 w-8 rounded-t transition-all duration-300"
                  style={{ height: `${Math.min((data.speed / 100) * 200, 200)}px` }}
                ></div>
                <span className="text-xs mt-2 text-gray-600 transform -rotate-45 origin-top-left">
                  {new Date(data.date).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">Günlük okuma hızı (sayfa/saat)</p>
        </div>

        {/* Category Analysis */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Kategori Analizi</h3>
          <div className="space-y-3">
            {Object.entries(
              books.reduce((acc, book) => {
                acc[book.category] = (acc[book.category] || 0) + 1;
                return acc;
              }, {})
            ).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="font-medium">{category}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(count / books.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Goals Component
  const Goals = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Hedeflerim</h2>
        <button
          onClick={() => setShowGoalForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Hedef Düzenle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Aylık Hedefler</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span>Kitap Sayısı</span>
                <span>{stats.monthlyBooks}/{goals.monthly.books}</span>
              </div>
              <div className="bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((stats.monthlyBooks / goals.monthly.books) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>Sayfa Sayısı</span>
                <span>{stats.monthlyPages}/{goals.monthly.pages}</span>
              </div>
              <div className="bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((stats.monthlyPages / goals.monthly.pages) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Haftalık Hedefler</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span>Kitap Sayısı</span>
                <span>1/{goals.weekly.books}</span>
              </div>
              <div className="bg-gray-200 rounded-full h-3">
                <div className="bg-blue-600 h-3 rounded-full w-full"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>Sayfa Sayısı</span>
                <span>180/{goals.weekly.pages}</span>
              </div>
              <div className="bg-gray-200 rounded-full h-3">
                <div className="bg-green-600 h-3 rounded-full w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reading Reminders */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Okuma Hatırlatıcıları</h3>
        <div className="flex items-center justify-between">
          <span>Günlük okuma hatırlatıcıları</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {notifications ? 'Hatırlatıcılar aktif - Her gün saat 20:00\'da bildirim alacaksınız' : 'Hatırlatıcılar kapalı'}
        </p>
      </div>

      {/* Goal Form Modal */}
      {showGoalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Hedefleri Düzenle</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Aylık Kitap Hedefi</label>
                <input
                  type="number"
                  value={goals.monthly.books}
                  onChange={(e) => setGoals({
                    ...goals,
                    monthly: { ...goals.monthly, books: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Aylık Sayfa Hedefi</label>
                <input
                  type="number"
                  value={goals.monthly.pages}
                  onChange={(e) => setGoals({
                    ...goals,
                    monthly: { ...goals.monthly, pages: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Haftalık Kitap Hedefi</label>
                <input
                  type="number"
                  value={goals.weekly.books}
                  onChange={(e) => setGoals({
                    ...goals,
                    weekly: { ...goals.weekly, books: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Haftalık Sayfa Hedefi</label>
                <input
                  type="number"
                  value={goals.weekly.pages}
                  onChange={(e) => setGoals({
                    ...goals,
                    weekly: { ...goals.weekly, pages: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowGoalForm(false)} className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                Kaydet
              </button>
              <button onClick={() => setShowGoalForm(false)} className="flex-1 bg-gray-600 text-white p-2 rounded hover:bg-gray-700">
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Kitap Okuma Planlayıcısı</h1>
            </div>
            <div className="text-sm text-gray-600">
              {new Date().toLocaleDateString('tr-TR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'books', label: 'Kitaplarım', icon: BookOpen },
              { id: 'statistics', label: 'İstatistikler', icon: TrendingUp },
              { id: 'goals', label: 'Hedefler', icon: Target }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'books' && <BookList />}
        {activeTab === 'statistics' && <Statistics />}
        {activeTab === 'goals' && <Goals />}
      </main>
    </div>
  );
};

export default BookReadingPlanner;