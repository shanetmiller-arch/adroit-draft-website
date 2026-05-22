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
  if (!PRODUCT_SCHEMA.required.every(field => product[field] !== undefined)) {
    return false;
  }
  if (!PRODUCT_SCHEMA.allowedStatuses.includes(product.status)) {
    return false;
  }
  if (!PRODUCT_SCHEMA.allowedMaturityLevels.includes(product.maturityLevel)) {
    return false;
  }
  if (!Array.isArray(product.features) ||
      product.features.length < PRODUCT_SCHEMA.minFeatures ||
      product.features.length > PRODUCT_SCHEMA.maxFeatures) {
    return false;
  }
  if (!product.features.every(f => typeof f === 'string')) {
    return false;
  }
  if (!/^[-a-zA-Z0-9]+$/.test(product.id)) {
    return false;
  }
  return true;
}

// HTML escape map shared across sanitisers
const HTML_ESCAPE_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };
function escapeHtml(value) {
  if (typeof value !== 'string') return value;
  return value.replace(/[&<>"']/g, ch => HTML_ESCAPE_MAP[ch] || ch);
}

// Sanitize product data before rendering - removes potentially dangerous characters
function sanitizeProductData(product) {
  if (!validateProduct(product)) {
    return null;
  }
  return {
    ...product,
    description: escapeHtml(product.description),
    name: escapeHtml(product.name),
    fullName: escapeHtml(product.fullName),
    features: product.features.map(f => escapeHtml(f))
  };
}

// Product detail page URL — depth layer beneath the home portfolio.
// Each known product has a dedicated page that expands on description, features,
// phase status, and where it fits in the ADROIT lifecycle. Falls back to the
// in-page anchor if the id has no dedicated detail page yet, so unknown products
// degrade gracefully without exposing a broken link.
const PRODUCT_DETAIL_PAGES = new Set(['rmfm', 'pmris']);
function productDetailHref(id) {
  return PRODUCT_DETAIL_PAGES.has(id) ? `${id}.html` : `#${id}`;
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
    const flagship = productStubs.find(p => p.isFlagship);
    return flagship && validateProduct(flagship) ? flagship : null;
  },

  renderProducts(containerSelector) {
    const container = typeof containerSelector === 'string'
      ? document.querySelector(containerSelector)
      : containerSelector;
    if (!container) return;

    const products = this.getProducts();
    let html = '<div class="portfolio-grid">';

    if (!Array.isArray(products) || products.length === 0) {
      console.warn('ProductManager: No valid products to render');
      html += '<p class="no-products">No products available</p>';
    }

    const flagship = this.getFlagship();
    if (flagship) {
      const imageSrc = flagship.imageUrl || 'assets/images/0_ADROIT_Small.png';
      const detailHref = productDetailHref(flagship.id);
      html += `
        <article class="portfolio-card portfolio-card--flagship">
          <a href="${detailHref}" class="portfolio-card-link" aria-label="Open ${flagship.name} detail page">
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
              <span class="portfolio-link" aria-hidden="true">Learn more &rarr;</span>
            </div>
          </a>
        </article>
      `;
    }

    const regularProducts = products.filter(p => !p.isFlagship);
    regularProducts.forEach(product => {
      const imageSrc = product.imageUrl || 'assets/images/0_ADROIT_Small.png';
      const detailHref = productDetailHref(product.id);
      html += `
        <article class="portfolio-card">
          <a href="${detailHref}" class="portfolio-card-link" aria-label="Open ${product.name} detail page">
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
              <span class="portfolio-link" aria-hidden="true">Learn more &rarr;</span>
            </div>
          </a>
        </article>
      `;
    });

    html += '</div>';
    container.innerHTML = html;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { productStubs, ProductManager, validateProduct, sanitizeProductData, productDetailHref };
}
