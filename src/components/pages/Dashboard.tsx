import React from 'react';
import { BookOpen, Target, Flame, TrendingUp, Trophy, CheckCircle, Clock } from 'lucide-react';
import { Book, Goals, BookStatus } from '../../types';
import { calculateReadingStats, calculateProgress } from '../../utils';
import { MILESTONE_THRESHOLDS } from '../../constants';

interface DashboardProps {
  books: Book[];
  goals: Goals;
  getBooksByStatus: (status: BookStatus) => Book[];
}

export const Dashboard: React.FC<DashboardProps> = ({
  books,
  goals,
  getBooksByStatus,
}) => {
  const stats = calculateReadingStats(books);
  const currentlyReading = getBooksByStatus('reading');

  // Calculate reading streak (mock for now - would be calculated from actual reading data)
  const readingStreak = 4; // This should come from a proper calculation

  const StatCard: React.FC<{
    title: string;
    value: number;
    target?: number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    unit?: string;
  }> = ({ title, value, target, icon: Icon, color, unit = '' }) => {
    const progress = target ? calculateProgress(value, target) : 100;
    
    return (
      <div className={`${color} p-3 sm:p-4 rounded-lg border`}>
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium truncate opacity-75">
              {title}
            </p>
            <p className="text-lg sm:text-2xl font-bold">
              {value}{unit}
            </p>
            {target && (
              <p className="text-xs opacity-75">
                {target} hedef
              </p>
            )}
          </div>
          <Icon className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0 opacity-75" />
        </div>
        {target && (
          <div className="mt-2 bg-black bg-opacity-20 rounded-full h-1.5 sm:h-2">
            <div 
              className="bg-current h-1.5 sm:h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    );
  };

  const MilestoneCard: React.FC<{
    title: string;
    current: number;
    target: number;
    unit: string;
    achieved: boolean;
  }> = ({ title, current, target, unit, achieved }) => (
    <div className={`p-3 rounded-lg border-2 ${
      achieved ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-center gap-2">
        {achieved ? 
          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" /> : 
          <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
        }
        <span className="font-medium text-sm sm:text-base">{title}</span>
      </div>
      <p className="text-xs sm:text-sm text-gray-600 mt-1">
        {current}/{target} {unit}
      </p>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-2">
          Hoş Geldiniz! 📚
        </h1>
        <p className="text-blue-100 text-sm sm:text-base">
          {currentlyReading.length > 0 
            ? `${currentlyReading.length} kitap okuyorsunuz. Okuma hedefinize doğru ilerliyorsunuz!`
            : 'Yeni bir kitap ekleyerek okuma yolculuğunuza başlayın!'
          }
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Bu Ay Sayfa"
          value={stats.monthlyPages}
          target={goals.monthly.pages}
          icon={BookOpen}
          color="bg-blue-50 text-blue-900"
        />
        <StatCard
          title="Bu Ay Kitap"
          value={stats.monthlyBooks}
          target={goals.monthly.books}
          icon={Target}
          color="bg-green-50 text-green-900"
        />
        <StatCard
          title="Okuma Serisi"
          value={readingStreak}
          icon={Flame}
          color="bg-orange-50 text-orange-900"
          unit=" gün"
        />
        <StatCard
          title="Okuma Hızı"
          value={stats.averageReadingSpeed}
          icon={TrendingUp}
          color="bg-purple-50 text-purple-900"
          unit=" s/sa"
        />
      </div>

      {/* Currently Reading Section */}
      <div className="bg-white p-4 sm:p-6 rounded-lg border">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
          <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
          Şu Anda Okuduklarım
          {currentlyReading.length > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {currentlyReading.length}
            </span>
          )}
        </h3>
        
        <div className="space-y-3">
          {currentlyReading.length > 0 ? (
            currentlyReading.map((book) => {
              const progress = calculateProgress(book.currentPage, book.totalPages);
              const remainingPages = book.totalPages - book.currentPage;
              
              return (
                <div key={book.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-sm sm:text-base truncate">
                          {book.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {book.author}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ml-2 ${
                        book.priority === 'high' ? 'bg-red-100 text-red-800' :
                        book.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {book.priority === 'high' ? 'Yüksek' : 
                         book.priority === 'medium' ? 'Orta' : 'Düşük'}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span>İlerleme</span>
                        <span>{book.currentPage}/{book.totalPages} sayfa</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{Math.round(progress)}% tamamlandı</span>
                        <span>{remainingPages} sayfa kaldı</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm sm:text-base mb-4">
                Şu anda okuduğunuz kitap yok
              </p>
              <p className="text-xs sm:text-sm text-gray-400">
                Kitaplarım sekmesinden yeni bir kitap ekleyin ve okumaya başlayın!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Milestones and Achievements */}
      <div className="bg-white p-4 sm:p-6 rounded-lg border">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
          <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
          Başarılar & Milestone'lar
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <MilestoneCard
            title="Aylık Sayfa Hedefi"
            current={stats.monthlyPages}
            target={goals.monthly.pages}
            unit="sayfa"
            achieved={stats.monthlyPages >= goals.monthly.pages}
          />
          
          <MilestoneCard
            title="Haftalık Seri"
            current={readingStreak}
            target={7}
            unit="gün"
            achieved={readingStreak >= 7}
          />
          
          <MilestoneCard
            title="Hız Hedefi"
            current={stats.averageReadingSpeed}
            target={MILESTONE_THRESHOLDS.READING_SPEED_TARGET}
            unit="sayfa/saat"
            achieved={stats.averageReadingSpeed >= MILESTONE_THRESHOLDS.READING_SPEED_TARGET}
          />
        </div>

        {/* Achievement Summary */}
        <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">
                Bu Ay Toplam İlerleme
              </p>
              <p className="text-xs text-gray-600">
                {stats.monthlyBooks} kitap • {stats.monthlyPages} sayfa • {Math.round(stats.totalReadingTime / 60)} saat
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-green-600">
                {Math.round(calculateProgress(stats.monthlyPages, goals.monthly.pages))}%
              </p>
              <p className="text-xs text-gray-600">hedefe ulaşım</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-3 sm:p-4 rounded-lg border text-center">
          <p className="text-lg sm:text-2xl font-bold text-gray-900">{books.length}</p>
          <p className="text-xs sm:text-sm text-gray-600">Toplam Kitap</p>
        </div>
        
        <div className="bg-white p-3 sm:p-4 rounded-lg border text-center">
          <p className="text-lg sm:text-2xl font-bold text-green-600">
            {books.filter(b => b.status === 'completed').length}
          </p>
          <p className="text-xs sm:text-sm text-gray-600">Tamamlanan</p>
        </div>
        
        <div className="bg-white p-3 sm:p-4 rounded-lg border text-center">
          <p className="text-lg sm:text-2xl font-bold text-blue-600">{stats.totalPages}</p>
          <p className="text-xs sm:text-sm text-gray-600">Toplam Sayfa</p>
        </div>
        
        <div className="bg-white p-3 sm:p-4 rounded-lg border text-center">
          <p className="text-lg sm:text-2xl font-bold text-purple-600">
            {Math.round(stats.totalReadingTime / 60)}
          </p>
          <p className="text-xs sm:text-sm text-gray-600">Toplam Saat</p>
        </div>
      </div>
    </div>
  );
};