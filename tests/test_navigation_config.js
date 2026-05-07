// Unit tests for NavigationConfig static methods
// Verifies the configuration structure and helper methods

describe('NavigationConfig helper methods', () => {
  describe('isInPhase()', () => {
    it('should find phaseAgnostic item', () => {
      const result = NavigationConfig.isInPhase('home', '1');
      expect(result).toBe(true);
    });

    it('should find phase1 item with matching phase', () => {
      const result = NavigationConfig.isInPhase('proof', '1');
      expect(result).toBe(true);
    });

    it('should find phase2 item with matching phase', () => {
      const result = NavigationConfig.isInPhase('white-papers', '2');
      expect(result).toBe(true);
    });

    it('should return false for non-existent item', () => {
      const result = NavigationConfig.isInPhase('nonexistent', '1');
      expect(result).toBe(false);
    });

    it('should return false for wrong phase', () => {
      const result = NavigationConfig.isInPhase('proof', '2');
      expect(result).toBe(false);
    });
  });

  describe('getAvailablePhases()', () => {
    it('should return exactly three phases', () => {
      const phases = NavigationConfig.getAvailablePhases();
      expect(phases.length).toBe(3);
      expect(phases).toContain('all');
      expect(phases).toContain('1');
      expect(phases).toContain('2');
    });

    it('should return phases in correct order', () => {
      const phases = NavigationConfig.getAvailablePhases();
      expect(phases[0]).toBe('all');
      expect(phases[1]).toBe('1');
      expect(phases[2]).toBe('2');
    });
  });

  describe('Configuration data integrity', () => {
    it('should have exactly 3 phaseAgnostic items', () => {
      const phaseAgnostic = NavigationConfig.navItems.phaseAgnostic;
      expect(phaseAgnostic.length).toBe(3);
      expect(phaseAgnostic.every(i => i.phase === 'all')).toBe(true);
    });

    it('should have exactly 3 phase1 items', () => {
      const phase1 = NavigationConfig.navItems.phase1;
      expect(phase1.length).toBe(3);
      expect(phase1.every(i => i.phase === '1')).toBe(true);
    });

    it('should have exactly 1 phase2 item', () => {
      const phase2 = NavigationConfig.navItems.phase2;
      expect(phase2.length).toBe(1);
      expect(phase2.every(i => i.phase === '2')).toBe(true);
    });

    it('should have required fields in all navigation items', () => {
      const allItems = [...NavigationConfig.navItems.phaseAgnostic, ...NavigationConfig.navItems.phase1, ...NavigationConfig.navItems.phase2];
      allItems.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('label');
        expect(item).toHaveProperty('href');
        expect(item).toHaveProperty('icon');
        expect(item).toHaveProperty('phase');
      });
    });

    it('should have description in phase1 items', () => {
      const phase1 = NavigationConfig.navItems.phase1;
      expect(phase1.every(i => i.description)).toBe(true);
    });

    it('should have audienceTarget and status in phase2 items', () => {
      const phase2 = NavigationConfig.navItems.phase2;
      expect(phase2.every(i => i.audienceTarget && i.status)).toBe(true);
    });
  });

  describe('getPhaseItems() edge cases', () => {
    it('should return empty array for non-existent phase', () => {
      const items = NavigationConfig.getPhaseItems('99');
      expect(items).toEqual([]);
    });

    it('should return phaseAgnostic when phase is "all"', () => {
      const items = NavigationConfig.getPhaseItems('all');
      expect(items).toHaveLength(3);
    });

    it('should handle null input gracefully', () => {
      const items = NavigationConfig.getPhaseItems(null);
      expect(items).toEqual([]);
    });
  });

  describe('getAllItems() integrity', () => {
    it('should return items in correct order', () => {
      const allItems = NavigationConfig.getAllItems();
      const ids = allItems.map(i => i.id);
      
      // Check order: phaseAgnostic first, then phase1, then phase2
      expect(ids[0]).toBe('home');
      expect(ids[1]).toBe('about');
      expect(ids[2]).toBe('contact');
      expect(ids[3]).toBe('proof');
      expect(ids[4]).toBe('workflow');
      expect(ids[5]).toBe('portfolio');
      expect(ids[6]).toBe('white-papers');
    });

    it('should return correct total count', () => {
      const allItems = NavigationConfig.getAllItems();
      expect(allItems.length).toBe(7);
    });

    it('should preserve item properties', () => {
      const allItems = NavigationConfig.getAllItems();
      expect(allItems[0]).toHaveProperty('href');
      expect(allItems[0]).toHaveProperty('aria-label');
      expect(allItems[0]).toHaveProperty('data-phase');
    });
  });
});

// Test business requirement alignment
describe('Audience Alignment Requirements', () => {
  it('should include white-papers in phase2 for government-program-operators audience', () => {
    const phase2 = NavigationConfig.navItems.phase2;
    expect(phase2.some(i => i.id === 'white-papers')).toBe(true);
    expect(phase2[0].audienceTarget).toBe('government-program-operators');
  });

  it('should have operational proof in phase1', () => {
    const phase1 = NavigationConfig.navItems.phase1;
    expect(phase1.some(i => i.id === 'proof')).toBe(true);
    expect(phase1.some(i => i.description === 'Operational validation')).toBe(true);
  });

  it('should have products in phase1', () => {
    const phase1 = NavigationConfig.navItems.phase1;
    expect(phase1.some(i => i.id === 'portfolio')).toBe(true);
    expect(phase1.some(i => i.description === 'Product portfolio')).toBe(true);
  });

  it('should have workflow tracking in phase1', () => {
    const phase1 = NavigationConfig.navItems.phase1;
    expect(phase1.some(i => i.id === 'workflow')).toBe(true);
    expect(phase1.some(i => i.description === 'Product lifecycle tracking')).toBe(true);
  });
});

console.log('NavigationConfig tests completed');