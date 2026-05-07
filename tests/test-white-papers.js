// @jest-environment node

const { whitePaperStubs, WHITE_PAPER_SCHEMA, validateWhitePaper, sanitizeWhitePaperData } = require('./../white-papers-data.js');
const { WhitePaperManager } = require('./../white-papers-data.js');

// Import the module to get the exported functions
const WhitePaperModule = require('../white-papers-data.js');

// Test the validation function with various edge cases

// ============ VALIDATION TESTS ============

// Test: Valid white paper passes validation
it('should validate a complete white paper stub', () => {
  const result = validateWhitePaper({
    id: 'test-paper',
    title: 'Test Title',
    category: 'product',
    description: 'Test description',
    phase: 'Phase 1',
    status: 'draft',
    author: 'Team',
    date: '2024-01-01',
    tags: ['tag1', 'tag2'],
    readTime: 10,
    downloadUrl: '#',
    isFeatured: true
  });
  expect(result).toBe(true);
});

// Test: Missing required fields fails validation
it('should reject white paper with missing required field', () => {
  const result = validateWhitePaper({
    id: 'test-paper',
    title: 'Test',
    description: 'Missing category'
  });
  expect(result).toBe(false);
});

// Test: Invalid category fails validation
it('should reject white paper with invalid category', () => {
  const result = validateWhitePaper({
    id: 'test-paper',
    title: 'Test',
    category: 'invalid-category',
    description: 'Test',
    phase: 'Phase 1',
    status: 'draft'
  });
  expect(result).toBe(false);
});

// Test: Invalid phase fails validation
it('should reject white paper with invalid phase', () => {
  const result = validateWhitePaper({
    id: 'test-paper',
    title: 'Test',
    category: 'product',
    description: 'Test',
    phase: 'Phase 99',
    status: 'draft'
  });
  expect(result).toBe(false);
});

// Test: Invalid status fails validation
it('should reject white paper with invalid status', () => {
  const result = validateWhitePaper({
    id: 'test-paper',
    title: 'Test',
    category: 'product',
    description: 'Test',
    phase: 'Phase 1',
    status: 'unknown-status'
  });
  expect(result).toBe(false);
});

// Test: Too many tags fails validation
it('should reject white paper with too many tags', () => {
  const result = validateWhitePaper({
    id: 'test-paper',
    title: 'Test',
    category: 'product',
    description: 'Test',
    phase: 'Phase 1',
    status: 'draft',
    tags: Array(6).fill('tag')
  });
  expect(result).toBe(false);
});

// Test: Tags must be strings (XSS prevention)
it('should reject white paper with non-string tags', () => {
  const result = validateWhitePaper({
    id: 'test-paper',
    title: 'Test',
    category: 'product',
    description: 'Test',
    phase: 'Phase 1',
    status: 'draft',
    tags: ['tag1', 123, 'tag2']
  });
  expect(result).toBe(false);
});

// Test: Invalid ID format fails validation
it('should reject white paper with invalid ID format', () => {
  const result = validateWhitePaper({
    id: 'invalid/id/with/slashes',
    title: 'Test',
    category: 'product',
    description: 'Test',
    phase: 'Phase 1',
    status: 'draft'
  });
  expect(result).toBe(false);
});

// Test: Read time out of bounds fails validation
it('should reject white paper with readTime > max', () => {
  const result = validateWhitePaper({
    id: 'test-paper',
    title: 'Test',
    category: 'product',
    description: 'Test',
    phase: 'Phase 1',
    status: 'draft',
    tags: [],
    readTime: 35
  });
  expect(result).toBe(false);
});

it('should reject white paper with readTime < min', () => {
  const result = validateWhitePaper({
    id: 'test-paper',
    title: 'Test',
    category: 'product',
    description: 'Test',
    phase: 'Phase 1',
    status: 'draft',
    tags: [],
    readTime: 0
  });
  expect(result).toBe(false);
});

// Test: XSS prevention in title sanitization
it('should sanitize XSS vectors in title', () => {
  const maliciousTitle = '<script>alert("XSS")</script>Test';
  const result = sanitizeWhitePaperData({
    id: 'test-paper',
    title: maliciousTitle,
    category: 'product',
    description: 'Test',
    phase: 'Phase 1',
    status: 'draft',
    tags: [],
    readTime: 10,
    downloadUrl: '#',
    isFeatured: false
  });
  expect(result).toBeDefined();
  expect(result.title).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;Test');
});

// Test: XSS prevention in description sanitization
it('should sanitize XSS vectors in description', () => {
  const maliciousDesc = '<img src=x onerror="alert(1)">Test';
  const result = sanitizeWhitePaperData({
    id: 'test-paper',
    title: 'Test',
    category: 'product',
    description: maliciousDesc,
    phase: 'Phase 1',
    status: 'draft',
    tags: [],
    readTime: 10,
    downloadUrl: '#',
    isFeatured: false
  });
  expect(result).toBeDefined();
  expect(result.description).toContain('&lt;img');
});

// Test: XSS prevention in tags sanitization
it('should sanitize XSS vectors in tags', () => {
  const maliciousTags = ['tag1', '<script>alert(1)</script>', 'tag3'];
  const result = sanitizeWhitePaperData({
    id: 'test-paper',
    title: 'Test',
    category: 'product',
    description: 'Test',
    phase: 'Phase 1',
    status: 'draft',
    tags: maliciousTags,
    readTime: 10,
    downloadUrl: '#',
    isFeatured: false
  });
  expect(result).toBeDefined();
  expect(result.tags[1]).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
});

// Test: Sanitize returns null for invalid data
it('should return null for invalid white paper data', () => {
  const result = sanitizeWhitePaperData({
    id: 'test-paper',
    title: 'Test',
    category: 'invalid',
    description: 'Test',
    phase: 'Phase 1',
    status: 'draft'
  });
  expect(result).toBeNull();
});

// Test: Sanitize does not mutate original data
it('should not mutate original white paper data', () => {
  const original = {
    id: 'test-paper',
    title: '<script>alert(1)</script>',
    category: 'product',
    description: 'Test',
    phase: 'Phase 1',
    status: 'draft',
    tags: [],
    readTime: 10,
    downloadUrl: '#',
    isFeatured: false
  };
  const originalTitle = original.title;
  const result = sanitizeWhitePaperData(original);
  expect(original.title).toBe(originalTitle);
  expect(result.title).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
});

// ============ WHITE PAPER MANAGER TESTS ============

// Test: getWhitePapers returns all stubs
it('should return all white paper stubs', () => {
  const papers = WhitePaperManager.getWhitePapers();
  expect(Array.isArray(papers)).toBe(true);
  expect(papers.length).toBeGreaterThan(0);
  expect(papers[0].id).toBeDefined();
  expect(papers[0].title).toBeDefined();
  expect(papers[0].status).toBeDefined();
});

// Test: getWhitePaper finds paper by ID
it('should find white paper by valid ID', () => {
  const paper = WhitePaperManager.getWhitePaper('pmris-paper');
  expect(paper).toBeDefined();
  expect(paper.title).toBe('PMRIS: Program Monitoring Reporting System');
  expect(paper.status).toBe('draft');
});

// Test: getWhitePaper returns undefined for missing ID
it('should return undefined for non-existent paper ID', () => {
  const paper = WhitePaperManager.getWhitePaper('non-existent-id');
  expect(paper).toBeUndefined();
});

// Test: getFeaturedWhitePapers returns featured papers only
it('should return only featured white papers', () => {
  const featured = WhitePaperManager.getFeaturedWhitePapers();
  expect(Array.isArray(featured)).toBe(true);
  featured.forEach(paper => {
    expect(paper.isFeatured).toBe(true);
  });
});

// Test: getFeaturedWhitePapers maintains stable order
it('should maintain stable order for featured papers', () => {
  const featured1 = WhitePaperManager.getFeaturedWhitePapers();
  const featured2 = WhitePaperManager.getFeaturedWhitePapers();
  expect(featured1).toEqual(featured2);
});

// Test: getByCategory filters papers correctly
it('should filter white papers by category', () => {
  const productPapers = WhitePaperManager.getByCategory('product');
  productPapers.forEach(paper => {
    expect(paper.category).toBe('product');
  });
  expect(productPapers.length).toBeGreaterThan(0);
});

// Test: getByCategory returns empty array for unknown category
it('should return empty array for unknown category', () => {
  const papers = WhitePaperManager.getByCategory('nonexistent');
  expect(papers).toEqual([]);
});

// Test: Data integrity - all stubs pass validation
it('should ensure all white paper stubs pass validation', () => {
  const papers = WhitePaperManager.getWhitePapers();
  papers.forEach(paper => {
    expect(validateWhitePaper(paper)).toBe(true);
  });
});

// Test: Data integrity - all stubs pass sanitization
it('should ensure all white paper stubs pass sanitization', () => {
  const papers = WhitePaperManager.getWhitePapers();
  papers.forEach(paper => {
    expect(sanitizeWhitePaperData(paper)).toBeDefined();
  });
});

// Test: Category enumeration matches schema
it('should have all stubs with allowed categories', () => {
  const papers = WhitePaperManager.getWhitePapers();
  const allowedCategories = WHITE_PAPER_SCHEMA.allowedCategories;
  papers.forEach(paper => {
    expect(allowedCategories.includes(paper.category)).toBe(true);
  });
});

// Test: Phase enumeration matches schema
it('should have all stubs with allowed phases', () => {
  const papers = WhitePaperManager.getWhitePapers();
  const allowedPhases = WHITE_PAPER_SCHEMA.allowedPhases;
  papers.forEach(paper => {
    expect(allowedPhases.includes(paper.phase)).toBe(true);
  });
});

// Test: Status enumeration matches schema
it('should have all stubs with allowed statuses', () => {
  const papers = WhitePaperManager.getWhitePapers();
  const allowedStatuses = WHITE_PAPER_SCHEMA.allowedStatuses;
  papers.forEach(paper => {
    expect(allowedStatuses.includes(paper.status)).toBe(true);
  });
});

// Test: Read time within bounds for all stubs
it('should have all stubs with readTime within bounds', () => {
  const papers = WhitePaperManager.getWhitePapers();
  papers.forEach(paper => {
    expect(paper.readTime >= WHITE_PAPER_SCHEMA.minReadTime).toBe(true);
    expect(paper.readTime <= WHITE_PAPER_SCHEMA.maxReadTime).toBe(true);
  });
});

// Test: Tags count within bounds for all stubs
it('should have all stubs with tags count within bounds', () => {
  const papers = WhitePaperManager.getWhitePapers();
  papers.forEach(paper => {
    expect(paper.tags.length >= WHITE_PAPER_SCHEMA.minTags).toBe(true);
    expect(paper.tags.length <= WHITE_PAPER_SCHEMA.maxTags).toBe(true);
  });
});

// Test: Stub data includes required summary/description field
it('should have all stubs with description for pre-publication listing', () => {
  const papers = WhitePaperManager.getWhitePapers();
  papers.forEach(paper => {
    expect(paper.description).toBeDefined();
    expect(paper.description.length).toBeGreaterThan(0);
  });
});
