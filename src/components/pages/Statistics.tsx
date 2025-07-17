import React, { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, Clock, BookOpen, Calendar, Award } from 'lucide-react';
import { Book } from '../../types';
import { calculateReadingStats, getReadingSpeedData, formatDuration } from '../../utils';

interface StatisticsProps {
  books: Book[];
  getBooksByCategory: () => Record<string, number>;
}

export const Statistics: React.FC<StatisticsProps> = ({
  books,
  getBooksByCategory,
}) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year' | 'all'>('month');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const stats = calculateReadingStats(books);
  const categoryStats = getBooksByCategory();
  const readingSpeedData = getReadingSpeedData(books);

  // Filter data based on time range
  const filteredData = useMemo(() => {
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (timeRange) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
      default:
        cutoffDate.setFullYear(1900); // Include all data
        break;
    }

    return books.filter(book => {
      if (!book.readingSessions || book.readingSessions.length === 0) return false;
      
      const hasRecentSession = book.readingSessions.some(session => 
        new Date(session.date) >= cutoffDate
      );
      
      if (selectedCategory !== 'all' && book.category !== selectedCategory) {
        return false;
      }
      
      return hasRecentSession;
    });
  }, [books, timeRange, selectedCategory]);

  // Calculate filtered stats
  const filteredStats = calculateReadingStats(filteredData);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    description?: string;
  }> = ({ title, value, icon: Icon, color, description }) => (
    <div className="bg-white p-4 sm:p-6 rounded-lg border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
          {description && (
            <p className="text-xs sm:text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
        </div>
      </div>
    </div>
  );

  const ReadingSpeedChart: React.FC = () => {
    const chartData = readingSpeedData.slice(-20); // Last 20 sessions
    const maxSpeed = Math.max(...chartData.map(d => d.speed), 50);
    
    if (chartData.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>Henüz okuma verisi yok</p>
          </div>
        </div>
      );
    }

    return (
      <div className="h-64 sm:h-80 flex items-end justify-between gap-1 sm:gap-2 overflow-x-auto pb-4">
        {chartData.map((data, index) => {
          const height = Math.max((data.speed / maxSpeed) * 250, 10);
          const date = new Date(data.date);
          
          return (
            <div key={index} className="flex flex-col items-center min-w-0">
              <div
                className="bg-gradient-to-t from-blue-600 to-blue-400 w-4 sm:w-6 rounded-t transition-all duration-300 hover:from-blue-700 hover:to-blue-500 cursor-pointer group relative"
                style={{ height: `${height}px` }}
                title={`${data.speed.toFixed(1)} sayfa/saat - ${date.toLocaleDateString('tr-TR')}`}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {data.speed.toFixed(1)} s/sa
                  <br />
                  {data.pages} sayfa / {data.minutes}dk
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-800"></div>
                </div>
              </div>
              <span className="text-xs mt-2 text-gray-600 transform -rotate-45 origin-top-left whitespace-nowrap">
                {date.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const CategoryChart: React.FC = () => {
    const categories = Object.entries(categoryStats).sort((a, b) => b[1] - a[1]);
    const maxCount = Math.max(...Object.values(categoryStats), 1);

    if (categories.length === 0) {
      return (
        <div className="text-center py-8">
          <BookOpen className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p className="text-gray-500">Henüz kategorize edilmiş kitap yok</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {categories.map(([category, count]) => {
          const percentage = (count / books.length) * 100;
          const barWidth = (count / maxCount) * 100;
          
          return (
            <div key={category} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700 text-sm sm:text-base">
                  {category}
                </span>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{count} kitap</span>
                  <span className="text-xs">({percentage.toFixed(1)}%)</span>
                </div>
              </div>
              <div className="bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const ReadingHabitsAnalysis: React.FC = () => {
    // Analyze reading patterns
    const allSessions = books.flatMap(book => book.readingSessions || []);
    const dayOfWeekStats = Array(7).fill(0);
    const hourStats = Array(24).fill(0);
    
    allSessions.forEach(session => {
      const date = new Date(session.date);
      dayOfWeekStats[date.getDay()]++;
      
      // Assume reading happens in the evening if no time specified
      const hour = 19; // Default to 7 PM
      hourStats[hour] += session.minutes;
    });

    const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const mostActiveDay = dayNames[dayOfWeekStats.indexOf(Math.max(...dayOfWeekStats))];
    const totalSessions = allSessions.length;
    const averageSessionLength = totalSessions > 0 
      ? allSessions.reduce((sum, s) => sum + s.minutes, 0) / totalSessions 
      : 0;

    return (
      <div className="space-y-6">
        {/* Reading Insights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">📅 En Aktif Gün</h4>
            <p className="text-blue-700">{mostActiveDay}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">⏱️ Ortalama Oturum</h4>
            <p className="text-green-700">{formatDuration(averageSessionLength)}</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">📊 Toplam Oturum</h4>
            <p className="text-purple-700">{totalSessions} oturum</p>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="font-medium text-orange-900 mb-2">🎯 Tamamlama Oranı</h4>
            <p className="text-orange-700">
              {books.length > 0 ? ((books.filter(b => b.status === 'completed').length / books.length) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>

        {/* Weekly Pattern */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Haftalık Okuma Dağılımı</h4>
          <div className="grid grid-cols-7 gap-2">
            {dayNames.map((day, index) => {
              const count = dayOfWeekStats[index];
              const maxCount = Math.max(...dayOfWeekStats, 1);
              const height = (count / maxCount) * 60 + 20;
              
              return (
                <div key={day} className="text-center">
                  <div className="flex items-end justify-center h-20">
                    <div
                      className="bg-blue-500 w-full rounded-t transition-all duration-300"
                      style={{ height: `${height}px` }}
                      title={`${count} oturum`}
                    />
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {day.slice(0, 3)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold">İstatistikler ve Analizler</h2>
          <p className="text-sm text-gray-600">Okuma alışkanlıklarınızı keşfedin</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="week">Son 1 Hafta</option>
            <option value="month">Son 1 Ay</option>
            <option value="year">Son 1 Yıl</option>
            <option value="all">Tüm Zamanlar</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tüm Kategoriler</option>
            {Object.keys(categoryStats).map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Toplam Kitap"
          value={books.length}
          icon={BookOpen}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Tamamlanan"
          value={books.filter(b => b.status === 'completed').length}
          icon={Award}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          title="Toplam Sayfa"
          value={stats.totalPages.toLocaleString('tr-TR')}
          icon={BarChart3}
          color="bg-purple-100 text-purple-600"
        />
        <StatCard
          title="Toplam Süre"
          value={`${Math.round(stats.totalReadingTime / 60)}sa`}
          icon={Clock}
          color="bg-orange-100 text-orange-600"
          description={formatDuration(stats.totalReadingTime)}
        />
      </div>

      {/* Filtered Period Stats */}
      {timeRange !== 'all' && (
        <div className="bg-white p-4 sm:p-6 rounded-lg border">
          <h3 className="text-base sm:text-lg font-semibold mb-4">
            {timeRange === 'week' && 'Son 1 Hafta'}
            {timeRange === 'month' && 'Son 1 Ay'}
            {timeRange === 'year' && 'Son 1 Yıl'} Özeti
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{filteredStats.monthlyPages}</p>
              <p className="text-xs sm:text-sm text-gray-600">Sayfa</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{filteredStats.monthlyBooks}</p>
              <p className="text-xs sm:text-sm text-gray-600">Kitap</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{filteredStats.averageReadingSpeed}</p>
              <p className="text-xs sm:text-sm text-gray-600">Sayfa/Saat</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {Math.round(filteredStats.totalReadingTime / 60)}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">Saat</p>
            </div>
          </div>
        </div>
      )}

      {/* Reading Speed Chart */}
      <div className="bg-white p-4 sm:p-6 rounded-lg border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Okuma Hızı Gelişimi
          </h3>
          <div className="text-sm text-gray-600">
            Ortalama: {stats.averageReadingSpeed} sayfa/saat
          </div>
        </div>
        
        <ReadingSpeedChart />
        
        <p className="text-xs sm:text-sm text-gray-600 mt-4 text-center">
          Son 20 okuma oturumunuza göre günlük okuma hızınız (sayfa/saat)
        </p>
      </div>

      {/* Category Analysis */}
      <div className="bg-white p-4 sm:p-6 rounded-lg border">
        <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Kategori Analizi
        </h3>
        
        <CategoryChart />
      </div>

      {/* Reading Habits Analysis */}
      <div className="bg-white p-4 sm:p-6 rounded-lg border">
        <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Okuma Alışkanlıkları
        </h3>
        
        <ReadingHabitsAnalysis />
      </div>

      {/* Performance Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 sm:p-6 rounded-lg border">
        <h3 className="text-base sm:text-lg font-semibold mb-4">📈 Performans Öngörüleri</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Güçlü Yönler</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              {stats.averageReadingSpeed > 40 && (
                <li>• Hızlı okuma yeteneğiniz gelişmiş</li>
              )}
              {books.filter(b => b.status === 'completed').length > 0 && (
                <li>• Kitapları tamamlama konusunda başarılısınız</li>
              )}
              {books.length > 5 && (
                <li>• Çeşitli kitaplar okuma alışkanlığınız var</li>
              )}
              {Object.keys(categoryStats).length > 3 && (
                <li>• Farklı kategorilerde okuma deneyiminiz zengin</li>
              )}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Gelişim Alanları</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              {stats.averageReadingSpeed < 30 && (
                <li>• Okuma hızınızı artırabilirsiniz</li>
              )}
              {books.filter(b => b.status === 'reading').length > 3 && (
                <li>• Aynı anda çok fazla kitap okuyorsunuz</li>
              )}
              {books.filter(b => b.status === 'to-read').length > books.filter(b => b.status === 'completed').length && (
                <li>• Okuma listenizi tamamlama oranınızı artırabilirsiniz</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};