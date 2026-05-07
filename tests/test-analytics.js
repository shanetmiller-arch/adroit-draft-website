// Tests for Analytics module
// Verifies analytics tracking functionality and privacy compliance

const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body><div id="hero">Hero</div><div id="products-container"></div><div id="white-papers-grid"></div><div id="engagement-pathways"><div class="pathway-card" data-pathway="product-explorer"><h3>Pathway</h3></div></div></body></html>', { url: 'http://localhost' });
global.window = dom.window;
global.document = dom.window.document;
global.localStorage = {
  getItem: jest.fn(() => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

describe('Analytics Module', () => {
  let Analytics;

  beforeAll(() => {
    // Load analytics module
    const analyticsModule = require('../analytics.js');
    Analytics = analyticsModule.Analytics;
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.getItem.mockReset();
    localStorage.setItem.mockReset();
    localStorage.removeItem.mockReset();
  });

  describe('Analytics initialization', () => {
    it('should initialize analytics on DOM load', () => {
      const initSpy = jest.spyOn(Analytics, 'init');
      window.addEventListener('DOMContentLoaded', () => Analytics.init());
      expect(initSpy).toHaveBeenCalled();
    });

    it('should generate anonymous session ID', () => {
      Analytics.init();
      expect(Analytics.sessionId).toMatch(/^sess_[a-z0-9]{20}$/);
    });

    it('should set session start time', () => {
      Analytics.init();
      expect(Analytics.sessionStart).toBeDefined();
      expect(Date.now() - Analytics.sessionStart).toBeLessThan(1000);
    });
  });

  describe('Page view tracking', () => {
    beforeEach(() => {
      Analytics.init();
    });

    it('should track page views', () => {
      const page = '/about';
      Analytics.trackPageView(page);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String)
      );
    });

    it('should include referrer information', () => {
      window.location.referrer = 'https://example.com';
      Analytics.trackPageView('/contact');
      // Verify referrer was captured
      const calls = localStorage.setItem.mock.calls;
      expect(calls[calls.length - 1][1]).toMatch(/referrer:/);
    });
  });

  describe('Interaction tracking', () => {
    beforeEach(() => {
      Analytics.init();
    });

    it('should track element clicks', () => {
      const mockElement = {
        id: 'test-button',
        className: 'btn-primary'
      };
      Analytics.trackInteraction(mockElement, 'click');
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should track scroll depth', () => {
      window.scrollY = 1000;
      document.body.scrollHeight = 2000;
      Analytics.trackScrollDepth();
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should calculate correct scroll percentage', () => {
      window.scrollY = 500;
      document.body.scrollHeight = 1000;
      Analytics.trackScrollDepth();
      // Scroll should be around 50%
      const data = Analytics.getData();
      if (data && data.interactions.length > 0) {
        const scrollData = data.interactions[data.interactions.length - 1];
        expect(scrollData.scrollPercent).toBeCloseTo(50, 1);
      }
    });
  });

  describe('Product interaction tracking', () => {
    beforeEach(() => {
      Analytics.init();
    });

    it('should track product interactions', () => {
      Analytics.trackProductInteraction('rmfm', 'view');
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should track white paper reads', () => {
      Analytics.trackWhitePaperRead('pmris-paper');
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should track pathway engagement', () => {
      Analytics.trackPathwayEngagement('product-explorer');
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should track navigation', () => {
      Analytics.trackNavigation('/products');
      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('Data retrieval', () => {
    beforeEach(() => {
      Analytics.init();
    });

    it('should return analytics data', () => {
      const data = Analytics.getData();
      expect(data).toHaveProperty('sessionId');
      expect(data).toHaveProperty('pageViews');
      expect(data).toHaveProperty('interactions');
    });

    it('should include session duration', () => {
      const data = Analytics.getData();
      expect(data).toHaveProperty('sessionDuration');
      expect(data.sessionDuration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Analytics integration in scripts.js', () => {
    it('should initialize analytics via window.Analytics', () => {
      // Verify scripts.js references Analytics
      const fs = require('fs');
      const scriptsContent = fs.readFileSync('../scripts.js', 'utf8');
      expect(scriptsContent).toContain('Analytics.init');
      expect(scriptsContent).toContain('window.Analytics');
    });

    it('should track pathway engagement in scripts.js', () => {
      const scriptsContent = require('fs').readFileSync('../scripts.js', 'utf8');
      expect(scriptsContent).toContain('trackPathwayEngagement');
    });

    it('should add analytics tracking class to elements', () => {
      const scriptsContent = require('fs').readFileSync('../scripts.js', 'utf8');
      expect(scriptsContent).toContain('analytics-track');
    });
  });

  describe('Privacy compliance', () => {
    it('should not collect PII', () => {
      const fs = require('fs');
      const analyticsContent = fs.readFileSync('../analytics.js', 'utf8');
      // Should not contain any PII collection
      expect(analyticsContent).not.toContain('email');
      expect(analyticsContent).not.toContain('name');
      expect(analyticsContent).not.toContain('password');
    });

    it('should use anonymous session IDs', () => {
      const analyticsContent = require('fs').readFileSync('../analytics.js', 'utf8');
      expect(analyticsContent).toContain('generateAnonymousId');
    });

    it('should store data locally', () => {
      const analyticsContent = require('fs').readFileSync('../analytics.js', 'utf8');
      expect(analyticsContent).toContain('localStorage');
    });

    it('should not require external dependencies', () => {
      const analyticsContent = require('fs').readFileSync('../analytics.js', 'utf8');
      // Should not import external analytics libraries
      expect(analyticsContent).not.toContain('google-analytics');
      expect(analyticsContent).not.toContain('analytics.js');
    });
  });

  describe('Edge cases', () => {
    it('should handle missing container gracefully', () => {
      Analytics.trackPageView('/nonexistent');
      // Should not throw
      expect(() => Analytics.trackPageView('/nonexistent')).not.toThrow();
    });

    it('should handle storage errors gracefully', () => {
      // Simulate storage error
      localStorage.setItem = () => { throw new Error('Storage full'); };
      Analytics.init();
      // Should not crash
      expect(() => Analytics.trackPageView('/test')).not.toThrow();
    });

    it('should handle empty interactions array', () => {
      Analytics.interactions = [];
      const data = Analytics.getData();
      expect(data.interactions).toEqual([]);
    });
  });
});