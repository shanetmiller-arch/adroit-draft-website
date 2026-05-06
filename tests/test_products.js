// ADROIT Draft Website - Product tests using ES modules
// Phase 1: scaffold - product data structure tests

import { productStubs, ProductManager } from '../products.js';

// Mock DOM for rendering tests
class MockDocument {
  constructor() {
    this.elements = new Map();
  }

  querySelector(selector) {
    const key = selector.replace('#', '').replace('.', '');
    return this.elements.get(key) || null;
  }

  querySelectorAll(selector) {
    return [];
  }

  innerHTML = '';
}

function createMockElement() {
  const el = document.createElement('div');
  return el;
}

describe('ADROIT Draft Website - RMFM Flagship Identification', () => {
  describe('Product Data Structure', () => {
    it('should contain both PMRIS and RMFM products', () => {
      const products = productStubs;
      expect(products.length).toBe(2);
      const ids = products.map(p => p.id);
      expect(ids).toContain('pmris');
      expect(ids).toContain('rmfm');
    });

    it('should mark RMFM as flagship product', () => {
      const rmfmProduct = productStubs.find(p => p.id === 'rmfm');
      expect(rmfmProduct.isFlagship).toBe(true);
      expect(rmfmProduct.name).toBe('RMFM');
      expect(rmfmProduct.fullName).toBe('Risk Management Framework Flagship');
      expect(rmfmProduct.category).toBe('risk-management');
    });

    it('should mark PMRIS as non-flagship product', () => {
      const pmrisProduct = productStubs.find(p => p.id === 'pmris');
      expect(pmrisProduct.isFlagship).toBe(false);
      expect(pmrisProduct.name).toBe('PMRIS');
      expect(pmrisProduct.category).toBe('monitoring');
    });

    it('should have correct flagship-specific features for RMFM', () => {
      const rmfmProduct = productStubs.find(p => p.id === 'rmfm');
      expect(rmfmProduct.features).toContain('Risk assessment');
      expect(rmfmProduct.features).toContain('Audit trails');
      expect(rmfmProduct.features).toContain('Compliance reporting');
      expect(rmfmProduct.features).toContain('Operational insights integration');
      expect(rmfmProduct.features).toContain('Secure reporting workflows');
    });

    it('should have empty features for PMRIS or minimal set', () => {
      const pmrisProduct = productStubs.find(p => p.id === 'pmris');
      expect(pmrisProduct.features.length).toBe(3);
      expect(pmrisProduct.features).toContain('Real-time reporting');
      expect(pmrisProduct.features).toContain('Multi-program dashboard');
      expect(pmrisProduct.features).toContain('Compliance tracking');
    });

    it('should have maturityLevel field defined for all products', () => {
      productStubs.forEach(product => {
        expect(product.maturityLevel).toBeDefined();
        expect(['early', 'developing', 'stable', 'production']).toContain(product.maturityLevel);
      });
    });

    it('should have correct maturity level for RMFM', () => {
      const rmfmProduct = productStubs.find(p => p.id === 'rmfm');
      expect(rmfmProduct.maturityLevel).toBe('developing');
    });

    it('should have correct maturity level for PMRIS', () => {
      const pmrisProduct = productStubs.find(p => p.id === 'pmris');
      expect(pmrisProduct.maturityLevel).toBe('early');
    });
  });

  describe('ProductManager API', () => {
    it('should return all products via getProducts()', () => {
      const products = ProductManager.getProducts();
      expect(products).toEqual(productStubs);
      expect(products.length).toBe(2);
    });

    it('should return specific product via getProduct()', () => {
      const rmfmProduct = ProductManager.getProduct('rmfm');
      expect(rmfmProduct.isFlagship).toBe(true);

      const pmrisProduct = ProductManager.getProduct('pmris');
      expect(pmrisProduct.isFlagship).toBe(false);
    });

    it('should return undefined for non-existent product ID', () => {
      const result = ProductManager.getProduct('nonexistent');
      expect(result).toBeUndefined();
    });

    it('should render flagship badge for RMFM product card', () => {
      const container = createMockElement();
      container.classList.add('portfolio-grid');

      ProductManager.renderProducts(container);

      const flagshipBadge = container.innerHTML.includes('portfolio-badge--flagship');
      expect(flagshipBadge).toBe(true);
    });

    it('should render category badge for PMRIS product card', () => {
      const container = createMockElement();
      container.classList.add('portfolio-grid');

      ProductManager.renderProducts(container);

      const categoryBadge = container.innerHTML.includes('portfolio-badge');
      expect(categoryBadge).toBe(true);
    });

    it('should apply flagship card class to RMFM product', () => {
      const container = createMockElement();
      container.classList.add('portfolio-grid');

      ProductManager.renderProducts(container);

      const flagshipClass = container.innerHTML.includes('portfolio-card--flagship');
      expect(flagshipClass).toBe(true);
    });

    it('should not apply flagship card class to PMRIS product', () => {
      const container = createMockElement();
      container.classList.add('portfolio-grid');

      ProductManager.renderProducts(container);

      const pmrisCard = container.innerHTML.match(/<article class="portfolio-card portfolio-card--flagship">/);
      expect(pmrisCard).toBe(null);
    });

    it('should render maturity indicator for RMFM product', () => {
      const container = createMockElement();
      container.classList.add('portfolio-grid');

      ProductManager.renderProducts(container);

      const maturityIndicator = container.innerHTML.includes('maturity-indicator developing');
      expect(maturityIndicator).toBe(true);
    });

    it('should render maturity indicator for PMRIS product', () => {
      const container = createMockElement();
      container.classList.add('portfolio-grid');

      ProductManager.renderProducts(container);

      const maturityIndicator = container.innerHTML.includes('maturity-indicator early');
      expect(maturityIndicator).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle container being null', () => {
      const nullContainer = null;
      expect(() => ProductManager.renderProducts(nullContainer)).not.toThrow();
    });

    it('should handle product with missing imageUrl', () => {
      const testProducts = [{
        id: 'test',
        name: 'Test',
        isFlagship: true
      }];

      const container = createMockElement();
      container.classList.add('portfolio-grid');

      const originalGetProducts = ProductManager.getProducts;
      ProductManager.getProducts = () => testProducts;

      ProductManager.renderProducts(container);

      const defaultImage = container.innerHTML.includes('assets/images/0_ADROIT_Small.png');
      expect(defaultImage).toBe(true);

      ProductManager.getProducts = originalGetProducts;
    });

    it('should handle empty products array', () => {
      const emptyContainer = createMockElement();
      emptyContainer.classList.add('portfolio-grid');

      const originalGetProducts = ProductManager.getProducts;
      ProductManager.getProducts = () => [];

      ProductManager.renderProducts(emptyContainer);

      const emptyGrid = emptyContainer.innerHTML.includes('<div class="portfolio-grid">');
      expect(emptyGrid).toBe(true);

      ProductManager.getProducts = originalGetProducts;
    });

    it('should correctly identify flagship count in rendered output', () => {
      const container = createMockElement();
      container.classList.add('portfolio-grid');

      ProductManager.renderProducts(container);

      const flagshipCards = container.innerHTML.match(/portfolio-card--flagship/g);
      expect(flagshipCards).toHaveLength(1);
    });
  });

  describe('Requirement Compliance', () => {
    it('should clearly identify RMFM as flagship product in data model', () => {
      const flagshipProduct = productStubs.find(p => p.isFlagship === true);
      expect(flagshipProduct.name).toBe('RMFM');
      expect(flagshipProduct.isFlagship).toBe(true);
    });

    it('should ensure only one flagship product exists', () => {
      const flagshipCount = productStubs.filter(p => p.isFlagship === true).length;
      expect(flagshipCount).toBe(1);
    });

    it('should render maturity indicators in UI output', () => {
      const container = createMockElement();
      container.classList.add('portfolio-grid');

      ProductManager.renderProducts(container);

      const hasMaturityIndicators = container.innerHTML.includes('maturity-indicator');
      expect(hasMaturityIndicators).toBe(true);
    });

    it('should validate maturity level against allowed values', () => {
      const container = createMockElement();
      container.classList.add('portfolio-grid');

      ProductManager.renderProducts(container);

      const invalidMaturity = container.innerHTML.includes('maturity-indicator invalid');
      expect(invalidMaturity).toBe(false);
    });
  });
});