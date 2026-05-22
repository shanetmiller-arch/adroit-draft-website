// Tests for capabilities-data.js — Phase 2 core content depth module
// Verifies schema enforcement, XSS sanitization, and safe rendering.

const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body><div id="capabilities-grid"></div></body></html>', { url: 'http://localhost' });
global.window = dom.window;
global.document = dom.window.document;

const {
  capabilityStubs,
  CAPABILITY_SCHEMA,
  validateCapability,
  sanitizeCapabilityData,
  CapabilityManager
} = require('../capabilities-data.js');

describe('Capabilities — schema integrity', () => {
  it('ships every stub passing validation', () => {
    expect(capabilityStubs.length).toBeGreaterThan(0);
    capabilityStubs.forEach(c => {
      expect(validateCapability(c)).toBe(true);
    });
  });

  it('rejects a capability missing required fields', () => {
    const partial = { id: 'broken', domain: 'security' };
    expect(validateCapability(partial)).toBe(false);
  });

  it('rejects an unknown domain', () => {
    const bad = { ...capabilityStubs[0], domain: 'marketing' };
    expect(validateCapability(bad)).toBe(false);
  });

  it('rejects an unknown maturity tier', () => {
    const bad = { ...capabilityStubs[0], maturity: 'mythical' };
    expect(validateCapability(bad)).toBe(false);
  });

  it('rejects an unknown phase value', () => {
    const bad = { ...capabilityStubs[0], phase: 'Phase 99' };
    expect(validateCapability(bad)).toBe(false);
  });

  it('rejects an unknown CMMI level', () => {
    const bad = { ...capabilityStubs[0], cmmiLevel: 'L7' };
    expect(validateCapability(bad)).toBe(false);
  });

  it('rejects an id with disallowed characters (injection guard)', () => {
    const bad = { ...capabilityStubs[0], id: '<script>alert(1)</script>' };
    expect(validateCapability(bad)).toBe(false);
  });

  it('rejects outcomes exceeding max count', () => {
    const bad = { ...capabilityStubs[0], outcomes: new Array(CAPABILITY_SCHEMA.maxOutcomes + 1).fill('x') };
    expect(validateCapability(bad)).toBe(false);
  });

  it('rejects outcomes containing non-strings', () => {
    const bad = { ...capabilityStubs[0], outcomes: ['ok', 42, 'also-ok'] };
    expect(validateCapability(bad)).toBe(false);
  });

  it('rejects overlong title', () => {
    const bad = { ...capabilityStubs[0], title: 'x'.repeat(CAPABILITY_SCHEMA.maxTitleLen + 1) };
    expect(validateCapability(bad)).toBe(false);
  });

  it('rejects overlong detail', () => {
    const bad = { ...capabilityStubs[0], detail: 'x'.repeat(CAPABILITY_SCHEMA.maxDetailLen + 1) };
    expect(validateCapability(bad)).toBe(false);
  });
});

describe('Capabilities — sanitization (XSS defense)', () => {
  it('escapes HTML in title field', () => {
    const capability = { ...capabilityStubs[0], title: '<script>alert(1)</script>' };
    const safe = sanitizeCapabilityData(capability);
    expect(safe).not.toBeNull();
    expect(safe.title).not.toContain('<script>');
    expect(safe.title).toContain('&lt;script&gt;');
  });

  it('escapes HTML in summary field', () => {
    const capability = { ...capabilityStubs[0], summary: '<img src=x onerror=alert(1)>safe' };
    const safe = sanitizeCapabilityData(capability);
    expect(safe.summary).not.toContain('<img');
    expect(safe.summary).toContain('&lt;img');
  });

  it('escapes HTML in detail field', () => {
    const capability = { ...capabilityStubs[0], detail: 'hello <b>world</b>' };
    const safe = sanitizeCapabilityData(capability);
    expect(safe.detail).toContain('&lt;b&gt;');
    expect(safe.detail).not.toContain('<b>');
  });

  it('escapes HTML in each outcome entry', () => {
    const capability = { ...capabilityStubs[0], outcomes: ['ok', '<svg onload=alert(1)>'] };
    const safe = sanitizeCapabilityData(capability);
    expect(safe.outcomes[1]).not.toContain('<svg');
    expect(safe.outcomes[1]).toContain('&lt;svg');
  });

  it('returns null for invalid input rather than partial sanitization', () => {
    expect(sanitizeCapabilityData({ id: 'broken' })).toBeNull();
    expect(sanitizeCapabilityData(null)).toBeNull();
    expect(sanitizeCapabilityData(undefined)).toBeNull();
  });

  it('does not mutate the original capability', () => {
    const original = { ...capabilityStubs[0], outcomes: [...capabilityStubs[0].outcomes] };
    const snapshot = JSON.stringify(original);
    sanitizeCapabilityData(original);
    expect(JSON.stringify(original)).toBe(snapshot);
  });
});

describe('CapabilityManager — accessors', () => {
  it('getCapabilities returns a defensive copy', () => {
    const list = CapabilityManager.getCapabilities();
    list[0].title = 'mutated';
    list[0].outcomes.push('mutated-outcome');
    const fresh = CapabilityManager.getCapabilities();
    expect(fresh[0].title).not.toBe('mutated');
    expect(fresh[0].outcomes).not.toContain('mutated-outcome');
  });

  it('getCapability returns the matching record', () => {
    const sample = capabilityStubs[0];
    const fetched = CapabilityManager.getCapability(sample.id);
    expect(fetched).toBeDefined();
    expect(fetched.id).toBe(sample.id);
  });

  it('getCapability returns undefined for unknown ids', () => {
    expect(CapabilityManager.getCapability('does-not-exist')).toBeUndefined();
    expect(CapabilityManager.getCapability(null)).toBeUndefined();
  });

  it('getByDomain filters and rejects unknown domains', () => {
    const securityItems = CapabilityManager.getByDomain('security');
    securityItems.forEach(c => expect(c.domain).toBe('security'));
    expect(CapabilityManager.getByDomain('marketing')).toEqual([]);
  });

  it('getByProduct filters known product ids and ignores junk', () => {
    const rmfmCaps = CapabilityManager.getByProduct('rmfm');
    rmfmCaps.forEach(c => expect(c.product).toBe('rmfm'));
    expect(CapabilityManager.getByProduct(42)).toEqual([]);
  });
});

describe('CapabilityManager — rendering', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="capabilities-grid"></div>';
  });

  it('renders one card per stub when container exists', () => {
    CapabilityManager.renderCapabilities('#capabilities-grid');
    const cards = document.querySelectorAll('.capability-card');
    expect(cards.length).toBe(capabilityStubs.length);
  });

  it('writes safe data attributes (no raw injection)', () => {
    CapabilityManager.renderCapabilities('#capabilities-grid');
    document.querySelectorAll('.capability-card').forEach(card => {
      expect(card.getAttribute('data-domain')).toBeTruthy();
      expect(card.getAttribute('data-phase')).toBeTruthy();
      expect(card.getAttribute('data-product')).toBeTruthy();
      expect(card.getAttribute('data-cmmi')).toMatch(/^L[2-5]$/);
    });
  });

  it('exposes a CMMI label for screen readers', () => {
    CapabilityManager.renderCapabilities('#capabilities-grid');
    const badges = document.querySelectorAll('.capability-cmmi-badge');
    expect(badges.length).toBeGreaterThan(0);
    badges.forEach(b => expect(b.getAttribute('aria-label')).toMatch(/^CMMI L[2-5]$/));
  });

  it('is inert when the target selector matches nothing', () => {
    document.body.innerHTML = '';
    expect(() => CapabilityManager.renderCapabilities('#missing')).not.toThrow();
  });

  it('accepts an Element directly as the target', () => {
    const host = document.createElement('div');
    CapabilityManager.renderCapabilities(host);
    expect(host.querySelectorAll('.capability-card').length).toBe(capabilityStubs.length);
  });

  it('does not expand inline event-handler payloads in rendered HTML', () => {
    CapabilityManager.renderCapabilities('#capabilities-grid');
    const html = document.getElementById('capabilities-grid').innerHTML;
    expect(html).not.toMatch(/on\w+\s*=/i);
    expect(html).not.toContain('<script');
  });
});
