import React, { useState, useEffect } from 'react';
import { BookOpen, Target, BarChart3, Calendar, Plus, Trash2, Edit, CheckCircle, Clock, Flame, Trophy, TrendingUp, Download, Bell, BellOff, Menu, X } from 'lucide-react';
import { usePWA } from './hooks/usePWA';

const BookReadingPlanner = () => {
  // PWA hook
  const { isInstallable, isInstalled, installApp, getInstallInstructions } = usePWA();
  
  // PWA ve Bildirim state'leri
  const [notificationPermission, setNotificationPermission] = useState(
    'Notification' in window ? Notification.permission : 'denied'
  );

  // Mobile navigation state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // State management
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
    const currentWeek = getWeekOfYear(new Date());
    
    let monthlyPages = 0;
    let monthlyBooks = 0;
    let weeklyPages = 0;
    let weeklyBooks = 0;
    let totalReadingTime = 0;
    let totalPages = 0;
    
    books.forEach(book => {
      if (book.status === 'completed') {
        const completedDate = book.readingSessions?.length > 0 ? 
          new Date(book.readingSessions[book.readingSessions.length - 1].date) : new Date();
        
        if (completedDate.getMonth() === currentMonth && completedDate.getFullYear() === currentYear) {
          monthlyBooks++;
        }
        
        if (getWeekOfYear(completedDate) === currentWeek && completedDate.getFullYear() === currentYear) {
          weeklyBooks++;
        }
        
        totalPages += book.totalPages;
      }
      
      book.readingSessions?.forEach(session => {
        const sessionDate = new Date(session.date);
        const sessionWeek = getWeekOfYear(sessionDate);
        
        if (sessionDate.getMonth() === currentMonth && sessionDate.getFullYear() === currentYear) {
          monthlyPages += session.pages;
        }
        
        if (sessionWeek === currentWeek && sessionDate.getFullYear() === currentYear) {
          weeklyPages += session.pages;
        }
        
        totalReadingTime += session.minutes;
        totalPages += session.pages;
      });
    });
    
    const averageReadingSpeed = totalReadingTime > 0 ? Math.round(totalPages / (totalReadingTime / 60)) : 0;
    
    return {
      monthlyPages,
      monthlyBooks,
      weeklyPages,
      weeklyBooks,
      totalReadingTime,
      averageReadingSpeed,
      totalPages
    };
  };

  // Haftanın numarasını hesaplayan yardımcı fonksiyon
  const getWeekOfYear = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
  };

  const stats = calculateStats();

  // PWA ve Bildirim fonksiyonları
  const requestNotificationPermission = async () => {
    console.log('Bildirim izni isteniyor...');
    
    if (!('Notification' in window)) {
      alert('Bu tarayıcı bildirimleri desteklemiyor!');
      return;
    }
    
    if (Notification.permission === 'granted') {
      console.log('Bildirim izni zaten verilmiş');
      setNotificationPermission('granted');
      return;
    }
    
    if (Notification.permission === 'denied') {
      alert('Bildirimler daha önce engellenmiş. Tarayıcı ayarlarından manuel olarak açmanız gerekiyor.');
      return;
    }
    
    try {
      const permission = await Notification.requestPermission();
      console.log('Bildirim izni sonucu:', permission);
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        console.log('Bildirim izni verildi!');
        sendWelcomeNotification();
      } else if (permission === 'denied') {
        alert('Bildirim izni reddedildi. İsterseniz tarayıcı ayarlarından manuel olarak açabilirsiniz.');
      } else {
        console.log('Bildirim izni belirsiz durumda');
      }
    } catch (error) {
      console.error('Bildirim izni hatası:', error);
      alert('Bildirim izni alınırken hata oluştu: ' + error.message);
    }
  };

  const sendWelcomeNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('Kitap Planlayıcı Bildirimleri Aktif! 📚', {
        body: 'Artık günlük okuma hatırlatıcıları alacaksınız.',
        icon: '/favicon.ico',
        tag: 'welcome'
      });
    }
  };

  const sendTestNotification = () => {
    console.log('Test bildirimi gönderiliyor...');
    console.log('Notification permission:', Notification.permission);
    
    if (!('Notification' in window)) {
      alert('Bu tarayıcı bildirimleri desteklemiyor!');
      return;
    }
    
    if (Notification.permission === 'granted') {
      try {
        const notification = new Notification('Test Bildirimi 🧪', {
          body: 'Bildirimler düzgün çalışıyor! Okuma vaktiniz geldiğinde hatırlatacağız.',
          icon: '/favicon.ico',
          tag: 'test',
          requireInteraction: false,
          silent: false
        });
        
        notification.onclick = function() {
          console.log('Bildirime tıklandı');
          window.focus();
          notification.close();
        };
        
        notification.onerror = function(error) {
          console.error('Bildirim hatası:', error);
          alert('Bildirim gönderilirken hata oluştu: ' + error);
        };
        
        console.log('Bildirim başarıyla oluşturuldu');
        
        // 3 saniye sonra bildirimi kapat
        setTimeout(() => {
          notification.close();
        }, 3000);
        
      } catch (error) {
        console.error('Bildirim oluşturma hatası:', error);
        alert('Bildirim oluşturulamadı: ' + error.message);
      }
    } else if (Notification.permission === 'denied') {
      alert('Bildirimler engellenmiş! Tarayıcı ayarlarından bildirimleri açın.');
    } else {
      alert('Önce bildirim izni vermeniz gerekiyor!');
      requestNotificationPermission();
    }
  };

  // Günlük okuma hatırlatıcısı
  useEffect(() => {
    if (notifications && notificationPermission === 'granted') {
      const scheduleNotification = () => {
        const now = new Date();
        const target = new Date(now);
        target.setHours(20, 0, 0, 0); // Saat 20:00
        
        if (target <= now) {
          target.setDate(target.getDate() + 1);
        }
        
        const timeout = target.getTime() - now.getTime();
        const dailyPagesTarget = Math.ceil(goals.weekly.pages / 7);
        
        setTimeout(() => {
          if (notifications && Notification.permission === 'granted') {
            new Notification('Günlük Okuma Zamanı! 📚', {
              body: `Bugün ${dailyPagesTarget} sayfa okuma hedefiniz var. Hangi kitabınızı okuyacaksınız?`,
              icon: '/favicon.ico',
              tag: 'daily-reminder',
              requireInteraction: true
            });
          }
          
          // Bir sonraki gün için tekrar ayarla
          scheduleNotification();
        }, timeout);
      };
      
      scheduleNotification();
    }
  }, [notifications, notificationPermission, goals]);

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
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-blue-600 font-medium truncate">Bu Ay Sayfa</p>
              <p className="text-lg sm:text-2xl font-bold text-blue-900">{stats.monthlyPages}</p>
              <p className="text-xs text-blue-600">{goals.monthly.pages} hedef</p>
            </div>
            <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
          </div>
          <div className="mt-2 bg-blue-200 rounded-full h-1.5 sm:h-2">
            <div 
              className="bg-blue-600 h-1.5 sm:h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((stats.monthlyPages / goals.monthly.pages) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-green-50 p-3 sm:p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-green-600 font-medium truncate">Bu Ay Kitap</p>
              <p className="text-lg sm:text-2xl font-bold text-green-900">{stats.monthlyBooks}</p>
              <p className="text-xs text-green-600">{goals.monthly.books} hedef</p>
            </div>
            <Target className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
          </div>
          <div className="mt-2 bg-green-200 rounded-full h-1.5 sm:h-2">
            <div 
              className="bg-green-600 h-1.5 sm:h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((stats.monthlyBooks / goals.monthly.books) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-orange-50 p-3 sm:p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-orange-600 font-medium truncate">Okuma Serisi</p>
              <p className="text-lg sm:text-2xl font-bold text-orange-900">{readingStreak}</p>
              <p className="text-xs text-orange-600">gün üst üste</p>
            </div>
            <Flame className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-purple-50 p-3 sm:p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-purple-600 font-medium truncate">Okuma Hızı</p>
              <p className="text-lg sm:text-2xl font-bold text-purple-900">{stats.averageReadingSpeed}</p>
              <p className="text-xs text-purple-600">sayfa/saat</p>
            </div>
            <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Currently Reading */}
      <div className="bg-white p-4 sm:p-6 rounded-lg border">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
          <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
          Şu Anda Okuduklarım
        </h3>
        <div className="space-y-3">
          {books.filter(book => book.status === 'reading').map(book => (
            <div key={book.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <h4 className="font-medium text-sm sm:text-base">{book.title}</h4>
                <p className="text-xs sm:text-sm text-gray-600">{book.author}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
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
              </div>
            </div>
          ))}
          {books.filter(book => book.status === 'reading').length === 0 && (
            <p className="text-gray-500 text-center py-6 sm:py-8 text-sm sm:text-base">Şu anda okuduğunuz kitap yok</p>
          )}
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white p-4 sm:p-6 rounded-lg border">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
          <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
          Başarılar & Milestone'lar
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className={`p-3 rounded-lg border-2 ${stats.monthlyPages >= goals.monthly.pages ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-2">
              {stats.monthlyPages >= goals.monthly.pages ? 
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" /> : 
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
              }
              <span className="font-medium text-sm sm:text-base">Aylık Sayfa Hedefi</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">{stats.monthlyPages}/{goals.monthly.pages} sayfa</p>
          </div>
          
          <div className={`p-3 rounded-lg border-2 ${readingStreak >= 7 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-2">
              {readingStreak >= 7 ? 
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" /> : 
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
              }
              <span className="font-medium text-sm sm:text-base">Haftalık Seri</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">{readingStreak}/7 gün</p>
          </div>
          
          <div className={`p-3 rounded-lg border-2 sm:col-span-2 lg:col-span-1 ${stats.averageReadingSpeed >= 50 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-2">
              {stats.averageReadingSpeed >= 50 ? 
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" /> : 
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
              }
              <span className="font-medium text-sm sm:text-base">Hız Hedefi</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">{stats.averageReadingSpeed}/50 sayfa/saat</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Book List Component
  const BookList = () => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-lg sm:text-xl font-semibold">Kitap Listem</h2>
        <button
          onClick={() => setShowBookForm(true)}
          className="bg-blue-600 text-white px-4 py-3 sm:py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Kitap Ekle
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map(book => (
          <div key={book.id} className="bg-white p-4 rounded-lg border">
            <div className="flex justify-between items-start mb-3">
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
            <h3 className="font-semibold text-sm sm:text-base mb-1">{book.title}</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-2">{book.author}</p>
            <p className="text-xs sm:text-sm text-gray-600 mb-3">{book.category}</p>
            
            <div className="mb-4">
              <div className="flex justify-between text-xs sm:text-sm mb-1">
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
            
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => {
                  setNewSession({ ...newSession, bookId: book.id });
                  setShowSessionForm(true);
                }}
                className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
              >
                Oturum Ekle
              </button>
              <button
                onClick={() => setBooks(books.filter(b => b.id !== book.id))}
                className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 sm:w-auto"
              >
                <Trash2 className="h-4 w-4 mx-auto" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Book Modal */}
      {showBookForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-t-lg sm:rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4">Yeni Kitap Ekle</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Kitap Adı"
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  className="w-full p-3 border rounded-lg text-base"
                />
                <input
                  type="text"
                  placeholder="Yazar"
                  value={newBook.author}
                  onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                  className="w-full p-3 border rounded-lg text-base"
                />
                <input
                  type="number"
                  placeholder="Toplam Sayfa"
                  value={newBook.totalPages}
                  onChange={(e) => setNewBook({ ...newBook, totalPages: e.target.value })}
                  className="w-full p-3 border rounded-lg text-base"
                />
                <input
                  type="text"
                  placeholder="Kategori"
                  value={newBook.category}
                  onChange={(e) => setNewBook({ ...newBook, category: e.target.value })}
                  className="w-full p-3 border rounded-lg text-base"
                />
                <select
                  value={newBook.priority}
                  onChange={(e) => setNewBook({ ...newBook, priority: e.target.value })}
                  className="w-full p-3 border rounded-lg text-base"
                >
                  <option value="low">Düşük Öncelik</option>
                  <option value="medium">Orta Öncelik</option>
                  <option value="high">Yüksek Öncelik</option>
                </select>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button onClick={addBook} className="flex-1 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700">
                  Ekle
                </button>
                <button onClick={() => setShowBookForm(false)} className="flex-1 bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-700">
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Session Modal */}
      {showSessionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-t-lg sm:rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4">Okuma Oturumu Ekle</h3>
              <div className="space-y-4">
                <select
                  value={newSession.bookId || ''}
                  onChange={(e) => setNewSession({ ...newSession, bookId: parseInt(e.target.value) })}
                  className="w-full p-3 border rounded-lg text-base"
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
                  className="w-full p-3 border rounded-lg text-base"
                />
                <input
                  type="number"
                  placeholder="Okuma Süresi (dakika)"
                  value={newSession.minutes}
                  onChange={(e) => setNewSession({ ...newSession, minutes: e.target.value })}
                  className="w-full p-3 border rounded-lg text-base"
                />
                <input
                  type="date"
                  value={newSession.date}
                  onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                  className="w-full p-3 border rounded-lg text-base"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button onClick={addReadingSession} className="flex-1 bg-green-600 text-white p-3 rounded-lg hover:bg-green-700">
                  Ekle
                </button>
                <button onClick={() => setShowSessionForm(false)} className="flex-1 bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-700">
                  İptal
                </button>
              </div>
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
      <div className="space-y-4 sm:space-y-6">
        <h2 className="text-lg sm:text-xl font-semibold">İstatistikler ve Analizler</h2>
        
        {/* Overall Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-3 sm:p-4 rounded-lg border">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600">Toplam Kitap</h3>
            <p className="text-lg sm:text-2xl font-bold">{books.length}</p>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg border">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600">Tamamlanan</h3>
            <p className="text-lg sm:text-2xl font-bold">{books.filter(b => b.status === 'completed').length}</p>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg border">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600">Toplam Sayfa</h3>
            <p className="text-lg sm:text-2xl font-bold">{stats.totalPages}</p>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg border">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600">Toplam Süre</h3>
            <p className="text-lg sm:text-2xl font-bold">{Math.round(stats.totalReadingTime / 60)}sa</p>
          </div>
        </div>

        {/* Reading Speed Chart */}
        <div className="bg-white p-4 sm:p-6 rounded-lg border">
          <h3 className="text-base sm:text-lg font-semibold mb-4">Okuma Hızı Gelişimi</h3>
          <div className="h-48 sm:h-64 flex items-end justify-between gap-1 sm:gap-2 overflow-x-auto">
            {chartData.slice(-10).map((data, index) => (
              <div key={index} className="flex flex-col items-center min-w-0">
                <div 
                  className="bg-blue-600 w-4 sm:w-8 rounded-t transition-all duration-300"
                  style={{ height: `${Math.min((data.speed / 100) * 150, 150)}px` }}
                ></div>
                <span className="text-xs mt-2 text-gray-600 transform -rotate-45 origin-top-left whitespace-nowrap">
                  {new Date(data.date).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-2 text-center">Günlük okuma hızı (sayfa/saat)</p>
        </div>

        {/* Category Analysis */}
        <div className="bg-white p-4 sm:p-6 rounded-lg border">
          <h3 className="text-base sm:text-lg font-semibold mb-4">Kategori Analizi</h3>
          <div className="space-y-3">
            {Object.entries(
              books.reduce((acc, book) => {
                acc[book.category] = (acc[book.category] || 0) + 1;
                return acc;
              }, {})
            ).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="font-medium text-sm sm:text-base">{category}</span>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-16 sm:w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(count / books.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-600 w-6">{count}</span>
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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-lg sm:text-xl font-semibold">Hedeflerim</h2>
        <button
          onClick={() => setShowGoalForm(true)}
          className="bg-blue-600 text-white px-4 py-3 sm:py-2 rounded-lg hover:bg-blue-700 w-full sm:w-auto"
        >
          Hedef Düzenle
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-lg border">
          <h3 className="text-base sm:text-lg font-semibold mb-4">Aylık Hedefler</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2 text-sm sm:text-base">
                <span>Kitap Sayısı</span>
                <span>{stats.monthlyBooks}/{goals.monthly.books}</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2 sm:h-3">
                <div 
                  className="bg-blue-600 h-2 sm:h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((stats.monthlyBooks / goals.monthly.books) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2 text-sm sm:text-base">
                <span>Sayfa Sayısı</span>
                <span>{stats.monthlyPages}/{goals.monthly.pages}</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2 sm:h-3">
                <div 
                  className="bg-green-600 h-2 sm:h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((stats.monthlyPages / goals.monthly.pages) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg border">
          <h3 className="text-base sm:text-lg font-semibold mb-4">Haftalık Hedefler</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2 text-sm sm:text-base">
                <span>Kitap Sayısı</span>
                <span>{stats.weeklyBooks}/{goals.weekly.books}</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2 sm:h-3">
                <div 
                  className="bg-blue-600 h-2 sm:h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((stats.weeklyBooks / goals.weekly.books) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2 text-sm sm:text-base">
                <span>Sayfa Sayısı</span>
                <span>{stats.weeklyPages}/{goals.weekly.pages}</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2 sm:h-3">
                <div 
                  className="bg-green-600 h-2 sm:h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((stats.weeklyPages / goals.weekly.pages) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PWA ve Bildirim Ayarları */}
      <div className="bg-white p-4 sm:p-6 rounded-lg border">
        <h3 className="text-base sm:text-lg font-semibold mb-4">Uygulama Ayarları</h3>
        
        {/* PWA Kurulum */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0">
              <span className="font-medium text-sm sm:text-base">📱 Mobil Uygulama Kurulumu</span>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {isInstalled ? 
                  'Uygulama başarıyla kuruldu! Artık offline kullanabilirsiniz.' :
                  isInstallable ?
                  'Uygulamayı cihazınıza kurabilirsiniz' :
                  getInstallInstructions()
                }
              </p>
            </div>
            {isInstallable && (
              <button
                onClick={installApp}
                className="bg-blue-600 text-white px-4 py-3 sm:py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Download className="h-4 w-4" />
                Kur
              </button>
            )}
            {isInstalled && (
              <div className="text-green-600 flex items-center gap-2 justify-center sm:justify-start">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm sm:text-base">Kurulu</span>
              </div>
            )}
          </div>
        </div>

        {/* Bildirim Ayarları */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0">
              <span className="font-medium text-sm sm:text-base">🔔 Günlük Okuma Hatırlatıcıları</span>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {notificationPermission === 'granted' ? 
                  notifications ? 'Aktif - Her gün saat 20:00\'da bildirim' :
                  'İzin var ama hatırlatıcılar kapalı' :
                  notificationPermission === 'denied' ?
                  'Bildirimler engellendi' :
                  'Bildirim izni verilmedi'
                }
              </p>
            </div>
            <div className="flex items-center gap-3">
              {notificationPermission !== 'granted' && (
                <button
                  onClick={requestNotificationPermission}
                  className="bg-orange-600 text-white px-3 py-2 rounded text-sm hover:bg-orange-700 flex items-center gap-1"
                >
                  <Bell className="h-4 w-4" />
                  İzin Ver
                </button>
              )}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications && notificationPermission === 'granted'}
                  onChange={(e) => setNotifications(e.target.checked)}
                  disabled={notificationPermission !== 'granted'}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
              </label>
            </div>
          </div>
          
          {/* Bildirim Troubleshooting */}
          {notificationPermission === 'denied' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <h4 className="font-medium text-red-800 mb-2 text-sm">Bildirimler Nasıl Açılır?</h4>
              <ul className="text-xs text-red-700 space-y-1">
                <li>• Chrome: Adres çubuğundaki kilit ikonuna tıklayın → Bildirimler → İzin Ver</li>
                <li>• Firefox: Adres çubuğundaki kalkan ikonuna tıklayın → İzinler → Bildirimler</li>
                <li>• Safari: Safari → Tercihler → Web Siteleri → Bildirimler</li>
              </ul>
            </div>
          )}
          
          {notificationPermission === 'granted' && (
            <div className="space-y-3">
              <button
                onClick={sendTestNotification}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded hover:bg-gray-200 text-sm"
              >
                🧪 Test Bildirimi Gönder
              </button>
              
              {/* Bildirim Debug Bilgileri */}
              <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  <div>Bildirim Durumu: {notificationPermission}</div>
                  <div>Tarayıcı Desteği: {'Notification' in window ? 'Var' : 'Yok'}</div>
                  <div>Service Worker: {navigator.serviceWorker ? 'Aktif' : 'Yok'}</div>
                  <div>HTTPS: {window.location.protocol === 'https:' || window.location.hostname === 'localhost' ? 'OK' : 'Gerekli'}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Goal Form Modal */}
      {showGoalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-t-lg sm:rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4">Hedefleri Düzenle</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Aylık Kitap Hedefi</label>
                  <input
                    type="number"
                    value={goals.monthly.books}
                    onChange={(e) => setGoals({
                      ...goals,
                      monthly: { ...goals.monthly, books: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full p-3 border rounded-lg text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Aylık Sayfa Hedefi</label>
                  <input
                    type="number"
                    value={goals.monthly.pages}
                    onChange={(e) => setGoals({
                      ...goals,
                      monthly: { ...goals.monthly, pages: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full p-3 border rounded-lg text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Haftalık Kitap Hedefi</label>
                  <input
                    type="number"
                    value={goals.weekly.books}
                    onChange={(e) => setGoals({
                      ...goals,
                      weekly: { ...goals.weekly, books: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full p-3 border rounded-lg text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Haftalık Sayfa Hedefi</label>
                  <input
                    type="number"
                    value={goals.weekly.pages}
                    onChange={(e) => setGoals({
                      ...goals,
                      weekly: { ...goals.weekly, pages: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full p-3 border rounded-lg text-base"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button onClick={() => setShowGoalForm(false)} className="flex-1 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700">
                  Kaydet
                </button>
                <button onClick={() => setShowGoalForm(false)} className="flex-1 bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-700">
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
              <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                <span className="hidden sm:inline">Kitap Okuma Planlayıcısı</span>
                <span className="sm:hidden">Kitap Planlayıcı</span>
              </h1>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              {/* PWA Kurulum Butonu */}
              {isInstallable && (
                <button
                  onClick={installApp}
                  className="bg-green-600 text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm hover:bg-green-700 flex items-center gap-1"
                  title="Uygulamayı telefonunuza kurun"
                >
                  <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden lg:inline">Kur</span>
                </button>
              )}
              
              {/* Kurulu olduğunu gösteren bilgi */}
              {isInstalled && (
                <div className="bg-green-100 text-green-800 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden lg:inline">Kurulu</span>
                </div>
              )}
              
              {/* Bildirim Durumu */}
              {notificationPermission === 'granted' && (
                <div className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm flex items-center gap-1">
                  <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden lg:inline">Aktif</span>
                </div>
              )}
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              
              <div className="hidden lg:block text-xs sm:text-sm text-gray-600">
                {new Date().toLocaleDateString('tr-TR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-3 sm:px-4">
            <div className="grid grid-cols-2 gap-2 py-3">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                { id: 'books', label: 'Kitaplarım', icon: BookOpen },
                { id: 'statistics', label: 'İstatistikler', icon: TrendingUp },
                { id: 'goals', label: 'Hedefler', icon: Target }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-center gap-2 py-3 px-2 rounded-lg font-medium text-sm ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Navigation */}
      <nav className="hidden lg:block bg-white border-b">
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
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'books' && <BookList />}
        {activeTab === 'statistics' && <Statistics />}
        {activeTab === 'goals' && <Goals />}
      </main>
    </div>
  );
};

export default BookReadingPlanner;