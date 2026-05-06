// Security-focused tests for ADROIT Draft Website product validation
// Phase 1: scaffold - validates input validation and tampering prevention

import { productStubs, ProductManager, validateProduct, sanitizeProductData } from '../products.js';

describe('ADROIT Draft Website - Security Input Validation', () => {
  describe('validateProduct function', () => {
    it('should validate existing products pass validation', () => {
      const pmris = productStubs.find(p => p.id === 'pmris');
      expect(validateProduct(pmris)).toBe(true);
    });

    it('should validate flagship product passes validation', () => {
      const rmfm = productStubs.find(p => p.id === 'rmfm');
      expect(validateProduct(rmfm)).toBe(true);
    });

    it('should reject product missing required id field', () => {
      const invalidProduct = {
        name: 'Test',
        fullName: 'Test',
        description: 'Test',
        phase: 'Phase 1',
        status: 'planned',
        category: 'test',
        features: ['Feature 1']
      };
      expect(validateProduct(invalidProduct)).toBe(false);
    });

    it('should reject product with invalid status', () => {
      const productWithInvalidStatus = {
        id: 'test',
        name: 'Test',
        fullName: 'Test',
        description: 'Test',
        phase: 'Phase 1',
        status: 'hacked',
        category: 'test',
        features: ['Feature 1']
      };
      expect(validateProduct(productWithInvalidStatus)).toBe(false);
    });

    it('should reject product with too many features (injection prevention)', () => {
      const productWithTooManyFeatures = {
        id: 'test',
        name: 'Test',
        fullName: 'Test',
        description: 'Test',
        phase: 'Phase 1',
        status: 'planned',
        category: 'test',
        features: Array(20).fill('Feature')
      };
      expect(validateProduct(productWithTooManyFeatures)).toBe(false);
    });

    it('should reject product with non-string features (XSS prevention)', () => {
      const productWithNonStringFeatures = {
        id: 'test',
        name: 'Test',
        fullName: 'Test',
        description: 'Test',
        phase: 'Phase 1',
        status: 'planned',
        category: 'test',
        features: ['Feature 1', 123]
      };
      expect(validateProduct(productWithNonStringFeatures)).toBe(false);
    });

    it('should reject product with invalid ID format (injection prevention)', () => {
      const productWithInjectionId = {
        id: '<script>alert("xss")</script>',
        name: 'Test',
        fullName: 'Test',
        description: 'Test',
        phase: 'Phase 1',
        status: 'planned',
        category: 'test',
        features: ['Feature 1']
      };
      expect(validateProduct(productWithInjectionId)).toBe(false);
    });

    it('should reject product with null values in required fields', () => {
      const productWithNull = {
        id: 'test',
        name: null,
        fullName: 'Test',
        description: 'Test',
        phase: 'Phase 1',
        status: 'planned',
        category: 'test',
        features: ['Feature 1']
      };
      expect(validateProduct(productWithNull)).toBe(false);
    });

    it('should reject product with undefined values in required fields', () => {
      const productWithUndefined = {
        id: 'test',
        name: 'Test',
        fullName: undefined,
        description: 'Test',
        phase: 'Phase 1',
        status: 'planned',
        category: 'test',
        features: ['Feature 1']
      };
      expect(validateProduct(productWithUndefined)).toBe(false);
    });

    it('should accept product with empty string features', () => {
      const productWithEmptyFeatures = {
        id: 'test',
        name: 'Test',
        fullName: 'Test',
        description: 'Test',
        phase: 'Phase 1',
        status: 'planned',
        category: 'test',
        features: ['']
      };
      expect(validateProduct(productWithEmptyFeatures)).toBe(true);
    });

    it('should accept product with exactly max features', () => {
      const productWithMaxFeatures = {
        id: 'test',
        name: 'Test',
        fullName: 'Test',
        description: 'Test',
        phase: 'Phase 1',
        status: 'planned',
        category: 'test',
        features: Array(10).fill('Feature')
      };
      expect(validateProduct(productWithMaxFeatures)).toBe(true);
    });

    it('should reject product with empty features array', () => {
      const productWithEmptyFeatures = {
        id: 'test',
        name: 'Test',
        fullName: 'Test',
        description: 'Test',
        phase: 'Phase 1',
        status: 'planned',
        category: 'test',
        features: []
      };
      expect(validateProduct(productWithEmptyFeatures)).toBe(false);
    });
  });

  describe('sanitizeProductData function', () => {
    it('should sanitize description from XSS injection attempt', () => {
      const maliciousDescription = '<script>alert("xss")</script>Test';
      const product = {
        id: 'test',
        name: 'Test',
        fullName: 'Test',
        description: maliciousDescription,
        phase: 'Phase 1',
        status: 'planned',
        category: 'test',
        features: ['Feature 1']
      };
      
      expect(validateProduct(product)).toBe(true);
      const sanitized = sanitizeProductData(product);
      expect(sanitized.description).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;Test');
    });

    it('should sanitize name from XSS injection attempt', () => {
      const maliciousName = '<img src=x onerror=alert(1)>';
      const product = {
        id: 'test',
        name: maliciousName,
        fullName: 'Test',
        description: 'Test',
        phase: 'Phase 1',
        status: 'planned',
        category: 'test',
        features: ['Feature 1']
      };
      
      const sanitized = sanitizeProductData(product);
      expect(sanitized.name).toBe('&lt;img src=x onerror=alert(1)&gt;');
    });

    it('should sanitize features from XSS injection attempt', () => {
      const maliciousFeature = 'Click here <script>steal()</script> for more';
      const product = {
        id: 'test',
        name: 'Test',
        fullName: 'Test',
        description: 'Test',
        phase: 'Phase 1',
        status: 'planned',
        category: 'test',
        features: [maliciousFeature]
      };
      
      const sanitized = sanitizeProductData(product);
      expect(sanitized.features[0]).toBe('Click here &lt;script&gt;steal()&lt;/script&gt; for more');
    });

    it('should return null for invalid products', () => {
      const invalidProduct = {
        id: 'test',
        name: 'Test',
        description: 'Missing required fields'
      };
      
      expect(sanitizeProductData(invalidProduct)).toBe(null);
    });

    it('should not mutate original product data', () => {
      const originalProduct = {
        id: 'test',
        name: 'Original',
        fullName: 'Original',
        description: 'Original',
        phase: 'Phase 1',
        status: 'planned',
        category: 'test',
        features: ['Feature 1']
      };
      
      const originalDescription = originalProduct.description;
      const sanitized = sanitizeProductData(originalProduct);
      
      expect(originalProduct.description).toBe(originalDescription);
      expect(sanitized.description).not.toBe(originalDescription);
    });

    it('should handle missing description gracefully', () => {
      const productWithMissingDesc = {
        id: 'test',
        name: 'Test',
        fullName: 'Test',
        phase: 'Phase 1',
        status: 'planned',
        category: 'test',
        features: ['Feature 1']
      };
      
      const sanitized = sanitizeProductData(productWithMissingDesc);
      expect(sanitized.description).toBeUndefined();
    });
  });

  describe('ProductManager Security Integration', () => {
    beforeEach(() => {
      // Reset to original state before tests
      Object.assign(ProductManager, {
        getProducts: () => productStubs,
        getFlagship: () => productStubs.find(p => p.isFlagship),
        renderProducts: ProductManager.renderProducts
      });
    });

    it('should not return flagship if it fails validation', () => {
      // Temporarily replace with invalid flagship
      const originalGetFlagship = ProductManager.getFlagship;
      ProductManager.getFlagship = () => ({
        id: 'hacked',
        name: 'Hacked',
        fullName: 'Hacked',
        description: 'Hacked',
        phase: 'Phase 1',
        status: 'injected',
        category: 'test',
        features: ['Feature 1'],
        isFlagship: true
      });
      
      const flagship = ProductManager.getFlagship();
      expect(flagship).toBe(null);
      
      ProductManager.getFlagship = originalGetFlagship;
    });

    it('should handle tampered products array gracefully', () => {
      const originalProducts = ProductManager.getProducts;
      ProductManager.getProducts = () => [
        {
          id: 'hacked',
          name: 'Hacked',
          fullName: 'Hacked',
          description: 'Hacked',
          phase: 'Phase 1',
          status: 'injected',
          category: 'test',
          features: ['Feature 1']
        }
      ];
      
      const flagship = ProductManager.getFlagship();
      expect(flagship).toBe(null);
      
      ProductManager.getProducts = originalProducts;
    });

    it('should handle null container without throwing', () => {
      expect(() => ProductManager.renderProducts(null)).not.toThrow();
    });

    it('should handle empty products array without crashing', () => {
      const originalProducts = ProductManager.getProducts;
      ProductManager.getProducts = () => [];
      
      const container = document.createElement('div');
      container.classList.add('portfolio-grid');
      
      expect(() => ProductManager.renderProducts(container)).not.toThrow();
      
      ProductManager.getProducts = originalProducts;
    });

    it('should escape HTML in rendered flagship product', () => {
      const container = document.createElement('div');
      container.classList.add('portfolio-grid');
      
      // Inject malicious content into a product
      const maliciousProduct = {
        ...productStubs[0],
        fullName: '<script>alert("xss")</script>',
        description: '<img src=x>',
        features: ['Click <script>evil()</script>']
      };
      
      Object.assign(ProductManager, {
        getProducts: () => [maliciousProduct],
        renderProducts: ProductManager.renderProducts
      });
      
      expect(() => ProductManager.renderProducts(container)).not.toThrow();
      expect(container.innerHTML).toContain('&lt;script&gt;');
      expect(container.innerHTML).toContain('&lt;img');
      
      Object.assign(ProductManager, {
        getProducts: () => productStubs,
        renderProducts: ProductManager.renderProducts
      });
    });

    it('should include flagship product in render when valid', () => {
      const container = document.createElement('div');
      container.classList.add('portfolio-grid');
      
      expect(() => ProductManager.renderProducts(container)).not.toThrow();
      expect(container.innerHTML).toContain('portfolio-card--flagship');
      expect(container.innerHTML).toContain('Flagship Product');
      expect(container.innerHTML).toContain('Risk Management Framework Flagship');
    });

    it('should include aria-label for accessibility', () => {
      const container = document.createElement('div');
      container.classList.add('portfolio-grid');
      
      ProductManager.renderProducts(container);
      expect(container.innerHTML).toMatch(/aria-label="Learn more about PMRIS"/);
    });

    it('should include status badge in rendered output', () => {
      const container = document.createElement('div');
      container.classList.add('portfolio-grid');
      
      ProductManager.renderProducts(container);
      expect(container.innerHTML).toContain('status-badge');
      expect(container.innerHTML).toContain('active');
    });
  });

  describe('Product Stubs Data Integrity', () => {
    it('should have correct flagship product with isFlagship flag', () => {
      const flagship = productStubs.find(p => p.isFlagship);
      expect(flagship.id).toBe('rmfm');
      expect(flagship.isFlagship).toBe(true);
      expect(flagship.name).toBe('RMFM');
    });

    it('should have valid status values for all products', () => {
      productStubs.forEach(product => {
        expect(PRODUCT_SCHEMA.allowedStatuses).toContain(product.status);
      });
    });

    it('should have valid category for all products', () => {
      productStubs.forEach(product => {
        expect(typeof product.category).toBe('string');
        expect(product.category.length > 0).toBe(true);
      });
    });
  });
});

// Node.js environment test fallback
describe('Node.js Environment Compatibility', () => {
  it('should export expected modules', () => {
    expect(typeof ProductManager).toBe('object');
    expect(typeof validateProduct).toBe('function');
    expect(typeof sanitizeProductData).toBe('function');
    expect(Array.isArray(productStubs)).toBe(true);
  });
});
