// ADROIT Draft Website - Main entry point for scripts
// Phase 1: scaffold - basic interactivity foundation

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