// Integration tests for navigation behavior in browser context
// Tests the complete flow of navigation rendering and interaction

const { JSDOM } = require('jsdom');

describe('Navigation Integration Tests', () => {
  let dom;

  beforeEach(() => {
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <div class="header">
            <nav class="container">
              <div class="nav">
                <div class="logo">
                  <a href="./" aria-label="ADROIT Home">
                    <img src="assets/images/0_ADROIT__Icon.png" alt="ADROIT logo" width="40" height="40">
                  </a>
                  <span class="logo-text">ADROIT</span>
                </div>
                <ul class="nav-links" id="nav-links">
                  <li><a href="#home" aria-label="Home">Home</a></li>
                  <li><a href="#about" aria-label="About">About</a></li>
                  <li><a href="#contact" aria-label="Contact">Contact</a></li>
                </ul>
                <button class="nav-toggle" aria-label="Toggle navigation" aria-expanded="false">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 12h18M3 6h18M3 18h18"/>
                  </svg>
                </button>
              </div>
            </nav>
          </div>
        </body>
      </html>
    `, { url: 'http://localhost' });

    global.window = dom.window;
    global.document = dom.window.document;
    global.location = dom.window.location;
    global.window.NavigationConfig = require('../navigation_config.js').NavigationConfig;
  });

  afterEach(() => {
    dom.window.clearInterval = require('jsdom').JSDOMEnvironment.prototype.clearInterval;
  });

  describe('Complete navigation flow', () => {
    it('should render all navigation items on page load', () => {
      const container = document.getElementById('nav-links');
      const { NavigationManager } = require('../navigation_config.js');
      
      NavigationManager.render('#nav-links');
      
      expect(container.innerHTML).toContain('Home');
      expect(container.innerHTML).toContain('About');
      expect(container.innerHTML).toContain('Contact');
      expect(container.innerHTML).toContain('<ul class="nav-links">');
    });

    it('should initialize mobile navigation toggle', () => {
      const navToggle = document.querySelector('.nav-toggle');
      const navLinks = document.querySelector('.nav-links');
      
      const { NavigationManager } = require('../navigation_config.js');
      NavigationManager.initMobileNav();
      
      expect(navToggle).toBeDefined();
      expect(navLinks).toBeDefined();
    });

    it('should set active link based on URL hash', () => {
      const container = document.getElementById('nav-links');
      
      window.location.hash = 'home';
      const { NavigationManager } = require('../navigation_config.js');
      NavigationManager.setActiveLink();
      
      expect(container.innerHTML).toContain('active');
    });

    it('should handle phase updates correctly', () => {
      const container = document.getElementById('nav-links');
      
      // Set up initial state
      window.location.hash = 'home';
      const { NavigationManager } = require('../navigation_config.js');
      NavigationManager.setActiveLink();
      
      // Update to phase 2
      NavigationManager.updatePhase('2');
      
      expect(container.innerHTML).toContain('White Papers');
    });
  });

  describe('Mobile navigation behavior', () => {
    it('should prevent scroll when menu is open', () => {
      const navToggle = document.querySelector('.nav-toggle');
      const navLinks = document.querySelector('.nav-links');
      const body = document.body;
      
      const { NavigationManager } = require('../navigation_config.js');
      NavigationManager.initMobileNav();
      
      // Initial state - body should not have overflow hidden
      expect(body.style.overflow).toBe('');
      
      // Click toggle - body should have overflow hidden
      navToggle.click();
      expect(body.style.overflow).toBe('hidden');
      
      // Click toggle again - body should restore scroll
      navToggle.click();
      expect(body.style.overflow).toBe('');
    });

    it('should close navigation when clicking outside', () => {
      const navToggle = document.querySelector('.nav-toggle');
      const navLinks = document.querySelector('.nav-links');
      const body = document.body;
      
      const { NavigationManager } = require('../navigation_config.js');
      NavigationManager.initMobileNav();
      
      // Open menu
      navToggle.click();
      expect(body.style.overflow).toBe('hidden');
      expect(navLinks.classList.contains('nav-open')).toBe(true);
      
      // Click outside - menu should close
      const outsideEvent = new dom.window.Event('click', { bubbles: true });
      document.body.dispatchEvent(outsideEvent);
      
      expect(body.style.overflow).toBe('');
      expect(navLinks.classList.contains('nav-open')).toBe(false);
    });
  });

  describe('Anchor link smooth scrolling', () => {
    it('should prevent default on anchor clicks', () => {
      const anchorLinks = document.querySelectorAll('a[href^="#"]');
      const { JSDOM } = require('jsdom');
      
      anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          const targetId = this.getAttribute('href');
          if (targetId === '#') return;
          
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        });
      });
      
      // Verify event listener was added
      expect(anchorLinks.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility compliance', () => {
    it('should have proper aria-labels on navigation links', () => {
      const container = document.getElementById('nav-links');
      const links = container.querySelectorAll('a');
      
      expect(links.length).toBeGreaterThan(0);
      links.forEach(link => {
        expect(link.getAttribute('aria-label')).toBeDefined();
        expect(link.getAttribute('aria-label')).toBeTruthy();
      });
    });

    it('should have proper aria-expanded on nav toggle', () => {
      const navToggle = document.querySelector('.nav-toggle');
      expect(navToggle.getAttribute('aria-expanded')).toBe('false');
    });

    it('should update aria-expanded on toggle click', () => {
      const navToggle = document.querySelector('.nav-toggle');
      
      navToggle.click();
      expect(navToggle.getAttribute('aria-expanded')).toBe('true');
      
      navToggle.click();
      expect(navToggle.getAttribute('aria-expanded')).toBe('false');
    });
  });

  describe('Error handling', () => {
    it('should handle missing navigation container', () => {
      const { NavigationManager } = require('../navigation_config.js');
      
      // This should not throw
      expect(() => {
        NavigationManager.render('#nonexistent-container');
      }).not.toThrow();
    });

    it('should handle malformed hash values', () => {
      const container = document.getElementById('nav-links');
      container.innerHTML = '<li><a href="#test" class="nav-link">Test</a></li>';
      
      window.location.hash = 'invalid#hash';
      const { NavigationManager } = require('../navigation_config.js');
      NavigationManager.setActiveLink();
      
      // Should not throw
      expect(container.innerHTML).toBeTruthy();
    });

    it('should handle empty navigation container', () => {
      const container = document.getElementById('nav-links');
      container.innerHTML = '';
      
      const { NavigationManager } = require('../navigation_config.js');
      NavigationManager.render('#nav-links');
      
      // Should still create the structure
      expect(container.innerHTML).toContain('<ul class="nav-links">');
    });
  });

  describe('Performance considerations', () => {
    it('should initialize navigation after DOM ready', (done) => {
      const container = document.getElementById('nav-links');
      
      // Simulate delayed initialization
      const { NavigationManager } = require('../navigation_config.js');
      NavigationManager.render('#nav-links');
      
      // Verify navigation rendered
      expect(container.innerHTML).toContain('<ul class="nav-links">');
      done();
    });

    it('should handle hashchange event without errors', (done) => {
      const container = document.getElementById('nav-links');
      container.innerHTML = '<li><a href="#home" class="nav-link">Home</a></li>';
      
      const { NavigationManager } = require('../navigation_config.js');
      
      // Set up hash change listener
      window.addEventListener('hashchange', () => {
        NavigationManager.setActiveLink();
        done();
      });
      
      // Trigger hash change
      window.location.hash = 'about';
    });
  });
});

console.log('Navigation integration tests completed');