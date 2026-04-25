const cache = require('./cache');

beforeEach(() => {
  cache.clear();
});

describe('set / get', () => {
  test('stores and retrieves a value', () => {
    cache.set('foo', 42);
    expect(cache.get('foo')).toBe(42);
  });

  test('returns undefined for unknown key', () => {
    expect(cache.get('nope')).toBeUndefined();
  });

  test('returns undefined after TTL expires', () => {
    cache.set('bar', 'hello', 1); // 1 ms TTL
    return new Promise((resolve) =>
      setTimeout(() => {
        expect(cache.get('bar')).toBeUndefined();
        resolve();
      }, 10)
    );
  });

  test('overwrites an existing key', () => {
    cache.set('key', 1);
    cache.set('key', 2);
    expect(cache.get('key')).toBe(2);
  });
});

describe('has', () => {
  test('returns true for live key', () => {
    cache.set('x', true);
    expect(cache.has('x')).toBe(true);
  });

  test('returns false for missing key', () => {
    expect(cache.has('missing')).toBe(false);
  });
});

describe('remove', () => {
  test('deletes a key', () => {
    cache.set('del', 99);
    cache.remove('del');
    expect(cache.has('del')).toBe(false);
  });
});

describe('evictExpired', () => {
  test('removes expired entries without clearing live ones', () => {
    cache.set('live', 1, 60000);
    cache.set('dead', 2, 1);
    return new Promise((resolve) =>
      setTimeout(() => {
        cache.evictExpired();
        expect(cache.has('live')).toBe(true);
        expect(cache.has('dead')).toBe(false);
        resolve();
      }, 10)
    );
  });
});

describe('size', () => {
  test('reflects number of live entries', () => {
    cache.set('a', 1);
    cache.set('b', 2);
    expect(cache.size()).toBe(2);
  });
});
