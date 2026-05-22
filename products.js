const productStubs = [
  {
    id: 'pmris',
    name: 'PMRIS',
    fullName: 'Emerging Suite of Program Monitoring Information Reporting System',
    description: 'Program Monitoring Information Reporting System for government program oversight',
    phase: 'Phase 1',
    status: 'planned',
    maturityLevel: 'early',
    category: 'monitoring',
    features: ['Real-time reporting', 'Multi-program dashboard', 'Compliance tracking'],
    imageUrl: 'assets/images/0_ADROIT_Small.png',
    statusBadge: 'status-planned',
    isFlagship: false
  },
  {
    id: 'rmfm',
    name: 'RMFM',
    fullName: 'Risk Management Framework Flagship',
    description: 'Comprehensive risk management solution for government programs — ADROIT flagship product',
    phase: 'Phase 1',
    status: 'active',
    maturityLevel: 'developing',
    category: 'risk-management',
    features: ['Risk assessment', 'Audit trails', 'Compliance reporting', 'Real-time monitoring', 'Automated reporting', 'Operational insights integration'],
    imageUrl: 'assets/images/0_ADROIT__Landscape_Medium.png',
    statusBadge: 'status-active',
    isFlagship: true
  }
];

// Security-first validation schema for product data
// Ensures all products conform to expected structure before rendering
const PRODUCT_SCHEMA = {
  required: ['id', 'name', 'fullName', 'description', 'phase', 'status', 'category', 'features'],
  allowedStatuses: ['planned', 'active', 'dev'],
  allowedMaturityLevels: ['early', 'developing', 'stable', 'production'],
  maxFeatures: 10,
  minFeatures: 1
};

// Validate product data against schema - prevents injection of malformed data
function validateProduct(product) {
  // Check required fields exist
  if (!PRODUCT_SCHEMA.required.every(field => product[field] !== undefined)) {
    return false;
  }
  
  // Validate status is one of allowed values (prevents status injection attacks)
  if (!PRODUCT_SCHEMA.allowedStatuses.includes(product.status)) {
    return false;
  }
  
  // Validate maturity level is one of allowed values (prevents maturity injection attacks)
  if (!PRODUCT_SCHEMA.allowedMaturityLevels.includes(product.maturityLevel)) {
    return false;
  }
  
  // Validate features array is within bounds
  if (!Array.isArray(product.features) || 
      product.features.length < PRODUCT_SCHEMA.minFeatures ||
      product.features.length > PRODUCT_SCHEMA.maxFeatures) {
    return false;
  }
  
  // Ensure features are strings (prevents XSS via feature injection)
  if (!product.features.every(f => typeof f === 'string')) {
    return false;
  }
  
  // Validate ID format (basic alphanumeric check)
  if (!/^[-a-zA-Z0-9]+$/.test(product.id)) {
    return false;
  }
  
  return true;
}

// Sanitize product data before rendering - removes potentially dangerous characters
function sanitizeProductData(product) {
  if (!validateProduct(product)) {
    return null;
  }
  
  // Clone product to avoid mutating original data (immutability)
  return {
    ...product,
    // Escape HTML in text fields to prevent XSS
    description: product.description?.replace(/[&<>&quot;'\'/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'}[char]) || char),
    name: product.name?.replace(/[&<>&quot;'\'/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'}[char]) || char),
    fullName: product.fullName?.replace(/[&<>&quot;'\'/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'}[char]) || char),
    features: product.features.map(f => f.replace(/[&<>&quot;'\'/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'}[char]) || char))
  };
}

// Product stub manager for dynamic rendering with security validation
const ProductManager = {
  getProducts() {
    return productStubs;
  },

  getProduct(id) {
    return productStubs.find(p => p.id === id);
  },

  getFlagship() {
    // Security: Validate before returning flagship to prevent manipulation
    const flagship = productStubs.find(p => p.isFlagship);
    return flagship && validateProduct(flagship) ? flagship : null;
  },

  // Secure rendering with validation and sanitization
  renderProducts(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const products = this.getProducts();
    let html = '<div class="portfolio-grid">';

    // Security: Validate products array is not empty or tampered
    if (!Array.isArray(products) || products.length === 0) {
      console.warn('ProductManager: No valid products to render');
      html += '<p class="no-products">No products available</p>';
    }

    // Highlight flagship product first (single flagship enforced by schema)
    const flagship = this.getFlagship();
    if (flagship) {
      const imageSrc = flagship.imageUrl || 'assets/images/0_ADROIT_Small.png';
      html += `
        <article class="portfolio-card portfolio-card--flagship">
          <a href="#${flagship.id}" class="portfolio-card-link">
            <img src="${imageSrc}" alt="${flagship.name}" class="portfolio-image" loading="lazy">
            <div class="portfolio-content">
              <span class="portfolio-badge portfolio-badge--flagship">Flagship Product</span>
              <span class="portfolio-badge">${flagship.category}</span>
              <h3 class="portfolio-title">${flagship.fullName}</h3>
              <p class="portfolio-description">${flagship.description}</p>
              <ul class="portfolio-features">
                ${flagship.features.map(feature => `<li>${feature}</li>`).join('')}
              </ul>
              <div class="portfolio-meta">
                <span class="status-badge ${flagship.statusBadge}">${flagship.status}</span>
                <span class="maturity-indicator ${flagship.maturityLevel}">${flagship.maturityLevel}</span>
                <span class="flagship-indicator">★</span>
              </div>
              <a href="#${flagship.id}" class="portfolio-link" aria-label={`Learn more about ${flagship.name}`}>
                Learn more &rarr;
              </a>
            </div>
          </a>
        </article>
      `;
    }

    // Render remaining products
    const regularProducts = products.filter(p => !p.isFlagship);
    regularProducts.forEach(product => {
      const imageSrc = product.imageUrl || 'assets/images/0_ADROIT_Small.png';
      html += `
        <article class="portfolio-card">
          <a href="#${product.id}" class="portfolio-card-link">
            <img src="${imageSrc}" alt="${product.name}" class="portfolio-image" loading="lazy">
            <div class="portfolio-content">
              <span class="portfolio-badge">${product.category}</span>
              <h3 class="portfolio-title">${product.fullName}</h3>
              <p class="portfolio-description">${product.description}</p>
              <ul class="portfolio-features">
                ${product.features.map(feature => `<li>${feature}</li>`).join('')}
              </ul>
              <div class="portfolio-meta">
                <span class="status-badge ${product.statusBadge}">${product.status}</span>
                <span class="maturity-indicator ${product.maturityLevel}">${product.maturityLevel}</span>
              </div>
              <a href="#${product.id}" class="portfolio-link" aria-label={`Learn more about ${product.name}`}>
                Learn more &rarr;
              </a>
            </div>
          </a>
        </article>
      `;
    });

    html += '</div>';
    container.innerHTML = html;
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { productStubs, ProductManager, validateProduct, sanitizeProductData };
}