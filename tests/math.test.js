const test = require('node:test');
const assert = require('node:assert');
const { add, subtract, multiply } = require('../src/math');

test('Unit Test: add()', () => {
  assert.strictEqual(add(2, 3), 5);
  assert.strictEqual(add(-1, 1), 0);
});

test('Unit Test: subtract()', () => {
  assert.strictEqual(subtract(10, 4), 6);
  assert.strictEqual(subtract(0, 5), -5);
});

test('Unit Test: multiply()', () => {
  assert.strictEqual(multiply(3, 4), 12);
  assert.strictEqual(multiply(-2, 3), -6);
});
