// ADROIT Draft Website - Performance Configuration
// Phase 1: scaffold - basic performance settings
// Phase 2: core content - extended performance optimization

const PerformanceConfig = {
  // Performance budgets (in milliseconds)
  budgets: {
    largestContentfulPaint: 2500,
    firstInputDelay: 100,
    timeToFirstByte: 800,
    totalBlockingTime: 300,
    cumulativeLayoutShift: 0.1,
    firstContentfulPaint: 1500,
    domContentLoaded: 2000,
    loadComplete: 3000
  },

  // Lazy loading thresholds
  lazyLoad: {
    threshold: 0.1,
    rootMargin: '200px',
    batchDelay: 100
  },

  // Scroll event throttling
  scrollThrottle: {
    interval: 100,
    debounce: 50
  },

  // Resource hints configuration
  resourceHints: {
    preload: ['styles.css'],
    preconnect: ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
    dnsPrefetch: []
  },

  // Image optimization
  images: {
    lazyLoad: true,
    aboveFold: false,
    webp: true,
    responsive: true
  },

  // Animation settings
  animations: {
    enabled: true,
    reducedMotion: true,
    hardwareAccelerated: true
  },

  // Monitoring settings
  monitoring: {
    enabled: true,
    logLevel: 'debug',
    sampleRate: 1.0,
    reportInterval: 1000
  },

  // Caching strategy
  caching: {
    staticAssets: 'max-age=31536000',
    dynamicAssets: 'max-age=3600',
    images: 'max-age=86400',
    fonts: 'max-age=31536000'
  },

  // Network optimization
  network: {
    disableCache: false,
    useServiceWorker: false,
    offlineSupport: false
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceConfig;
}
