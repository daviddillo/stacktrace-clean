# labeler

Attaches human-readable **labels** to parsed stack frames based on file-path heuristics.

## Labels

| Label | Criteria |
|---|---|
| `node-internal` | Paths starting with `node:` or `internal/` |
| `express` / `koa` / … | Known framework packages inside `node_modules` |
| `dependency` | Any other `node_modules` path |
| `test` | Files matching `*.test.js`, `*.spec.ts`, etc. |
| `app` | Everything else (user application code) |

## API

### `deriveLabel(frame) → string`

Returns the label for a single frame object.  
Uses `frame.resolvedFile` when available, falling back to `frame.file`.

### `labelFrames(frames) → frames[]`

Returns a **new** array of shallow-cloned frames, each with a `label` property added.
Original frames are not mutated.

```js
const { labelFrames } = require('./labeler');
const labeled = labelFrames(parsedTrace.frames);
// labeled[0].label === 'app'
```

### `filterByLabel(frames, label) → frames[]`

Convenience helper — returns only the frames whose `label` matches the given string.

```js
const appFrames = filterByLabel(labeled, 'app');
```

### `listLabels(frames) → string[]`

Returns the sorted list of **distinct** labels present in the frame set.
Works with both pre-labeled frames and raw frames.

## Integration

`labeler` is used by the **grouper** and **tagger** modules to further classify
frames before display or export.  It runs early in the pipeline, right after
source-map resolution.
