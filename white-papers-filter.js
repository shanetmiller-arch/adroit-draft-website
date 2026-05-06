// White Papers Filter Module - Phase 2 core content
// Standalone filter functionality for white papers section

const WhitePapersFilter = {
  // Initialize white papers filtering
  init(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return null;
    
    const grid = container.querySelector('.white-papers-grid');
    if (!grid) return null;
    
    const btns = container.querySelectorAll('.filter-btn');
    if (btns.length === 0) return null;
    
    btns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.filter(grid, btn.getAttribute('data-filter'));
      });
    });
    
    return {
      filter: (grid, filter) => {
        const cards = grid.querySelectorAll('.white-paper-card');
        cards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        });
      }
    };
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WhitePapersFilter;
}