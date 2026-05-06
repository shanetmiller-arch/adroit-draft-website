const NavigationConfig = {
  // Navigation items organized by phase
  // Phase 1 items are scaffold, Phase 2 items will be added as core content
  navItems: {
    // Always visible items (phase-agnostic)
    phaseAgnostic: [
      {
        id: 'home',
        label: 'Home',
        href: '#home',
        icon: '🏠',
        phase: 'all'
      },
      {
        id: 'about',
        label: 'About',
        href: '#about',
        icon: 'ℹ️',
        phase: 'all'
      },
      {
        id: 'contact',
        label: 'Contact',
        href: '#contact',
        icon: '📧',
        phase: 'all'
      }
    ],
    
    // Phase 1: scaffold foundation items
    phase1: [
      {
        id: 'proof',
        label: 'Proof',
        href: '#proof',
        icon: '🔍',
        phase: '1',
        description: 'Operational validation'
      },
      {
        id: 'workflow',
        label: 'Workflow',
        href: '#workflow',
        icon: '📊',
        phase: '1',
        description: 'Product lifecycle tracking'
      },
      {
        id: 'portfolio',
        label: 'Products',
        href: '#portfolio',
        icon: '📦',
        phase: '1',
        description: 'Product portfolio'
      }
    ],
    
    // Phase 2: core content items (placeholder for future expansion)
    phase2: [
      // Add new items here as Phase 2 content is developed
      {
        id: 'documentation',
        label: 'Documentation',
        href: '#documentation',
        icon: '📚',
        phase: '2',
        description: 'Technical documentation',
        status: 'placeholder'
      },
      {
        id: 'white-papers',
        label: 'White Papers',
        href: '#white-papers',
        icon: '📄',
        phase: '2',
        description: 'Technical white papers & operational insights'
      }
    ]
  },
  
  // Get items for current phase
  getPhaseItems(phase) {
    return this.navItems[phase] || [];
  },
  
  // Get all items in order
  getAllItems() {
    return [
      ...this.navItems.phaseAgnostic,
      ...this.navItems.phase1,
      ...this.navItems.phase2
    ];
  },
  
  // Check if item belongs to a phase
  isInPhase(id, phase) {
    const item = this.navItems.phaseAgnostic.find(i => i.id === id) ||
                this.navItems.phase1.find(i => i.id === id) ||
                this.navItems.phase2.find(i => i.id === id);
    return item && (item.phase === 'all' || item.phase === phase);
  },
  
  // Get available phases
  getAvailablePhases() {
    return ['all', '1', '2'];
  }
};

// Navigation Manager for dynamic rendering
const NavigationManager = {
  // Render navigation based on configuration
  render(containerSelector, phase = null) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    
    const items = phase 
      ? NavigationConfig.getPhaseItems(phase)
      : NavigationConfig.getAllItems();
    
    let html = '<ul class="nav-links">';
    
    items.forEach(item => {
      // Skip placeholder items unless explicitly requested
      if (item.status === 'placeholder' && !phase) return;
      
      html += `<li><a href="${item.href}" aria-label="${item.label}" class="nav-link" data-phase="${item.phase}">${item.label}</a></li>`;
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

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { NavigationConfig, NavigationManager };
}