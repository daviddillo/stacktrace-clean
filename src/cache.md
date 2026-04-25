# cache

A lightweight in-memory key/value cache with per-entry TTL (time-to-live) support.
Used internally by `sourcemap.js` and `resolver.js` to avoid re-reading files or
re-fetching remote source maps on every stack frame.

## API

### `set(key, value, ttl?)`
Store `value` under `key`. `ttl` defaults to **5 minutes** (in ms).

### `get(key) → value | undefined`
Return the cached value, or `undefined` if the key is missing or expired.
Expired entries are lazily deleted on access.

### `has(key) → boolean`
Return `true` if the key exists and has not expired.

### `remove(key)`
Explicitly delete a single entry.

### `evictExpired()`
Scan the entire store and delete all entries whose TTL has elapsed.
Call this periodically to reclaim memory in long-running processes.

### `clear()`
Drop every entry regardless of TTL. Useful in tests.

### `size() → number`
Return the count of **live** (non-expired) entries.

## Notes

- The store is module-level, so it is shared across all imports within the same
  Node.js process.
- TTL precision depends on `Date.now()`; sub-millisecond accuracy is not
  guaranteed.
- For persistent caching across runs, consider writing resolved frames to a
  `.stacktrace-cache` file via `output.js`.
