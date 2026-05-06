// Product Stub Architecture
// Defines extensible product data structure for ADROIT Draft Website
// Phase 1: scaffold - establishes foundation for Phase 2: core content

const productStubs = [
  {
    id: 'pmris',
    name: 'PMRIS',
    fullName: 'Emerging Suite of Program Monitoring Information Reporting System',
    description: 'Program Monitoring Information Reporting System for government program oversight',
    phase: 'Phase 1',
    status: 'planned',
    category: 'monitoring',
    features: ['Real-time reporting', 'Multi-program dashboard', 'Compliance tracking'],
    imageUrl: 'assets/images/0_ADROIT_Small.png',
    statusBadge: 'status-planned'
  },
  {
    id: 'rmfm',
    name: 'RMFM',
    fullName: 'Risk Management Framework Flagship',
    description: 'Comprehensive risk management solution for government programs',
    phase: 'Phase 1',
    status: 'planned',
    category: 'risk-management',
    features: ['Risk assessment', 'Audit trails', 'Compliance reporting'],
    imageUrl: 'assets/images/0_ADROIT_Small.png',
    statusBadge: 'status-planned'
  }
];

// Product stub manager for dynamic rendering
const ProductManager = {
  getProducts() {
    return productStubs;
  },

  getProduct(id) {
    return productStubs.find(p => p.id === id);
  },

  renderProducts(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const products = this.getProducts();
    let html = '<div class="portfolio-grid">';

    products.forEach(product => {
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
              </div>
              <a href="#${product.id}" class="portfolio-link" aria-label={`Learn more about ${product.name}`}>Learn more &rarr;</a>
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
  module.exports = { productStubs, ProductManager };
}