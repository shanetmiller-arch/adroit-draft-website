// Analytics Configuration - Privacy-focused tracking for ADROIT Draft Website
// Phase 1: scaffold - basic analytics foundation
// Phase 2: core content - extended analytics with detailed insights

const AnalyticsConfig = {
  // Track page views
  trackPageViews: true,
  
  // Track user interactions (clicks, scrolls, etc.)
  trackInteractions: true,
  
  // Track engagement metrics
  trackEngagement: true,
  
  // Track analytics events
  trackEvents: true,
  
  // Privacy settings
  anonymizeIP: true,
  disableCookieStorage: true,
  
  // Analytics destination (placeholder for future integration)
  analyticsEndpoint: null,
  
  // Track specific elements
  trackHeroInteractions: true,
  trackProductClicks: true,
  trackWhitePaperReads: true,
  trackPathwayEngagement: true,
  
  // Session tracking
  enableSessionTracking: true,
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  
  // Consent management
  requireConsent: false,
  consentBanner: {
    enabled: false,
    message: 'This website uses analytics to understand user engagement'
  }
};

// Analytics event types
const AnalyticsEvents = {
  PAGE_VIEW: 'page_view',
  ELEMENT_CLICK: 'element_click',
  SCROLL_DEPTH: 'scroll_depth',
  PRODUCT_INTERACTION: 'product_interaction',
  WHITE_PAPER_READ: 'white_paper_read',
  PATHWAY_ENGAGEMENT: 'pathway_engagement',
  NAVIGATION: 'navigation',
  CONSENT_GIVEN: 'consent_given',
  CONSENT_WITHDRAWN: 'consent_withdrawn'
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AnalyticsConfig, AnalyticsEvents };
}