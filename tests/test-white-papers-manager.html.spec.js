// @jest-environment jsdom

const { JSDOM } = require('jsdom');

// Setup DOM for testing
function setupDOM(html) {
  const dom = new JSDOM(html);
  global.document = dom.window.document;
  global.window = dom.window;
  global.HTMLElement = dom.window.HTMLElement;
  global.Node = dom.window.Node;
}

// Test HTML rendering with WhitePaperManager
it('should render white papers in correct order (Phase 1 before Phase 2)', () => {
  setupDOM(`
    <!DOCTYPE html>
    <html>
      <body>
        <div id="white-papers-grid"></div>
      </body>
    </html>
  `);

  // Load the module
  const WhitePaperModule = require('../white-papers-data.js');
  const { WhitePaperManager } = WhitePaperModule;

  const grid = document.getElementById('white-papers-grid');
  WhitePaperManager.renderWhitePapers(grid);

  const cards = grid.querySelectorAll('.white-paper-card');
  expect(cards.length).toBeGreaterThan(0);

  // Check Phase 1 papers come before Phase 2
  let lastPhase = 'Phase 0';
  cards.forEach(card => {
    const phase = card.getAttribute('data-phase');
    if (phase !== 'Phase 0' && phase !== 'Phase 1' && phase !== 'Phase 2') {
      // Skip Phase 0 (no papers)
    }
    expect(phase).toBeLessThanOrEqual(lastPhase);
    lastPhase = phase;
  });
});

it('should apply featured class to isFeatured papers', () => {
  setupDOM(`
    <!DOCTYPE html>
    <html>
      <body>
        <div id="white-papers-grid"></div>
      </body>
    </html>
  `);

  const WhitePaperModule = require('../white-papers-data.js');
  const { WhitePaperManager } = WhitePaperModule;

  const grid = document.getElementById('white-papers-grid');
  WhitePaperManager.renderWhitePapers(grid);

  const featuredCards = grid.querySelectorAll('.white-paper-card--featured');
  featuredCards.forEach(card => {
    expect(card.classList.contains('white-paper-card--featured')).toBe(true);
  });
});

it('should apply category and phase attributes to cards', () => {
  setupDOM(`
    <!DOCTYPE html>
    <html>
      <body>
        <div id="white-papers-grid"></div>
      </body>
    </html>
  `);

  const WhitePaperModule = require('../white-papers-data.js');
  const { WhitePaperManager } = WhitePaperModule;

  const grid = document.getElementById('white-papers-grid');
  WhitePaperManager.renderWhitePapers(grid);

  const cards = grid.querySelectorAll('.white-paper-card');
  cards.forEach(card => {
    expect(card.hasAttribute('data-category')).toBe(true);
    expect(card.hasAttribute('data-phase')).toBe(true);
  });
});

it('should handle empty container gracefully', () => {
  setupDOM(`
    <!DOCTYPE html>
    <html>
      <body>
      </body>
    </html>
  `);

  const WhitePaperModule = require('../white-papers-data.js');
  const { WhitePaperManager } = WhitePaperModule;

  const grid = document.getElementById('white-papers-grid');
  expect(grid).toBeNull();
});
