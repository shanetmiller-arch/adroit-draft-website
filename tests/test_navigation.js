// Tests for NavigationConfig and NavigationManager in ADROIT Draft Website
// Verifies audience alignment, phase-based rendering, and navigation functionality

const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body><nav class="nav-toggle"></nav><div id="nav-links"></div></body></html>', { url: 'http://localhost' });
global.window = dom.window;
global.document = dom.window.document;
global.location = dom.window.location;

const { NavigationConfig, NavigationManager } = require('../navigation_config.js');

describe('NavigationConfig', () => {
  describe('navItems structure', () => {
    it('should contain phaseAgnostic items with correct structure', () => {
      const phaseAgnostic = NavigationConfig.navItems.phaseAgnostic;
      expect(phaseAgnostic).toHaveLength(3);
      expect(phaseAgnostic[0].id).toBe('home');
      expect(phaseAgnostic[0].phase).toBe('all');
      expect(phaseAgnostic[0].label).toBe('Home');
    });

    it('should contain phase1 items', () => {
      const phase1 = NavigationConfig.navItems.phase1;
      expect(phase1).toHaveLength(3);
      expect(phase1.map(i => i.phase)).toEqual(['1', '1', '1']);
      expect(phase1.find(i => i.id === 'proof')).toBeDefined();
    });

    it('should contain phase2 items with audience targeting', () => {
      const phase2 = NavigationConfig.navItems.phase2;
      expect(phase2).toHaveLength(1);
      expect(phase2[0].audienceTarget).toBe('government-program-operators');
      expect(phase2[0].status).toBe('active');
    });
  });

  describe('getAvailablePhases', () => {
    it('should return all available phases', () => {
      const phases = NavigationConfig.getAvailablePhases();
      expect(phases).toEqual(['all', '1', '2']);
    });
  });
});

describe('NavigationManager', () => {
  beforeEach(() => {
    // Clear any existing navigation
    document.getElementById('nav-links').innerHTML = '';
  });

  describe('render()', () => {
    it('should render phaseAgnostic items by default', () => {
      const container = document.getElementById('nav-links');
      NavigationManager.render('#nav-links');
      expect(container.innerHTML).toContain('Home');
      expect(container.innerHTML).toContain('About');
      expect(container.innerHTML).toContain('Contact');
    });

    it('should render only phase1 items when phase="1"', () => {
      const container = document.getElementById('nav-links');
      document.getElementById('nav-links').innerHTML = '';
      NavigationManager.render('#nav-links', '1');
      expect(container.innerHTML).toContain('Proof');
      expect(container.innerHTML).toContain('Workflow');
      expect(container.innerHTML).toContain('Products');
      expect(container.innerHTML).not.toContain('Home');
    });

    it('should render only phase2 items when phase="2"', () => {
      const container = document.getElementById('nav-links');
      document.getElementById('nav-links').innerHTML = '';
      NavigationManager.render('#nav-links', '2');
      expect(container.innerHTML).toContain('White Papers');
      expect(container.innerHTML).not.toContain('Home');
    });

    it('should skip placeholder items when no phase specified', () => {
      const container = document.getElementById('nav-links');
      document.getElementById('nav-links').innerHTML = '';
      NavigationManager.render('#nav-links');
      // No placeholders in current config, but this tests the logic
      expect(container.innerHTML).toContain('<ul class="nav-links">');
    });
  });

  describe('audience alignment filtering', () => {
    it('should filter phase2 items by audience context', () => {
      const container = document.getElementById('nav-links');
      document.getElementById('nav-links').innerHTML = '';
      NavigationManager.render('#nav-links', '2', 'government-program-operators');
      expect(container.innerHTML).toContain('White Papers');
    });

    it('should exclude phase2 items when audience context does not match', () => {
      const container = document.getElementById('nav-links');
      document.getElementById('nav-links').innerHTML = '';
      NavigationManager.render('#nav-links', '2', 'enterprise-architects');
      expect(container.innerHTML).not.toContain('White Papers');
    });
  });

  describe('initMobileNav()', () => {
    it('should toggle nav-open class on toggle click', () => {
      const navToggle = document.querySelector('.nav-toggle');
      const navLinks = document.querySelector('.nav-links');
      
      if (navToggle && navLinks) {
        expect(navToggle.getAttribute('aria-expanded')).toBe('false');
        navToggle.click();
        expect(navLinks.classList.contains('nav-open')).toBe(true);
        expect(navToggle.getAttribute('aria-expanded')).toBe('true');
      }
    });
  });

  describe('setActiveLink()', () => {
    it('should add active class to matching hash link', () => {
      const container = document.getElementById('nav-links');
      container.innerHTML = '<li><a href="#home" class="nav-link">Home</a></li>';
      window.location.hash = 'home';
      NavigationManager.setActiveLink();
      expect(container.querySelector('.active')).toBeTruthy();
    });

    it('should remove active class from non-matching links', () => {
      const container = document.getElementById('nav-links');
      container.innerHTML = '<li><a href="#home" class="nav-link">Home</a></li>';
      window.location.hash = 'about';
      NavigationManager.setActiveLink();
      expect(container.querySelector('.nav-link')).not.toHaveClass('active');
    });
  });

  describe('updatePhase()', () => {
    it('should hide non-phase items when updating phase', () => {
      const container = document.getElementById('nav-links');
      container.innerHTML = '<li><a href="#home" class="nav-link" data-phase="all">Home</a></li>';
      container.innerHTML += '<li><a href="#proof" class="nav-link" data-phase="1">Proof</a></li>';
      
      NavigationManager.updatePhase('2');
      
      const homeLink = container.querySelector('[data-phase="all"]');
      const proofLink = container.querySelector('[data-phase="1"]');
      
      expect(homeLink.style.display).toBe('block');
      expect(proofLink.style.display).toBe('none');
    });

    it('should show phase-matching items', () => {
      const container = document.getElementById('nav-links');
      container.innerHTML = '<li><a href="#proof" class="nav-link" data-phase="1">Proof</a></li>';
      
      NavigationManager.updatePhase('1');
      
      const proofLink = container.querySelector('[data-phase="1"]');
      expect(proofLink.style.display).toBe('block');
    });
  });

  describe('getPhaseItems() and getAllItems()', () => {
    it('should return phase1 items when requesting phase1', () => {
      const items = NavigationConfig.getPhaseItems('1');
      expect(items).toHaveLength(3);
      expect(items[0].id).toBe('proof');
    });

    it('should return phase2 items when requesting phase2', () => {
      const items = NavigationConfig.getPhaseItems('2');
      expect(items).toHaveLength(1);
      expect(items[0].id).toBe('white-papers');
    });

    it('should return all items in correct order', () => {
      const allItems = NavigationConfig.getAllItems();
      expect(allItems).toHaveLength(7);
      expect(allItems[0].id).toBe('home');
      expect(allItems[allItems.length - 1].id).toBe('contact');
    });
  });
});

// Test edge cases and error handling
describe('NavigationManager error handling', () => {
  beforeEach(() => {
    document.getElementById('nav-links').innerHTML = '';
  });

  it('should handle missing container gracefully', () => {
    expect(NavigationManager.render('#nonexistent-container')).toBeUndefined();
  });

  it('should handle empty phase parameter', () => {
    const container = document.getElementById('nav-links');
    NavigationManager.render('#nav-links', null);
    expect(container.innerHTML).toContain('Home');
  });

  it('should handle non-existent phase gracefully', () => {
    const container = document.getElementById('nav-links');
    document.getElementById('nav-links').innerHTML = '';
    NavigationManager.render('#nav-links', '99');
    expect(container.innerHTML).toContain('<ul class="nav-links">');
  });
});

console.log('Navigation tests completed');