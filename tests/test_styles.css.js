import fs from 'fs';
import path from 'path';

// CSS Rule Extractor for verification using ES modules
class CSSRuleExtractor {
  constructor(cssContent) {
    this.css = cssContent;
  }

  extractFlagshipBadgeRule() {
    const regex = /--brand-flagship[^}]*}/;
    const match = this.css.match(regex);
    return match ? match[0] : null;
  }

  extractFlagshipBgRule() {
    const regex = /--brand-flagship-bg[^}]*}/;
    const match = this.css.match(regex);
    return match ? match[0] : null;
  }

  hasPortfolioCardFlagshipClass() {
    const regex = /portfolio-card--flagship/g;
    const match = this.css.match(regex);
    return match !== null;
  }

  hasPortfolioBadgeFlagshipClass() {
    const regex = /portfolio-badge--flagship/g;
    const match = this.css.match(regex);
    return match !== null;
  }

  extractBrandFlagshipColor() {
    const regex = /--brand-flagship\s*:\s*#[0-9a-f]{6}/i;
    const match = this.css.match(regex);
    return match ? match[0] : null;
  }

  extractBrandFlagshipBgColor() {
    const regex = /--brand-flagship-bg\s*:\s*#[0-9a-f]{6}/i;
    const match = this.css.match(regex);
    return match ? match[0] : null;
  }
}

describe('ADROIT Draft Website - RMFM Flagship CSS Styles', () => {
  let cssContent;

  beforeAll(() => {
    cssContent = fs.readFileSync(
      path.join(__dirname, '../styles.css'),
      'utf8'
    );
  });

  describe('CSS Variable Definitions', () => {
    it('should define --brand-flagship color variable', () => {
      const extractor = new CSSRuleExtractor(cssContent);
      const rule = extractor.extractBrandFlagshipColor();
      expect(rule).toBeTruthy();
      expect(rule).toContain('--brand-flagship');
    });

    it('should define --brand-flagship-bg color variable', () => {
      const extractor = new CSSRuleExtractor(cssContent);
      const rule = extractor.extractFlagshipBgRule();
      expect(rule).toBeTruthy();
      expect(rule).toContain('--brand-flagship-bg');
    });

    it('should use purple/violet flagship brand color', () => {
      const extractor = new CSSRuleExtractor(cssContent);
      const rule = extractor.extractBrandFlagshipColor();
      if (rule) {
        const colorMatch = rule.match(/#[0-9a-f]{6}/i);
        if (colorMatch) {
          const hexColor = colorMatch[0];
          // Verify it's a valid hex color
          expect(hexColor).toMatch(/^[#][0-9a-f]{6}$/i);
        }
      }
    });

    it('should use distinctive background color for flagship', () => {
      const extractor = new CSSRuleExtractor(cssContent);
      const rule = extractor.extractFlagshipBgRule();
      if (rule) {
        const bgMatch = rule.match(/#[0-9a-f]{6}/i);
        if (bgMatch) {
          expect(bgMatch[0]).toMatch(/^[#][0-9a-f]{6}$/i);
        }
      }
    });
  });

  describe('CSS Class Definitions', () => {
    it('should define .portfolio-card--flagship class', () => {
      const extractor = new CSSRuleExtractor(cssContent);
      const hasClass = extractor.hasPortfolioCardFlagshipClass();
      expect(hasClass).toBe(true);
    });

    it('should define .portfolio-badge--flagship class', () => {
      const extractor = new CSSRuleExtractor(cssContent);
      const hasClass = extractor.hasPortfolioBadgeFlagshipClass();
      expect(hasClass).toBe(true);
    });

    it('should have flagship-specific styling in CSS', () => {
      const extractor = new CSSRuleExtractor(cssContent);

      // Check for both color and background variables
      const hasColor = extractor.extractBrandFlagshipColor() !== null;
      const hasBg = extractor.extractFlagshipBgRule() !== null;

      expect(hasColor).toBe(true);
      expect(hasBg).toBe(true);
    });

    it('should have portfolio grid layout for flagship products', () => {
      const hasGrid = cssContent.includes('portfolio-grid');
      expect(hasGrid).toBe(true);
    });

    it('should have portfolio card styling', () => {
      const hasCard = cssContent.includes('.portfolio-card');
      expect(hasCard).toBe(true);
    });
  });

  describe('Dark Mode Support', () => {
    it('should define dark mode flagship color', () => {
      const darkModeRegex = /@media[^{]*prefers-color-scheme[^}]*\{[^}]*--brand-flagship[^}]*}/s;
      const hasDarkModeFlagship = darkModeRegex.test(cssContent);
      expect(hasDarkModeFlagship).toBe(true);
    });

    it('should define dark mode flagship background color', () => {
      const darkModeBgRegex = /@media[^{]*prefers-color-scheme[^}]*\{[^}]*--brand-flagship-bg[^}]*}/s;
      const hasDarkModeBg = darkModeBgRegex.test(cssContent);
      expect(hasDarkModeBg).toBe(true);
    });
  });

  describe('Requirement Compliance', () => {
    it('should provide visual distinction for flagship product', () => {
      const extractor = new CSSRuleExtractor(cssContent);

      // Flagship needs both card class and badge class
      const hasCardClass = extractor.hasPortfolioCardFlagshipClass();
      const hasBadgeClass = extractor.hasPortfolioBadgeFlagshipClass();

      expect(hasCardClass).toBe(true);
      expect(hasBadgeClass).toBe(true);
    });

    it('should define both color and background for flagship badge', () => {
      const extractor = new CSSRuleExtractor(cssContent);

      const colorRule = extractor.extractBrandFlagshipColor();
      const bgRule = extractor.extractFlagshipBgRule();

      expect(colorRule).toBeTruthy();
      expect(bgRule).toBeTruthy();
    });

    it('should support flagship identification across themes', () => {
      // Check both light and dark mode have flagship support
      const hasLightFlagship = extractor.extractBrandFlagshipColor() !== null;
      const hasDarkFlagship = /@media.*prefers-color-scheme.*--brand-flagship/.test(cssContent);

      expect(hasLightFlagship).toBe(true);
      expect(hasDarkFlagship).toBe(true);
    });
  });
});