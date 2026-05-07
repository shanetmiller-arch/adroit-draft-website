// ADROIT Draft Website - Performance Monitoring & Optimization Module
// Phase 1: scaffold - basic performance foundation
// Phase 2: core content - extended performance metrics

const Performance = {
  // Performance budget limits
  budgets: {
    largestContentfulPaint: 2500, // ms
    firstInputDelay: 100, // ms
    timeToFirstByte: 800, // ms
    totalBlockingTime: 300, // ms
    cumulativeLayoutShift: 0.1
  },

  // Metrics collected during session
  metrics: {
    lcp: null,
    fid: null,
    fcp: null,
    ttfb: null,
    cls: null,
    tbt: null,
    loadTime: null,
    domContentLoaded: null,
    firstPaint: null
  },

  // Initialize performance monitoring
  init() {
    // Set up paint timing
    this._setupPaintTiming();

    // Set up LCP monitoring
    this._setupLCPSampling();

    // Set up input monitoring
    this._setupInputMonitoring();

    // Set up layout shift monitoring
    this._setupCLS();

    // Set up load timing
    this._setupLoadTiming();

    // Set up performance budget checks
    this._setupBudgetChecks();

    // Set up resource timing
    this._setupResourceTiming();

    console.debug('Performance monitoring initialized');
  },

  // Setup paint timing observation
  _setupPaintTiming() {
    if (window PerformanceObserver) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-paint') {
            this.metrics.firstPaint = entry.startTime;
          }
        });
      });

      try {
        observer.observe({ entryTypes: ['paint'] });
      } catch (e) {
        console.debug('Paint timing observer not supported');
      }
    }
  },

  // Setup LCP (Largest Contentful Paint) monitoring
  _setupLCPSampling() {
    if (window PerformanceObserver) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.hadRecentInput) return;

          if (this.metrics.lcp === null || entry.startTime > this.metrics.lcp) {
            this.metrics.lcp = entry.startTime;
          }
        });
      });

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.debug('LCP observer not supported');
      }
    }
  },

  // Setup First Input Delay monitoring
  _setupInputMonitoring() {
    let isInputPending = false;

    // Track first input delay
    window.addEventListener('mousedown', () => {
      isInputPending = true;
    });

    window.addEventListener('touchstart', () => {
      isInputPending = true;
    });

    window.addEventListener('keydown', () => {
      isInputPending = true;
    });

    const checkFID = () => {
      if (isInputPending) {
        this.metrics.fid = performance.now();
      }

      setTimeout(checkFID, 50);
    };

    checkFID();
  },

  // Setup Cumulative Layout Shift monitoring
  _setupCLS() {
    if (window PerformanceObserver) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.hadRecentInput) return;

          if (this.metrics.cls === null || entry.value > this.metrics.cls) {
            this.metrics.cls = entry.value;
          }
        });
      });

      try {
        observer.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.debug('CLS observer not supported');
      }
    }
  },

  // Setup load timing
  _setupLoadTiming() {
    // Time to first byte
    const startTime = performance.timing ? performance.timing.connectEnd : Date.now();
    
    const measureTTFB = () => {
      const now = performance.timing ? performance.timing.connectEnd : Date.now();
      this.metrics.ttfb = now - startTime;
    };

    if (window.performance && window.performance.getEntriesByType) {
      window.performance.getEntriesByType('resource').forEach((entry) => {
        if (entry.name.endsWith('.html')) {
          this.metrics.ttfb = entry.responseStart - entry.requestStart;
        }
      });
    }

    // DOMContentLoaded
    window.addEventListener('DOMContentLoaded', () => {
      this.metrics.domContentLoaded = Date.now() - (startTime || 0);
    });

    // Load complete
    window.addEventListener('load', () => {
      this.metrics.loadTime = Date.now() - (startTime || 0);
    });
  },

  // Setup resource timing for external resources
  _setupResourceTiming() {
    if (window.performance && window.performance.getEntriesByType) {
      window.addEventListener('load', () => {
        const resources = window.performance.getEntriesByType('resource');
        resources.forEach((resource) => {
          if (resource.initiatorType === 'fetch') {
            this._logResourceMetric(resource);
          }
        });
      });
    }
  },

  // Log resource metrics
  _logResourceMetric(resource) {
    const metrics = {
      name: resource.name,
      duration: resource.duration,
      transferSize: resource.transferSize,
      encodedBodySize: resource.encodedBodySize,
      decodedBodySize: resource.decodedBodySize
    };

    console.debug('[Performance] Resource:', metrics);
  },

  // Check performance budgets
  _setupBudgetChecks() {
    const budgets = this.budgets;

    const checkBudget = (metric, budget, name) => {
      if (this.metrics[metric] !== null && this.metrics[metric] > budget) {
        const warning = `[Performance Budget] ${name}: ${this.metrics[metric].toFixed(0)}ms exceeded budget of ${budget}ms`;
        console.warn(warning);
      }
    };

    // Check LCP
    setInterval(() => {
      if (this.metrics.lcp !== null) {
        checkBudget('lcp', budgets.largestContentfulPaint, 'LCP');
      }
    }, 1000);

    // Check FID (check immediately on input)
    this.metrics.fid = this.metrics.fid || 0;
    if (this.metrics.fid > budgets.firstInputDelay) {
      console.warn(`[Performance Budget] FID: ${this.metrics.fid.toFixed(0)}ms exceeded budget of ${budgets.firstInputDelay}ms`);
    }

    // Check CLS
    if (this.metrics.cls !== null && this.metrics.cls > budgets.cumulativeLayoutShift) {
      console.warn(`[Performance Budget] CLS: ${this.metrics.cls.toFixed(3)} exceeded budget of ${budgets.cumulativeLayoutShift}`);
    }

    // Check TTFB
    if (this.metrics.ttfb !== null && this.metrics.ttfb > budgets.timeToFirstByte) {
      console.warn(`[Performance Budget] TTFB: ${this.metrics.ttfb.toFixed(0)}ms exceeded budget of ${budgets.timeToFirstByte}ms`);
    }
  },

  // Get current performance metrics
  getMetrics() {
    return {
      ...this.metrics,
      timestamp: Date.now()
    };
  },

  // Save metrics to storage
  saveMetrics() {
    try {
      localStorage.setItem('adroit_performance_metrics', JSON.stringify(this.getMetrics()));
      return true;
    } catch (e) {
      console.error('Failed to save performance metrics:', e);
      return false;
    }
  },

  // Load metrics from storage
  loadMetrics() {
    try {
      const stored = localStorage.getItem('adroit_performance_metrics');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load performance metrics:', e);
    }
    return null;
  },

  // Clear performance metrics
  clearMetrics() {
    this.metrics = {
      lcp: null,
      fid: null,
      fcp: null,
      ttfb: null,
      cls: null,
      tbt: null,
      loadTime: null,
      domContentLoaded: null,
      firstPaint: null
    };
    localStorage.removeItem('adroit_performance_metrics');
  },

  // Optimized image loading with lazy loading
  lazyLoadImage(imgElement, options = {}) {
    const { container, callback, threshold = 0.1 } = options;

    if (imgElement.complete) {
      if (callback) callback(imgElement);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          imgElement.src = imgElement.dataset.src || imgElement.src;
          imgElement.dataset.src = null;
          
          if (callback) callback(imgElement);
          
          observer.unobserve(imgElement);
        }
      });
    }, { threshold });

    observer.observe(imgElement);
  },

  // Optimized loading for above-fold images
  loadAboveFoldImages(selector) {
    const images = document.querySelectorAll(selector);
    images.forEach(img => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.dataset.src = null;
      }
    });
  },

  // Debounce utility for scroll events
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle utility for scroll events
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Performance;
}
