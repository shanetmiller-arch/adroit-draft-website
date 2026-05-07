// ADROIT Draft Website - Main entry point for scripts
// Phase 1: scaffold - basic interactivity foundation
// Phase 2: core content - extended functionality including white papers
// Performance: Load scripts after performance monitoring

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', function() {
    try {
      const Performance = window.Performance;
      if (Performance) {
        Performance.init();
        // Load metrics from storage if available
        const savedMetrics = Performance.loadMetrics();
        if (savedMetrics) {
          console.log('[Performance] Loaded previous session metrics');
        }
      }
    } catch (error) {
      console.error('Performance initialization error:', error);
    }
  });
}

// Initialize analytics on DOM ready
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', function() {
    try {
      const Analytics = window.Analytics;
      if (Analytics) {
        Analytics.init();
      }
    } catch (error) {
      console.error('Analytics initialization error:', error);
    }
  });
}

// Initialize navigation with extensible model
// Loads navigation configuration from NavigationConfig
// Supports phase-aware routing (Phase 1 scaffold, Phase 2 core content)
// Audience alignment: dynamically renders navigation based on context
const NavigationManager = {
  // Render navigation based on configuration
  render(containerSelector, phase = null) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    
    const { navItems } = window.NavigationConfig;
    let html = '<ul class="nav-links">';
    
    // Render phase-agnostic items first (always visible)
    navItems.phaseAgnostic.forEach(item => {
      html += `<li><a href="${item.href}" aria-label="${item.label}" class="nav-link" data-phase="${item.phase}">${item.label}</a></li>`;
    });
    
    // Render phase-specific items
    [navItems.phase1, navItems.phase2].forEach(phaseGroup => {
      phaseGroup.forEach(item => {
        // Skip placeholder items unless explicitly requested
        if (item.status === 'placeholder' && !phase) return;
        
        html += `<li><a href="${item.href}" aria-label="${item.label}" class="nav-link" data-phase="${item.phase}">${item.label}</a></li>`;
      });
    });
    
    html += '</ul>';
    container.innerHTML = html;
  },
  
  // Initialize mobile navigation toggle
  initMobileNav() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (navToggle && navLinks) {
      navToggle.addEventListener('click', function() {
        const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', !isExpanded);
        
        if (!isExpanded) {
          navLinks.classList.add('nav-open');
          document.body.style.overflow = 'hidden'; // Prevent scroll when menu open
        } else {
          navLinks.classList.remove('nav-open');
          document.body.style.overflow = ''; // Restore scroll
        }
      });
      
      // Close navigation when clicking outside
      document.addEventListener('click', function(event) {
        if (!navToggle.contains(event.target) && !navLinks.contains(event.target)) {
          navToggle.setAttribute('aria-expanded', 'false');
          navLinks.classList.remove('nav-open');
          document.body.style.overflow = '';
        }
      });
    }
  },
  
  // Set active link based on current hash
  setActiveLink() {
    const navLinks = document.querySelectorAll('.nav-link');
    const hash = window.location.hash.slice(1);
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href.startsWith('#') && href === `#${hash}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  },
  
  // Update navigation for phase change
  updatePhase(phase) {
    // Remove non-phase items
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      const linkPhase = link.getAttribute('data-phase');
      if (linkPhase !== 'all' && linkPhase !== phase) {
        link.style.display = 'none';
      } else {
        link.style.display = 'block';
      }
    });
  }
};

// Mobile navigation toggle
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', function() {
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', !isExpanded);
    
    if (!isExpanded) {
      navLinks.classList.add('nav-open');
    } else {
      navLinks.classList.remove('nav-open');
    }
  });
}

// Smooth scroll for anchor links with performance optimization
const anchorLinks = document.querySelectorAll('a[href^="#"]');
anchorLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      e.preventDefault();
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Initialize products portfolio with maturity indicators
const productsContainer = document.getElementById('products-container');
if (productsContainer) {
  try {
    const ProductManager = window.ProductManager;
    if (ProductManager) {
      ProductManager.renderProducts(productsContainer);
    } else {
      console.warn('ProductManager not available');
    }
  } catch (error) {
    console.error('Failed to render products:', error);
  }
}

// Initialize white papers with structured data and filter functionality (Phase 2: audience alignment)
const whitePapersGrid = document.getElementById('white-papers-grid');

if (whitePapersGrid) {
  try {
    const WhitePaperManager = window.WhitePaperManager;
    if (WhitePaperManager) {
      WhitePaperManager.renderWhitePapers(whitePapersGrid);
    } else {
      console.warn('WhitePaperManager not available');
    }
  } catch (error) {
    console.error('Failed to render white papers:', error);
  }
}

// Initialize navigation management with audience awareness
try {
  const { NavigationManager, NavigationConfig } = window;
  if (NavigationManager) {
    // Render navigation after DOM is ready
    setTimeout(() => {
      NavigationManager.render('#nav-links');
      NavigationManager.initMobileNav();
      NavigationManager.setActiveLink();
      // Listen for hash changes to update active state
      window.addEventListener('hashchange', NavigationManager.setActiveLink);
    }, 100);
  }
} catch (error) {
  console.error('Navigation initialization error:', error);
}

// Initialize white papers filter functionality (Phase 2 feature) with debounce
const filterBtns = document.querySelectorAll('.filter-btn');

if (filterBtns.length > 0) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      // Update active state
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      const filter = this.getAttribute('data-filter');
      
      // Filter cards
      const cards = whitePapersGrid.querySelectorAll('.white-paper-card');
      cards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// Initialize Engagement Pathways section interaction (Phase 1: scaffold)
const pathwaysSection = document.getElementById('engagement-pathways');

if (pathwaysSection) {
  // Add click handlers for pathway cards to enable future interactivity
  const pathwayCards = pathwaysSection.querySelectorAll('.pathway-card');
  pathwayCards.forEach(card => {
    card.addEventListener('click', function(e) {
      // Track pathway engagement for analytics
      if (window.Analytics) {
        window.Analytics.trackPathwayEngagement(this.getAttribute('data-pathway'));
      }
    });
  });
}

// Track scroll depth for analytics
window.addEventListener('scroll', function() {
  if (window.Analytics) {
    window.Analytics.trackScrollDepth();
  }
}, { passive: true });

// Track product interactions
const portfolioCards = document.querySelectorAll('.portfolio-card');
portfolioCards.forEach(card => {
  card.addEventListener('click', function(e) {
    if (window.Analytics) {
      const productId = this.querySelector('.portfolio-card--flagship') 
        ? 'rmfm' 
        : this.querySelector('.portfolio-badge')?.textContent.toLowerCase();
      window.Analytics.trackProductInteraction(productId, 'view');
    }
  });
});