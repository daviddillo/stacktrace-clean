# timeline

Builds a chronological view of stack trace frames, useful for understanding
execution order and spotting where control crossed boundaries.

## API

### `indexFrames(frames)`

Attaches a `timelineIndex` to each frame reflecting its original position in
the stack trace array. Returns a new array; input frames are not mutated.

### `bucketByCategory(frames)`

Groups frames into an object keyed by `category` (`app`, `module`, `internal`).
Useful for summary statistics alongside the full timeline.

### `buildTimeline(frames, opts?)`

Returns a flat array of timeline entries with normalised position metadata.

| Option | Default | Description |
|---|---|---|
| `includeInternal` | `false` | Include Node.js internal frames |

Each entry contains: `position`, `originalIndex`, `file`, `line`, `column`,
`name`, `category`.

### `formatTimeline(timeline)`

Converts a timeline array to a human-readable multi-line string.

## Example

```js
const { buildTimeline, formatTimeline } = require('./timeline');

const tl = buildTimeline(stackTrace.frames, { includeInternal: false });
console.log(formatTimeline(tl));
// [0] doWork @ src/app.js:10 (app)
// [1] readFile @ node_modules/fs-extra/index.js:42 (module)
```
