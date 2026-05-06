# merger

Merges multiple parsed stack traces into a single unified frame list.

## API

### `buildFrequencyMap(traces)`

Builds an internal frequency map from an array of frame arrays.  
Each entry records:
- `frame` — the original frame object
- `count` — total occurrences across all traces
- `traceIndices` — `Set` of trace indices that contain this frame

### `mergeTraces(traces)`

Combines all frames from every trace into one ordered list, deduplicating by
`frameKey`. Shared frames are annotated with:
- `mergeCount` — how many times the frame appeared across all traces
- `sharedBy` — array of trace indices that contained the frame

Insertion order follows the order frames are first encountered when iterating
traces left-to-right.

### `intersectTraces(traces)`

Returns only the frames that appear in **every** supplied trace. Useful for
finding the common root cause across a set of related errors.

## Usage

```js
const { mergeTraces, intersectTraces } = require('./merger');

const merged = mergeTraces([framesA, framesB]);
const common = intersectTraces([framesA, framesB, framesC]);
```

## Notes

- Frame identity is determined by `frameKey` from `deduplicator.js`
  (`file:line:column`).
- Frames without a file are keyed by name only and may collide across
  unrelated anonymous functions — filter those out upstream if needed.
