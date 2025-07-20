import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, X, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-500',
    textColor: 'text-white',
    borderColor: 'border-green-600',
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-500',
    textColor: 'text-white',
    borderColor: 'border-red-600',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-orange-500',
    textColor: 'text-white',
    borderColor: 'border-orange-600',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-500',
    textColor: 'text-white',
    borderColor: 'border-blue-600',
  },
};

const positionClasses = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
};

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 5000,
  onClose,
  position = 'top-right',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [progressWidth, setProgressWidth] = useState(100);

  const config = toastConfig[type];
  const Icon = config.icon;

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300); // Match exit animation duration
  }, [onClose]);

  useEffect(() => {
    // Trigger entrance animation
    const showTimer = setTimeout(() => setIsVisible(true), 10);
    
    // Start progress bar animation
    const progressTimer = setTimeout(() => {
      setProgressWidth(0);
    }, 100);
    
    // Auto-hide after duration
    const hideTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(progressTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, handleClose]);

  const progressBarStyle: React.CSSProperties = {
    width: `${progressWidth}%`,
    transition: `width ${duration}ms linear`,
  };

  return (
    <div
      className={`fixed z-50 ${positionClasses[position]} transition-all duration-300 ease-in-out ${
        isVisible && !isExiting
          ? 'opacity-100 transform translate-y-0 scale-100'
          : 'opacity-0 transform translate-y-2 scale-95'
      }`}
    >
      <div
        className={`
          ${config.bgColor} ${config.textColor} ${config.borderColor}
          border-l-4 rounded-r-lg shadow-lg min-w-72 max-w-96
          backdrop-blur-sm bg-opacity-95
        `}
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Icon className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium leading-relaxed">
              {message}
            </p>
          </div>
          
          <button
            onClick={handleClose}
            className="ml-4 flex-shrink-0 p-1 rounded-full hover:bg-black hover:bg-opacity-20 transition-colors"
            aria-label="Bildirimi kapat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="h-1 bg-black bg-opacity-20">
          <div
            className="h-full bg-white bg-opacity-30"
            style={progressBarStyle}
          />
        </div>
      </div>
    </div>
  );
};

// Toast Manager Hook
interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: ToastType = 'info', duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration + buffer
    setTimeout(() => {
      removeToast(id);
    }, duration + 500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (message: string, duration?: number) => showToast(message, 'success', duration);
  const showError = (message: string, duration?: number) => showToast(message, 'error', duration);
  const showWarning = (message: string, duration?: number) => showToast(message, 'warning', duration);
  const showInfo = (message: string, duration?: number) => showToast(message, 'info', duration);

  const ToastContainer: React.FC = () => (
    <>
      {toasts.map((toast, _index) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
          position="top-right"
        />
      ))}
    </>
  );

  return {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    ToastContainer,
  };
};