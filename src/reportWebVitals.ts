import { ReportHandler } from 'web-vitals';

// Type declaration for gtag (Google Analytics)
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

declare const gtag: (...args: any[]) => void;

const reportWebVitals = (onPerfEntry?: ReportHandler) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;

// Export individual metrics for more granular monitoring
export const getCLS = async (onPerfEntry: ReportHandler) => {
  const { getCLS } = await import('web-vitals');
  getCLS(onPerfEntry);
};

export const getFID = async (onPerfEntry: ReportHandler) => {
  const { getFID } = await import('web-vitals');
  getFID(onPerfEntry);
};

export const getFCP = async (onPerfEntry: ReportHandler) => {
  const { getFCP } = await import('web-vitals');
  getFCP(onPerfEntry);
};

export const getLCP = async (onPerfEntry: ReportHandler) => {
  const { getLCP } = await import('web-vitals');
  getLCP(onPerfEntry);
};

export const getTTFB = async (onPerfEntry: ReportHandler) => {
  const { getTTFB } = await import('web-vitals');
  getTTFB(onPerfEntry);
};

// Custom performance monitoring utilities
export const logPerformanceMetrics = (metric: any) => {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${metric.name}:`, metric.value, metric);
  }

  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', metric.name, {
        event_category: 'Web Vitals',
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_label: metric.id,
        non_interaction: true,
      });
    }

    // Example: Send to custom analytics service
    // analytics.track('performance_metric', {
    //   name: metric.name,
    //   value: metric.value,
    //   id: metric.id,
    //   delta: metric.delta,
    //   rating: metric.rating,
    // });
  }
};

export { reportWebVitals };