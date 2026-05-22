const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

// Resolve the implementation relative to the repo root. Adjust if products.js
// lives in a subdirectory (e.g. assets/js/products.js).
let productsModule;
try {
  productsModule = require(path.resolve(process.cwd(), 'products.js'));
} catch (e) {
  try {
    productsModule = require(path.resolve(process.cwd(), 'assets/js/products.js'));
  } catch (e2) {
    try {
      productsModule = require(path.resolve(process.cwd(), 'js/products.js'));
    } catch (e3) {
      throw new Error('Could not locate products.js — tried root, assets/js, js/');
    }
  }
}

const { productStubs, ProductManager, validateProduct, sanitizeProductData, productDetailHref } = productsModule;

test('productDetailHref returns dedicated page for rmfm (depth layer exists)', () => {
  assert.equal(productDetailHref('rmfm'), 'rmfm.html');
});

test('productDetailHref returns dedicated page for pmris (depth layer exists)', () => {
  assert.equal(productDetailHref('pmris'), 'pmris.html');
});

test('productDetailHref falls back to in-page anchor for unknown product (graceful degradation)', () => {
  assert.equal(productDetailHref('unknown-product'), '#unknown-product');
});

test('productDetailHref handles empty id without throwing', () => {
  const result = productDetailHref('');
  assert.equal(typeof result, 'string');
  assert.equal(result, '#');
});

test('product stubs both include the two known detail-page ids', () => {
  const ids = productStubs.map(p => p.id).sort();
  assert.deepEqual(ids, ['pmris', 'rmfm']);
});

test('flagship product is RMFM and passes validation', () => {
  const flagship = ProductManager.getFlagship();
  assert.ok(flagship, 'a flagship product should exist');
  assert.equal(flagship.id, 'rmfm');
  assert.equal(flagship.isFlagship, true);
});

test('getProduct returns matching stub by id', () => {
  const pmris = ProductManager.getProduct('pmris');
  assert.ok(pmris);
  assert.equal(pmris.name, 'PMRIS');
});

test('getProduct returns undefined for unknown id', () => {
  assert.equal(ProductManager.getProduct('nope'), undefined);
});

test('validateProduct accepts well-formed product', () => {
  const valid = {
    id: 'rmfm',
    name: 'RMFM',
    fullName: 'Risk Management Framework',
    description: 'desc',
    phase: 'Phase 1',
    status: 'active',
    category: 'risk',
    features: ['a'],
    maturityLevel: 'developing'
  };
  assert.equal(validateProduct(valid), true);
});

test('validateProduct rejects product missing required field', () => {
  const invalid = {
    id: 'x', name: 'X', fullName: 'X', description: 'd',
    phase: 'P1', status: 'active', category: 'c',
    maturityLevel: 'developing'
    // features missing
  };
  assert.equal(validateProduct(invalid), false);
});

test('validateProduct rejects disallowed status', () => {
  const invalid = {
    id: 'x', name: 'X', fullName: 'X', description: 'd',
    phase: 'P1', status: 'bogus', category: 'c',
    features: ['a'], maturityLevel: 'developing'
  };
  assert.equal(validateProduct(invalid), false);
});

test('validateProduct rejects id with unsafe characters (injection guard)', () => {
  const invalid = {
    id: '<script>', name: 'X', fullName: 'X', description: 'd',
    phase: 'P1', status: 'active', category: 'c',
    features: ['a'], maturityLevel: 'developing'
  };
  assert.equal(validateProduct(invalid), false);
});

test('validateProduct rejects features array exceeding maxFeatures', () => {
  const invalid = {
    id: 'x', name: 'X', fullName: 'X', description: 'd',
    phase: 'P1', status: 'active', category: 'c',
    features: new Array(11).fill('f'),
    maturityLevel: 'developing'
  };
  assert.equal(validateProduct(invalid), false);
});

test('validateProduct rejects empty features array', () => {
  const invalid = {
    id: 'x', name: 'X', fullName: 'X', description: 'd',
    phase: 'P1', status: 'active', category: 'c',
    features: [],
    maturityLevel: 'developing'
  };
  assert.equal(validateProduct(invalid), false);
});

test('sanitizeProductData escapes HTML in description (XSS guard)', () => {
  const product = {
    id: 'rmfm',
    name: '<b>RMFM</b>',
    fullName: 'Risk Management Framework',
    description: '<script>alert(1)</script>',
    phase: 'Phase 1',
    status: 'active',
    category: 'risk',
    features: ['safe & sound'],
    maturityLevel: 'developing'
  };
  const sanitised = sanitizeProductData(product);
  assert.ok(sanitised);
  assert.ok(!sanitised.description.includes('<script>'));
  assert.ok(sanitised.description.includes('&lt;script&gt;'));
  assert.ok(sanitised.name.includes('&lt;b&gt;'));
  assert.ok(sanitised.features[0].includes('&amp;'));
});

test('sanitizeProductData returns null for invalid product', () => {
  const result = sanitizeProductData({ id: 'x' });
  assert.equal(result, null);
});
