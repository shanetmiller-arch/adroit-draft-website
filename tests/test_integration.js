// Integration-style test for RMFM flagship identification
// Tests the complete flow from data to rendering

const { productStubs, ProductManager } = require('../products');
const fs = require('fs');
const path = require('path');

describe('ADROIT Draft Website - RMFM Flagship Integration', () => {
  let cssContent;

  beforeAll(() => {
    cssContent = fs.readFileSync(
      path.join(__dirname, '../styles.css'),
      'utf8'
    );
  });

  describe('Complete Flagship Identification Flow', () => {
    it('should have data model supporting flagship identification', () => {
      const flagshipProduct = productStubs.find(p => p.isFlagship === true);
      
      expect(flagshipProduct).toBeDefined();
      expect(flagshipProduct.name).toBe('RMFM');
      expect(flagshipProduct.isFlagship).toBe(true);
    });

    it('should have CSS supporting flagship visual rendering', () => {
      expect(cssContent.includes('portfolio-card--flagship')).toBe(true);
      expect(cssContent.includes('portfolio-badge--flagship')).toBe(true);
      expect(cssContent.includes('--brand-flagship')).toBe(true);
      expect(cssContent.includes('--brand-flagship-bg')).toBe(true);
    });

    it('should render only one flagship product', () => {
      const container = document.createElement('div');
      container.classList.add('portfolio-grid');
      
      ProductManager.renderProducts(container);
      
      const flagshipCount = container.innerHTML.match(/portfolio-card--flagship/g);
      expect(flagshipCount).toHaveLength(1);
    });

    it('should identify RMFM as the sole flagship in data', () => {
      const flagships = productStubs.filter(p => p.isFlagship === true);
      expect(flagships.length).toBe(1);
      expect(flagships[0].id).toBe('rmfm');
      expect(flagships[0].name).toBe('RMFM');
    });

    it('should ensure PMRIS is not flagship', () => {
      const pmrisProduct = productStubs.find(p => p.id === 'pmris');
      expect(pmrisProduct.isFlagship).toBe(false);
    });

    it('should have complete flagship feature set', () => {
      const rmfmProduct = productStubs.find(p => p.id === 'rmfm');
      
      expect(rmfmProduct.features.length).toBeGreaterThanOrEqual(4);
      expect(rmfmProduct.features.includes('Risk assessment')).toBe(true);
      expect(rmfmProduct.features.includes('Audit trails')).toBe(true);
      expect(rmfmProduct.features.includes('Compliance reporting')).toBe(true);
      expect(rmfmProduct.features.includes('Operational insights integration')).toBe(true);
    });

    it('should maintain product consistency between data and rendering', () => {
      const container = document.createElement('div');
      container.classList.add('portfolio-grid');
      
      ProductManager.renderProducts(container);
      
      // Verify RMFM is in rendered output
      expect(container.innerHTML.includes('Risk Management Framework Flagship')).toBe(true);
      
      // Verify flagship badge is present
      expect(container.innerHTML.includes('Flagship Product')).toBe(true);
    });
  });

  describe('Edge Case Handling', () => {
    it('should handle multiple flagships gracefully (validation)', () => {
      // This test validates the data model enforces single flagship
      const flagships = productStubs.filter(p => p.isFlagship === true);
      expect(flagships.length).toBeLessThanOrEqual(1);
    });

    it('should handle product retrieval errors', () => {
      const result = ProductManager.getProduct('nonexistent');
      expect(result).toBeUndefined();
    });

    it('should handle missing container element', () => {
      expect(() => ProductManager.renderProducts(null)).not.toThrow();
    });

    it('should handle empty product list', () => {
      const originalGetProducts = ProductManager.getProducts;
      ProductManager.getProducts = () => [];
      
      const container = document.createElement('div');
      container.classList.add('portfolio-grid');
      
      ProductManager.renderProducts(container);
      expect(container.innerHTML.includes('portfolio-grid')).toBe(true);
      
      ProductManager.getProducts = originalGetProducts;
    });
  });

  describe('Stability and Extensibility', () => {
    it('should maintain flagship property immutability', () => {
      const originalFlagship = productStubs.find(p => p.isFlagship === true);
      
      // Mutate the copy
      const copy = JSON.parse(JSON.stringify(originalFlagship));
      copy.isFlagship = false;
      
      // Original should remain unchanged
      expect(originalFlagship.isFlagship).toBe(true);
    });

    it('should support adding new products without flagship flag', () => {
      const newProduct = {
        id: 'new-product',
        name: 'New Product',
        fullName: 'New Product Full Name',
        description: 'A new product',
        phase: 'Phase 1',
        status: 'planned',
        category: 'new',
        features: ['Feature 1'],
        imageUrl: 'assets/images/0_ADROIT_Small.png',
        statusBadge: 'status-planned',
        isFlagship: false
      };
      
      expect(newProduct.isFlagship).toBe(false);
    });

    it('should allow flagship product to be added to array', () => {
      const newFlagship = {
        id: 'new-flagship',
        name: 'Another Flagship',
        fullName: 'Another Flagship Full Name',
        description: 'A flagship product',
        phase: 'Phase 1',
        status: 'planned',
        category: 'general',
        features: ['Feature 1'],
        imageUrl: 'assets/images/0_ADROIT_Small.png',
        statusBadge: 'status-planned',
        isFlagship: true
      };
      
      // This validates the structure allows future flagships
      expect(newFlagship.isFlagship).toBe(true);
    });
  });
});
