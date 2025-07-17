import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // logErrorToService(error, errorInfo);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-red-100 p-3">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </div>
              
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                Bir şeyler ters gitti
              </h1>
              
              <p className="text-gray-600 mb-6">
                Beklenmeyen bir hata oluştu. Uygulamayı yeniden başlatmayı deneyin.
              </p>

              {process.env.NODE_ENV === 'development' && (
                <details className="text-left mb-4 p-3 bg-gray-100 rounded text-sm">
                  <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                    Hata Detayları (Geliştirici)
                  </summary>
                  <div className="space-y-2">
                    <div>
                      <strong>Hata:</strong>
                      <pre className="mt-1 text-xs text-red-600 whitespace-pre-wrap">
                        {this.state.error?.message}
                      </pre>
                    </div>
                    <div>
                      <strong>Stack Trace:</strong>
                      <pre className="mt-1 text-xs text-gray-600 whitespace-pre-wrap">
                        {this.state.error?.stack}
                      </pre>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 text-xs text-gray-600 whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="space-y-3">
                <button
                  onClick={this.handleReset}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Tekrar Dene
                </button>
                
                <button
                  onClick={this.handleReload}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Sayfayı Yenile
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Sorun devam ederse, tarayıcınızın cache'ini temizleyip tekrar deneyin.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}