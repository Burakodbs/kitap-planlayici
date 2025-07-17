import React from 'react';
import { BookOpen } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message = 'Yükleniyor...',
  fullScreen = true,
}) => {
  const spinner = (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className={`${sizeClasses[size]} animate-spin text-blue-600`}>
          <BookOpen className="h-full w-full" />
        </div>
        <div className="absolute inset-0 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
      
      {message && (
        <p className="text-gray-600 text-sm font-medium animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (!fullScreen) {
    return (
      <div className="flex justify-center py-8">
        {spinner}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50">
      <div className="text-center">
        {spinner}
        
        <div className="mt-8 space-y-2">
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          
          <p className="text-xs text-gray-500">
            Kitap Planlayıcınız hazırlanıyor...
          </p>
        </div>
      </div>
    </div>
  );
};

// Inline Loading Spinner for buttons, etc.
export const InlineSpinner: React.FC<{ className?: string }> = ({ className = "h-4 w-4" }) => (
  <div className={`animate-spin border-2 border-gray-300 border-t-current rounded-full ${className}`} />
);