// ADROIT Draft Website - Analytics Data Storage
// Phase 1: scaffold - basic analytics foundation
// Phase 2: core content - extended analytics with detailed insights
// Privacy-focused: Local storage only, no PII collection

const AnalyticsData = {
  // Storage key
  storageKey: 'adroit_analytics_v1',
  
  // Initialize storage
  init() {
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify({
        version: '1.0',
        pageViews: [],
        interactions: []
      }));
    }
  },
  
  // Get analytics data
  getData() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('AnalyticsData: Failed to parse stored data', error);
      return null;
    }
  },
  
  // Save analytics data
  save(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('AnalyticsData: Failed to save data', error);
      return false;
    }
  },
  
  // Clear analytics data
  clear() {
    try {
      localStorage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      console.error('AnalyticsData: Failed to clear data', error);
      return false;
    }
  },
  
  // Get page views count
  getPageViewCount() {
    const data = this.getData();
    return data?.pageViews?.length || 0;
  },
  
  // Get interactions count
  getInteractionCount() {
    const data = this.getData();
    return data?.interactions?.length || 0;
  },
  
  // Get recent page views (last N)
  getRecentPageViews(n = 10) {
    const data = this.getData();
    return data?.pageViews?.slice(-n) || [];
  },
  
  // Get recent interactions (last N)
  getRecentInteractions(n = 10) {
    const data = this.getData();
    return data?.interactions?.slice(-n) || [];
  },
  
  // Reset analytics (for testing)
  reset() {
    const data = this.getData();
    if (data) {
      data.pageViews = [];
      data.interactions = [];
      this.save(data);
    }
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnalyticsData;
}