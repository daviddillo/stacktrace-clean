# scoper

Classifies and groups stack frames by their **scope** — the execution context they belong to.

## Scope Types

| Scope | Description |
|-------|-------------|
| `user` | Application code written by the developer |
| `module` | Code from `node_modules` |
| `internal` | Node.js built-in internals (`node:`, `internal/`) |
| `async` | Async-related frames (Promise, async functions) |
| `native` | Native C++ bindings or `(native)` entries |
| `anonymous` | Frames with no name or `<anonymous>` |

## API

### `classifyScope(frame) → string`

Returns the scope label for a single frame object.

```js
classifyScope({ name: 'readFile', file: '/app/index.js' }); // 'user'
classifyScope({ name: 'Module._load', file: 'internal/modules/cjs/loader.js' }); // 'internal'
```

### `scopeFrames(frames) → frames[]`

Annotates each frame with a `scope` property. Does not mutate the originals.

### `filterByScope(frames, scope) → frames[]`

Returns only frames matching the given scope string.

```js
const userFrames = filterByScope(frames, 'user');
```

### `groupByScope(frames) → { [scope]: frames[] }`

Groups frames into an object keyed by scope label.

### `scopeSummary(frames) → { [scope]: number }`

Returns a count of frames per scope — useful for stats and reporting.

```js
const summary = scopeSummary(frames);
// { user: 3, module: 5, internal: 2, async: 1 }
```

## Integration

`scoper` works well alongside `grouper`, `tagger`, and `stats` to enrich frame metadata before rendering or export.
