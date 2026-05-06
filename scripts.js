// ADROIT Draft Website - Main entry point for scripts
// Phase 1: scaffold - basic interactivity foundation

// Initialize navigation with extensible model
// Loads navigation configuration from NavigationConfig
// Supports phase-aware routing (Phase 1 scaffold, Phase 2 core content)
const NavigationManager = {
  // Render navigation based on configuration
  render(containerSelector, phase = null) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    
    const { navItems } = window.NavigationConfig;
    let html = '<ul class="nav-links">';
    
    // Render phase-agnostic items first
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
          document.body.style.overflow = '';
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

// Smooth scroll for anchor links
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
    const { ProductManager } = window;
    if (ProductManager) {
      ProductManager.renderProducts(productsContainer);
    } else {
      console.warn('ProductManager not available');
    }
  } catch (error) {
    console.error('Failed to render products:', error);
  }
}

// Initialize navigation management
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