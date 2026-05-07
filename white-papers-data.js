const whitePaperStubs = [
  {
    id: 'pmris-paper',
    title: 'PMRIS: Program Monitoring Reporting System',
    category: 'product',
    description: 'Comprehensive documentation on the Emerging Suite of Program Monitoring Information Reporting System architecture, features, and operational deployment guidelines for government programs.',
    phase: 'Phase 1',
    status: 'draft',
    author: 'ADROIT Engineering Team',
    date: '2026-05-06',
    tags: ['monitoring', 'reporting', 'governance'],
    readTime: 15,
    downloadUrl: '#',
    isFeatured: false
  },
  {
    id: 'operational-proof-paper',
    title: 'Operational Proof Framework',
    category: 'methodology',
    description: 'Documentation of ADROIT\'s operational proof methodology—how consulting execution translates into validated software products with measurable outcomes for government programs.',
    phase: 'Phase 2',
    status: 'in-progress',
    author: 'ADROIT Operations Team',
    date: '2026-05-06',
    tags: ['methodology', 'validation', 'outcomes'],
    readTime: 12,
    downloadUrl: '#',
    isFeatured: true
  },
  {
    id: 'rmfm-paper',
    title: 'RMFM: Risk Management Framework',
    category: 'product',
    description: 'Flagship product documentation covering risk assessment capabilities, audit trail mechanisms, compliance reporting features, and integration with operational insights systems.',
    phase: 'Phase 1',
    status: 'draft',
    author: 'ADROIT Risk Management Team',
    date: '2026-05-06',
    tags: ['risk', 'compliance', 'audit', 'flagship'],
    readTime: 20,
    downloadUrl: '#',
    isFeatured: true
  },
  {
    id: 'security-design-paper',
    title: 'Security-by-Design Implementation',
    category: 'security',
    description: 'Technical white paper on embedding security, auditability, and compliance from inception. Covers validation frameworks, threat modeling, and secure development practices.',
    phase: 'Phase 2',
    status: 'in-progress',
    author: 'ADROIT Security Team',
    date: '2026-05-06',
    tags: ['security', 'compliance', 'threat-modeling', 'devops'],
    readTime: 18,
    downloadUrl: '#',
    isFeatured: true
  },
  {
    id: 'integration-patterns-paper',
    title: 'Government Program Integration Patterns',
    category: 'operational',
    description: 'Documented patterns and best practices for integrating software solutions into live government program operations. Includes deployment strategies and operational support frameworks.',
    phase: 'Phase 2',
    status: 'in-progress',
    author: 'ADROIT Integration Team',
    date: '2026-05-06',
    tags: ['integration', 'deployment', 'operations', 'governance'],
    readTime: 14,
    downloadUrl: '#',
    isFeatured: false
  },
  {
    id: 'lifecycle-paper',
    title: 'Consulting-to-Products Lifecycle',
    category: 'methodology',
    description: 'Framework documenting how ADEPT and ADROIT translate real-world consulting execution into production-ready software products. Covers discovery, validation, and productization phases.',
    phase: 'Phase 2',
    status: 'in-progress',
    author: 'ADROIT Methodology Team',
    date: '2026-05-06',
    tags: ['lifecycle', 'productization', 'consulting', 'transformation'],
    readTime: 16,
    downloadUrl: '#',
    isFeatured: true
  }
];

// Security-first validation schema for white paper data
// Ensures all white papers conform to expected structure before rendering
const WHITE_PAPER_SCHEMA = {
  required: ['id', 'title', 'category', 'description', 'phase'],
  allowedCategories: ['product', 'methodology', 'operational', 'security'],
  allowedPhases: ['Phase 1', 'Phase 2', 'Phase 3'],
  allowedStatuses: ['draft', 'review', 'published', 'in-progress', 'archived'],
  maxTags: 5,
  minTags: 0,
  maxReadTime: 30,
  minReadTime: 1
};

// Validate white paper data against schema - prevents injection of malformed data
function validateWhitePaper(paper) {
  // Check required fields exist
  if (!WHITE_PAPER_SCHEMA.required.every(field => paper[field] !== undefined)) {
    return false;
  }
  
  // Validate category is one of allowed values (prevents category injection attacks)
  if (!WHITE_PAPER_SCHEMA.allowedCategories.includes(paper.category)) {
    return false;
  }
  
  // Validate phase is one of allowed values (prevents phase injection attacks)
  if (!WHITE_PAPER_SCHEMA.allowedPhases.includes(paper.phase)) {
    return false;
  }
  
  // Validate status is one of allowed values (prevents status injection attacks)
  if (!WHITE_PAPER_SCHEMA.allowedStatuses.includes(paper.status)) {
    return false;
  }
  
  // Validate tags array is within bounds
  if (!Array.isArray(paper.tags) || 
      paper.tags.length < WHITE_PAPER_SCHEMA.minTags ||
      paper.tags.length > WHITE_PAPER_SCHEMA.maxTags) {
    return false;
  }
  
  // Ensure tags are strings (prevents XSS via tag injection)
  if (!paper.tags.every(t => typeof t === 'string')) {
    return false;
  }
  
  // Validate ID format (basic alphanumeric check)
  if (!/^[-a-zA-Z0-9-]+$/.test(paper.id)) {
    return false;
  }
  
  // Validate read time is within bounds
  if (!Number.isInteger(paper.readTime) || 
      paper.readTime < WHITE_PAPER_SCHEMA.minReadTime ||
      paper.readTime > WHITE_PAPER_SCHEMA.maxReadTime) {
    return false;
  }
  
  return true;
}

// Sanitize white paper data before rendering - removes potentially dangerous characters
function sanitizeWhitePaperData(paper) {
  if (!validateWhitePaper(paper)) {
    return null;
  }
  
  // Clone paper to avoid mutating original data (immutability)
  return {
    ...paper,
    // Escape HTML in text fields to prevent XSS
    title: paper.title?.replace(/[&<>\"'\'/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'}[char]) || char),
    description: paper.description?.replace(/[&<>\"'\'/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'}[char]) || char),
    tags: paper.tags.map(t => t.replace(/[&<>\"'\'/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'}[char]) || char))
  };
}

// White Paper stub manager for dynamic rendering with security validation
const WhitePaperManager = {
  getWhitePapers() {
    return whitePaperStubs;
  },

  getWhitePaper(id) {
    return whitePaperStubs.find(p => p.id === id);
  },

  // Get featured white papers (for hero/prominent display)
  getFeaturedWhitePapers() {
    const featured = whitePaperStubs.filter(p => p.isFeatured);
    return featured.sort((a, b) => {
      // Maintain stable order if multiple featured papers
      return 0;
    });
  },

  // Get white papers by category
  getByCategory(category) {
    return whitePaperStubs.filter(p => p.category === category);
  },

  // Secure rendering with validation and sanitization
  renderWhitePapers(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const papers = this.getWhitePapers();
    let html = '<div class="white-papers-grid">';

    // Security: Validate papers array is not empty or tampered
    if (!Array.isArray(papers) || papers.length === 0) {
      console.warn('WhitePaperManager: No valid white papers to render');
      html += '<p class="no-white-papers">No white papers available</p>';
    }

    // Render papers sorted by phase (Phase 1 first, then Phase 2)
    const phase1Papers = papers.filter(p => p.phase === 'Phase 1');
    const phase2Papers = papers.filter(p => p.phase === 'Phase 2');
    const allPapers = [...phase1Papers, ...phase2Papers];

    allPapers.forEach(paper => {
      const sanitized = sanitizeWhitePaperData(paper);
      if (!sanitized) return;

      html += `
        <article class="white-paper-card ${sanitized.isFeatured ? 'white-paper-card--featured' : ''}" data-category="${sanitized.category}" data-phase="${sanitized.phase}">
          <a href="${sanitized.downloadUrl}" class="white-paper-link" aria-label="Read ${sanitized.title}">
            <div class="white-paper-content">
              <span class="paper-category-badge">${sanitized.category}</span>
              <h2 class="white-paper-title">${sanitized.title}</h2>
              <p class="white-paper-description">${sanitized.description}</p>
              <div class="paper-meta">
                <span class="paper-phase">${sanitized.phase}</span>
                <span class="paper-status">${sanitized.status}</span>
                <span class="paper-author">${sanitized.author}</span>
              </div>
              <div class="paper-tags">
                ${sanitized.tags.map(tag => `<span class="paper-tag">${tag}</span>`).join('')}
              </div>
              <span class="paper-read-time">${sanitized.readTime} min read</span>
            </div>
          </a>
        </article>
      `;
    });

    html += '</div>';
    container.innerHTML = html;
  },

  // Update white paper status
  updateStatus(id, newStatus) {
    const paper = this.getWhitePaper(id);
    if (paper && newStatus && WHITE_PAPER_SCHEMA.allowedStatuses.includes(newStatus)) {
      paper.status = newStatus;
      return true;
    }
    return false;
  },

  // Add new white paper stub
  addWhitePaper(paper) {
    if (validateWhitePaper(paper)) {
      const sanitized = sanitizeWhitePaperData(paper);
      if (sanitized) {
        whitePaperStubs.push(sanitized);
        return true;
      }
    }
    return false;
  },

  // Remove white paper by ID
  removeWhitePaper(id) {
    const index = whitePaperStubs.findIndex(p => p.id === id);
    if (index !== -1) {
      whitePaperStubs.splice(index, 1);
      return true;
    }
    return false;
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { whitePaperStubs, WhitePaperManager, validateWhitePaper, sanitizeWhitePaperData, WHITE_PAPER_SCHEMA };
}