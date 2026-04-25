/**
 * Simple in-memory cache with TTL support for source map lookups
 */

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

let store = new Map();

/**
 * @param {string} key
 * @param {*} value
 * @param {number} [ttl] - time to live in ms
 */
function set(key, value, ttl = DEFAULT_TTL_MS) {
  store.set(key, {
    value,
    expiresAt: Date.now() + ttl,
  });
}

/**
 * @param {string} key
 * @returns {*} value or undefined if missing/expired
 */
function get(key) {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value;
}

/**
 * @param {string} key
 * @returns {boolean}
 */
function has(key) {
  return get(key) !== undefined;
}

/**
 * @param {string} key
 */
function remove(key) {
  store.delete(key);
}

/**
 * Remove all expired entries
 */
function evictExpired() {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.expiresAt) store.delete(key);
  }
}

/**
 * Clear the entire cache
 */
function clear() {
  store = new Map();
}

/**
 * @returns {number}
 */
function size() {
  evictExpired();
  return store.size;
}

module.exports = { set, get, has, remove, evictExpired, clear, size };
