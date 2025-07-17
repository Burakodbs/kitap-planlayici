import React, { useState, useEffect } from 'react';
import { ActiveTab } from './types';
import { useBooks } from './hooks/useBooks';
import { usePWA } from './hooks/usePWA';
import { useNotifications } from './hooks/useNotifications';
import { useGoals } from './hooks/useGoals';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './components/pages/Dashboard';
import { BookList } from './components/pages/BookList';
import { Statistics } from './components/pages/Statistics';
import { GoalsPage } from './components/pages/GoalsPage';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { Toast } from './components/ui/Toast';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Custom hooks
  const { 
    books, 
    loading: booksLoading, 
    error: booksError,
    addBook,
    updateBook,
    deleteBook,
    addReadingSession,
    getBooksByStatus,
    getBooksByCategory,
    clearError: clearBooksError
  } = useBooks();

  const {
    goals,
    loading: goalsLoading,
    updateGoals,
  } = useGoals();

  const {
    isInstallable,
    isInstalled,
    installApp,
    getInstallInstructions,
  } = usePWA();

  const {
    permission: notificationPermission,
    enabled: notificationsEnabled,
    requestPermission,
    sendTestNotification,
    toggleNotifications,
    error: notificationError,
  } = useNotifications();

  // Handle errors with toast messages
  useEffect(() => {
    if (booksError) {
      setToastMessage(booksError);
      clearBooksError();
    }
  }, [booksError, clearBooksError]);

  useEffect(() => {
    if (notificationError) {
      setToastMessage(notificationError);
    }
  }, [notificationError]);

  // Show loading spinner while essential data loads
  if (booksLoading || goalsLoading) {
    return <LoadingSpinner />;
  }

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            books={books}
            goals={goals}
            getBooksByStatus={getBooksByStatus}
          />
        );
      
      case 'books':
        return (
          <BookList
            books={books}
            onAddBook={addBook}
            onUpdateBook={updateBook}
            onDeleteBook={deleteBook}
            onAddSession={addReadingSession}
            showToast={showToast}
          />
        );
      
      case 'statistics':
        return (
          <Statistics
            books={books}
            getBooksByCategory={getBooksByCategory}
          />
        );
      
      case 'goals':
        return (
          <GoalsPage
            goals={goals}
            onUpdateGoals={updateGoals}
            isInstallable={isInstallable}
            isInstalled={isInstalled}
            onInstallApp={installApp}
            getInstallInstructions={getInstallInstructions}
            notificationPermission={notificationPermission}
            notificationsEnabled={notificationsEnabled}
            onRequestNotificationPermission={requestPermission}
            onToggleNotifications={toggleNotifications}
            onSendTestNotification={sendTestNotification}
            showToast={showToast}
          />
        );
      
      default:
        return <Dashboard books={books} goals={goals} getBooksByStatus={getBooksByStatus} />;
    }
  };

  return (
    <ErrorBoundary>
      <Layout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        onInstallApp={installApp}
        notificationPermission={notificationPermission}
        onRequestNotificationPermission={requestPermission}
      >
        {renderActivePage()}
      </Layout>
      
      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}
    </ErrorBoundary>
  );
};

export default App;