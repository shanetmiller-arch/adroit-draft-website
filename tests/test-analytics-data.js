// Tests for AnalyticsData module
// Verifies analytics data storage functionality

const { JSDOM } = require('jsdom');
dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', { url: 'http://localhost' });
global.window = dom.window;
global.document = dom.window.document;
global.localStorage = {
  getItem: jest.fn(() => null),
  setItem: jest.fn(() => true),
  removeItem: jest.fn(() => true),
  clear: jest.fn()
};

describe('AnalyticsData Module', () => {
  let AnalyticsData;

  beforeAll(() => {
    AnalyticsData = require('../analytics_data.js');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Data storage', () => {
    it('should initialize storage with default structure', () => {
      AnalyticsData.init();
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'adroit_analytics_v1',
        expect.stringContaining('version')
      );
    });

    it('should get stored data', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify({
        version: '1.0',
        pageViews: [],
        interactions: []
      }));
      
      const data = AnalyticsData.getData();
      expect(data).not.toBeNull();
      expect(data.version).toBe('1.0');
    });

    it('should handle null storage', () => {
      localStorage.getItem.mockReturnValue(null);
      const data = AnalyticsData.getData();
      expect(data).toBeNull();
    });

    it('should save data', () => {
      const testData = {
        version: '1.0',
        pageViews: [],
        interactions: []
      };
      
      const result = AnalyticsData.save(testData);
      expect(result).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should handle save errors', () => {
      localStorage.setItem = () => { throw new Error('Failed'); };
      const result = AnalyticsData.save({});
      expect(result).toBe(false);
    });
  });

  describe('Page view tracking', () => {
    it('should get page view count', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify({
        pageViews: [{page: '/1'}, {page: '/2'}]
      }));
      
      const count = AnalyticsData.getPageViewCount();
      expect(count).toBe(2);
    });

    it('should get recent page views', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify({
        pageViews: [
          {page: '/1', timestamp: 1000},
          {page: '/2', timestamp: 2000},
          {page: '/3', timestamp: 3000}
        ]
      }));
      
      const recent = AnalyticsData.getRecentPageViews(2);
      expect(recent.length).toBe(2);
      expect(recent[0].page).toBe('/2');
    });
  });

  describe('Interaction tracking', () => {
    it('should get interaction count', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify({
        interactions: [
          {type: 'click'},
          {type: 'scroll'}
        ]
      }));
      
      const count = AnalyticsData.getInteractionCount();
      expect(count).toBe(2);
    });

    it('should get recent interactions', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify({
        interactions: [
          {type: 'click'},
          {type: 'click'},
          {type: 'click'}
        ]
      }));
      
      const recent = AnalyticsData.getRecentInteractions(2);
      expect(recent.length).toBe(2);
    });
  });

  describe('Data reset', () => {
    it('should clear analytics data', () => {
      AnalyticsData.reset();
      expect(localStorage.setItem).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('pageViews')
      );
    });

    it('should handle empty data reset', () => {
      localStorage.getItem.mockReturnValue(null);
      AnalyticsData.reset();
      // Should not throw
      expect(() => AnalyticsData.reset()).not.toThrow();
    });
  });
});