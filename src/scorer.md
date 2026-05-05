# scorer

Assigns numeric relevance scores to stack frames so the most actionable frames can be surfaced first.

## API

### `scoreFrame(frame, opts?): number`

Returns a relevance score for a single parsed frame object.

| Factor | Δ score |
|---|---|
| Internal Node.js frame | −10 |
| `node_modules` file | −5 |
| App-code file (under `appRoot`) | +15 |
| Source-map resolved | +8 |
| Named function | +3 |
| Line + column present | +2 |
| Async frame | −2 |

**Options**

- `appRoot` *(string)* — root directory used to detect app-code frames. Defaults to `process.cwd()`.

### `scoreFrames(frames, opts?): object[]`

Maps over an array of frames and returns new frame objects with a `score` property attached. The original array is not mutated.

### `rankFrames(frames): object[]`

Accepts an array of already-scored frames (output of `scoreFrames`) and returns a new array sorted by `score` descending — highest relevance first.

## Example

```js
const { scoreFrames, rankFrames } = require('./scorer');

const scored = scoreFrames(parsedFrames, { appRoot: '/home/user/myapp' });
const ranked = rankFrames(scored);
console.log('Most relevant frame:', ranked[0]);
```

## Integration

The scorer is used by the pipeline after filtering and deduplication to reorder frames before they reach the formatter, ensuring users see their own code at the top of the output.
