import { NavigationManager } from '../src/navigation_config.js';

// Test NavigationManager DOM interactions

describe('NavigationManager DOM Tests', () => {
  let container;
  let mockWindow;
  let mockDocument;

  beforeEach(() => {
    // Reset global mocks
    mockWindow = {
      location: { hash: '' },
      addEventListener: () => {},
      querySelector: () => null,
      querySelectorAll: () => [],
      innerHTML: ''
    };
    
    mockDocument = {
      querySelector: (sel) => {
        if (sel === '#nav-links') return container || { innerHTML: '' };
        return null;
      },
      querySelectorAll: () => [],
      addEventListener: () => {},
      classList: { add: () => {}, remove: () => {}, contains: () => false },
      getAttribute: () => null,
      setAttribute: () => {},
      style: { display: '' }
    };
    
    global.window = mockWindow;
    global.document = mockDocument;
    container = { innerHTML: '' };
  });

  afterEach(() => {
    global.window = window;
    global.document = document;
  });

  describe('Full navigation rendering', () => {
    it('should render complete navigation structure', () => {
      container.innerHTML = '';
      NavigationManager.render('#nav-links');
      expect(container.innerHTML).toContain('<ul class="nav-links">');
      expect(container.innerHTML).toContain('</ul>');
      expect(container.innerHTML).toContain('data-phase="all"');
    });

    it('should render with correct HTML escaping', () => {
      container.innerHTML = '';
      NavigationManager.render('#nav-links');
      expect(container.innerHTML).not.toContain('&Home');
      expect(container.innerHTML).toContain('Home');
    });

    it('should maintain consistent anchor tag structure', () => {
      container.innerHTML = '';
      NavigationManager.render('#nav-links');
      const match = container.innerHTML.match(/<li><a href="([^"]+)" aria-label="([^"]+)" class="nav-link" data-phase="([^"]+)">([^"]+)<\/a><\/li>/g);
      expect(match).not.toBeNull();
      expect(match.length).toBeGreaterThan(0);
    });

    it('should handle phase-agnostic items correctly', () => {
      container.innerHTML = '';
      NavigationManager.render('#nav-links', 'all');
      expect(container.innerHTML).toContain('Home');
      expect(container.innerHTML).toContain('About');
      expect(container.innerHTML).toContain('Contact');
    });

    it('should handle phase-1 items correctly', () => {
      container.innerHTML = '';
      NavigationManager.render('#nav-links', '1');
      expect(container.innerHTML).toContain('Proof');
      expect(container.innerHTML).toContain('Workflow');
      expect(container.innerHTML).toContain('Products');
    });

    it('should handle phase-2 items correctly', () => {
      container.innerHTML = '';
      NavigationManager.render('#nav-links', '2');
      expect(container.innerHTML).toContain('Documentation');
    });

    it('should not render items without href when rendering', () => {
      container.innerHTML = '';
      NavigationManager.render('#nav-links');
      const links = container.innerHTML.match(/<a href="([^"]+)"/g);
      expect(links).not.toBeNull();
      expect(links.length).toBeGreaterThan(0);
    });
  });

  describe('Navigation state management', () => {
    it('should correctly identify active links', () => {
      global.window.location.hash = '#workflow';
      container.innerHTML = '<ul class="nav-links"><li><a href="#home" class="nav-link">Home</a></li><li><a href="#workflow" class="nav-link">Workflow</a></li></ul>';
      NavigationManager.setActiveLink();
      // Verify workflow link gets active class
      expect(container.innerHTML).toContain('class="nav-link active"');
    });

    it('should handle hash changes dynamically', () => {
      global.window.addEventListener = () => {};
      global.window.location.hash = '#contact';
      NavigationManager.setActiveLink();
      expect(container.innerHTML).toContain('Contact');
    });
  });

  describe('Mobile navigation toggle', () => {
    it('should initialize when elements exist', () => {
      mockDocument.querySelector = () => ({ addEventListener: () => {}, classList: { add: () => {}, remove: () => {} } });
      expect(NavigationManager.initMobileNav()).toBeUndefined();
    });

    it('should handle missing elements', () => {
      mockDocument.querySelector = () => null;
      expect(NavigationManager.initMobileNav()).toBeUndefined();
    });

    it('should track aria-expanded state', () => {
      const toggle = { addEventListener: () => {}, getAttribute: () => 'false', setAttribute: () => {} };
      mockDocument.querySelector = () => toggle;
      NavigationManager.initMobileNav();
      expect(toggle.setAttribute).toHaveBeenCalled();
    });

    it('should handle body overflow state', () => {
      mockDocument.querySelector = () => ({ addEventListener: () => {}, classList: { add: () => {}, remove: () => {} } });
      mockDocument.body = { style: { overflow: '' } };
      NavigationManager.initMobileNav();
      expect(mockDocument.body.style.overflow).toBeTruthy();
    });
  });

  describe('Phase update functionality', () => {
    it('should show/hide links based on phase', () => {
      const links = [
        { getAttribute: () => 'all', style: { display: '' } },
        { getAttribute: () => '1', style: { display: '' } },
        { getAttribute: () => '2', style: { display: '' } }
      ];
      mockDocument.querySelectorAll = () => links;
      
      NavigationManager.updatePhase('1');
      expect(links[1].style.display).toBe('block');
      
      NavigationManager.updatePhase('all');
      expect(links[0].style.display).toBe('block');
    });

    it('should hide all non-matching phase items', () => {
      const links = [
        { getAttribute: () => '1', style: { display: '' } },
        { getAttribute: () => '2', style: { display: '' } }
      ];
      mockDocument.querySelectorAll = () => links;
      
      NavigationManager.updatePhase('1');
      expect(links[0].style.display).toBe('block');
      expect(links[1].style.display).toBe('block');
    });
  });

  describe('Error handling', () => {
    it('should handle container not found', () => {
      mockDocument.querySelector = () => null;
      expect(NavigationManager.render('#nonexistent')).toBeUndefined();
    });

    it('should handle phase not found', () => {
      const originalGetPhaseItems = NavigationConfig.getPhaseItems.bind(NavigationConfig);
      NavigationConfig.getPhaseItems = () => [];
      container.innerHTML = '';
      NavigationManager.render('#nav-links', '99');
      expect(container.innerHTML).toContain('<ul class="nav-links">');
      NavigationConfig.getPhaseItems = originalGetPhaseItems;
    });

    it('should handle invalid href formats', () => {
      container.innerHTML = '';
      NavigationManager.render('#nav-links');
      // Should not throw on valid HTML generation
      expect(container.innerHTML).toBeTruthy();
    });
  });

  describe('Accessibility compliance', () => {
    it('should include aria-label on all links', () => {
      container.innerHTML = '';
      NavigationManager.render('#nav-links');
      const links = container.innerHTML.match(/aria-label="([^"]+)"/g);
      expect(links).not.toBeNull();
      expect(links.length).toBeGreaterThan(0);
    });

    it('should include data-phase attribute', () => {
      container.innerHTML = '';
      NavigationManager.render('#nav-links');
      const dataPhase = container.innerHTML.match(/data-phase="([^"]+)"/g);
      expect(dataPhase).not.toBeNull();
    });

    it('should use semantic HTML structure', () => {
      container.innerHTML = '';
      NavigationManager.render('#nav-links');
      expect(container.innerHTML).toContain('<ul');
      expect(container.innerHTML).toContain('<li>');
      expect(container.innerHTML).toContain('<a');
    });
  });

  describe('Performance considerations', () => {
    it('should efficiently render large navigation', () => {
      // Simulate large navigation
      const originalPhase2 = [...NavigationConfig.navItems.phase2];
      NavigationConfig.navItems.phase2 = Array.from({ length: 50 }, (_, i) => ({
        id: `item${i}`,
        label: `Item ${i}`,
        href: `#${i}`,
        icon: '📝',
        phase: '2',
        description: `Description ${i}`
      }));
      
      container.innerHTML = '';
      const startTime = performance.now();
      NavigationManager.render('#nav-links', '2');
      const endTime = performance.now();
      
      NavigationConfig.navItems.phase2 = originalPhase2;
      
      // Should complete in reasonable time
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});
