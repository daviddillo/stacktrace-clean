# comparator

Compares two parsed stack traces and produces a structured result with a similarity score, relationship classification, and frame-level diff summary.

## API

### `compareTraces(traceA, traceB) → ComparisonResult`

The main entry point. Accepts two parsed stack trace objects (each with `frames` and optionally `errorType`) and returns:

```js
{
  relationship: 'identical' | 'similar' | 'related' | 'distinct',
  similarityScore: 0..1,
  sameError: boolean | null,
  diff: DiffEntry[],
  summary: { added, removed, unchanged },
  topFrameA: Frame | null,
  topFrameB: Frame | null,
}
```

### `formatComparison(result) → string`

Formats a comparison result as a human-readable multi-line string suitable for CLI output.

### `similarityScore(diffResult) → number`

Computes a 0–1 similarity ratio from a diff summary. Uses the formula `(unchanged * 2) / total` where `total = added + removed + unchanged * 2`.

### `classifyRelationship(score) → string`

Maps a similarity score to a label:

| Score   | Label      |
|---------|------------|
| ≥ 0.95  | identical  |
| ≥ 0.70  | similar    |
| ≥ 0.40  | related    |
| < 0.40  | distinct   |

## Dependencies

- `differ.js` — provides `diffFrames` and `diffSummary`
- `scorer.js` — provides `scoreFrames` to identify the most relevant frame in each trace

## Usage

```js
const { compareTraces, formatComparison } = require('./comparator');

const result = compareTraces(parsedTraceA, parsedTraceB);
console.log(formatComparison(result));
```
