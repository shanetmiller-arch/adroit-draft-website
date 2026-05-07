// ADROIT Draft Website - Analytics Tracking Module
// Phase 1: scaffold - basic analytics foundation
// Phase 2: core content - extended analytics with detailed insights
// Privacy-focused: No external dependencies, local storage only, no PII collection

const Analytics = {
  // Current session ID (anonymous)
  sessionId: null,
  
  // Session start time
  sessionStart: null,
  
  // Page view history
  pageViews: [],
  
  // Interaction history
  interactions: [],
  
  // Initialize analytics
  init() {
    // Generate anonymous session ID
    this.sessionId = this.generateAnonymousId();
    this.sessionStart = Date.now();
    
    // Load from local storage (if available)
    this._loadFromStorage();
    
    // Track initial page view
    this.trackPageView();
    
    // Set up scroll tracking
    this._setupScrollTracking();
    
    // Set up interaction tracking
    this._setupInteractionTracking();
    
    console.debug('Analytics module initialized');
  },
  
  // Generate anonymous session ID
  generateAnonymousId() {
    return 'sess_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  },
  
  // Track page view
  trackPageView(page = window.location.pathname) {
    const view = {
      timestamp: Date.now(),
      sessionId: this.sessionId,
      page: page,
      referrer: window.location.referrer || 'direct'
    };
    
    this.pageViews.push(view);
    this._saveToStorage();
    
    // Emit event for external tracking
    this._emitEvent(AnalyticsEvents.PAGE_VIEW, view);
    
    return view;
  },
  
  // Track element interaction (clicks, etc.)
  trackInteraction(element, type) {
    const interaction = {
      timestamp: Date.now(),
      sessionId: this.sessionId,
      element: element?.id || element?.className || 'unknown',
      type: type
    };
    
    this.interactions.push(interaction);
    this._saveToStorage();
    
    // Emit event
    this._emitEvent(AnalyticsEvents.ELEMENT_CLICK, interaction);
  },
  
  // Track scroll depth
  trackScrollDepth() {
    const scrollPercent = (window.scrollY + window.innerHeight) / document.body.scrollHeight * 100;
    
    const scrollData = {
      timestamp: Date.now(),
      sessionId: this.sessionId,
      scrollPercent: scrollPercent.toFixed(2),
      scrollY: window.scrollY
    };
    
    this.interactions.push(scrollData);
    this._saveToStorage();
    
    // Emit event
    this._emitEvent(AnalyticsEvents.SCROLL_DEPTH, scrollData);
    
    return scrollData;
  },
  
  // Track product interaction
  trackProductInteraction(productId, action) {
    const interaction = {
      timestamp: Date.now(),
      sessionId: this.sessionId,
      productId: productId,
      action: action
    };
    
    this.interactions.push(interaction);
    this._saveToStorage();
    
    // Emit event
    this._emitEvent(AnalyticsEvents.PRODUCT_INTERACTION, interaction);
  },
  
  // Track white paper read
  trackWhitePaperRead(paperId) {
    const interaction = {
      timestamp: Date.now(),
      sessionId: this.sessionId,
      paperId: paperId,
      action: 'read'
    };
    
    this.interactions.push(interaction);
    this._saveToStorage();
    
    // Emit event
    this._emitEvent(AnalyticsEvents.WHITE_PAPER_READ, interaction);
  },
  
  // Track pathway engagement
  trackPathwayEngagement(pathwayId) {
    const interaction = {
      timestamp: Date.now(),
      sessionId: this.sessionId,
      pathwayId: pathwayId,
      action: 'engage'
    };
    
    this.interactions.push(interaction);
    this._saveToStorage();
    
    // Emit event
    this._emitEvent(AnalyticsEvents.PATHWAY_ENGAGEMENT, interaction);
  },
  
  // Track navigation
  trackNavigation(to) {
    const interaction = {
      timestamp: Date.now(),
      sessionId: this.sessionId,
      to: to,
      action: 'navigate'
    };
    
    this.interactions.push(interaction);
    this._saveToStorage();
    
    // Emit event
    this._emitEvent(AnalyticsEvents.NAVIGATION, interaction);
  },
  
  // Setup scroll tracking
  _setupScrollTracking() {
    let ticking = false;
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          this.trackScrollDepth();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  },
  
  // Setup interaction tracking
  _setupInteractionTracking() {
    // Track clicks on interactive elements
    document.addEventListener('click', (e) => {
      // Skip tracking for analytics module itself
      if (e.target.closest('.analytics-track')) {
        this.trackInteraction(e.target, 'click');
      }
    }, { passive: true });
  },
  
  // Load data from local storage
  _loadFromStorage() {
    try {
      const stored = localStorage.getItem('adroit_analytics');
      if (stored) {
        const data = JSON.parse(stored);
        this.pageViews = data.pageViews || [];
        this.interactions = data.interactions || [];
      }
    } catch (error) {
      console.debug('Analytics: Failed to load from storage', error);
    }
  },
  
  // Save data to local storage
  _saveToStorage() {
    try {
      const data = {
        sessionId: this.sessionId,
        pageViews: this.pageViews,
        interactions: this.interactions
      };
      localStorage.setItem('adroit_analytics', JSON.stringify(data));
    } catch (error) {
      console.debug('Analytics: Failed to save to storage', error);
    }
  },
  
  // Clear analytics data
  clear() {
    this.pageViews = [];
    this.interactions = [];
    this._saveToStorage();
    localStorage.removeItem('adroit_analytics');
  },
  
  // Get analytics data for inspection (for debugging)
  getData() {
    return {
      sessionId: this.sessionId,
      pageViews: this.pageViews,
      interactions: this.interactions,
      sessionDuration: Date.now() - this.sessionStart
    };
  },
  
  // Emit event (placeholder for external analytics integration)
  _emitEvent(type, data) {
    // Placeholder for future integration
    // In production, this would send to analytics endpoint
    // Currently logs for debugging only
    if (typeof console !== 'undefined') {
      console.debug('[Analytics]', type, data);
    }
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Analytics;
}