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

// Add nav-open class styles for mobile menu
const style = document.createElement('style');
style.textContent = `
  .nav-open {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--brand-bg-alt);
    padding: var(--spacing-md);
    border-bottom: 1px solid rgba(0,0,0,0.08);
  }

  @media (prefers-color-scheme: dark) {
    .nav-open {
      background: var(--brand-bg-dark);
    }
  }
`;
document.head.appendChild(style);
