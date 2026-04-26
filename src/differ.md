# differ

Compares two parsed stack traces and reports what changed between them.
Useful for spotting regressions or understanding how an error evolved across runs.

## API

### `diffFrames(framesA, framesB) → DiffEntry[]`

Produces a line-level diff of two frame arrays.

Each `DiffEntry` has:

| field  | type                          | description                    |
|--------|-------------------------------|--------------------------------|
| `type` | `'same'\|'added'\|'removed'` | how this frame changed         |
| `frame`| `Frame`                       | the frame object from either trace |

Frames are matched by a composite key: `file:line:column:name`.

### `diffSummary(diff) → { same, added, removed }`

Reduces a diff array into counts per type. Handy for a quick overview.

### `compareStackTraces(traceA, traceB) → CompareResult`

High-level comparison of two full stack trace objects.

Returns:

```js
{
  headerChanged: boolean,   // true if error message changed
  diff: DiffEntry[],        // full frame diff
  summary: { same, added, removed }
}
```

## Example

```js
const { compareStackTraces } = require('./differ');

const result = compareStackTraces(previousTrace, currentTrace);
console.log(result.summary);
// { same: 5, added: 2, removed: 1 }
```
