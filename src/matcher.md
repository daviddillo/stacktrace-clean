# matcher

Pattern-based frame matching with support for exact strings, globs, and regular expressions.

## API

### `compilePattern(pattern: string): RegExp`

Compiles a pattern string into a `RegExp`.

| Syntax | Example | Behavior |
|---|---|---|
| Exact | `node_modules` | Anchored full match |
| Glob `*` | `src/*.js` | Matches within a single path segment |
| Glob `**` | `src/**/*.js` | Matches across multiple segments |
| Regex | `/node_modules\|internal/i` | Raw regular expression with optional flags |

Throws `TypeError` for empty or non-string inputs.

---

### `testFrame(frame, regex): boolean`

Tests a compiled `RegExp` against a frame's `file`, `name`, and `source` fields.
Returns `true` if any field matches.

---

### `matchesAny(frame, patterns): boolean`

Returns `true` if the frame matches **at least one** of the provided pattern strings.

---

### `matchesAll(frame, patterns): boolean`

Returns `true` only if the frame matches **every** pattern in the list.

---

### `buildMatcher(patterns, mode?): (frame) => boolean`

Builds a reusable matcher function from an array of patterns.

- `mode: 'any'` *(default)* — matches if any pattern matches
- `mode: 'all'` — matches only if all patterns match

## Usage

```js
const { buildMatcher } = require('./matcher');

const isThirdParty = buildMatcher(['node_modules', '/^internal/']);
const userFrames = frames.filter(f => !isThirdParty(f));
```
