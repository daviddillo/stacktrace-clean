# stats

Collects and formats statistical information about a processed stack trace.

## Purpose

After the pipeline has filtered, deduplicated, and truncated frames, `stats`
gives a quick numeric overview useful for debugging or verbose output modes.

## API

### `countByCategory(groups)`

Accepts an array of frame groups (as produced by `grouper`) and returns an
object with counts for each category:

```js
{ app: 4, external: 2, internal: 1 }
```

### `countResolved(frames)`

Returns the number of frames where `resolved === true` (i.e. source-map
lookup succeeded).

### `buildStats({ frames, groups, originalCount })`

Builds a stats object:

| Field           | Description                                  |
|-----------------|----------------------------------------------|
| `total`         | Frames remaining after pipeline              |
| `originalCount` | Frames before filtering / truncation         |
| `omitted`       | Difference between original and total        |
| `resolved`      | Frames with successful source-map resolution |
| `unresolved`    | Frames without source-map resolution         |
| `byCategory`    | Counts per category (app / external / internal) |

### `formatStats(stats)`

Returns a single human-readable string, e.g.:

```
6 frames · 2 omitted · 3 source-mapped · (4 app, 2 external)
```

Fields are omitted when their value is zero to keep output concise.
