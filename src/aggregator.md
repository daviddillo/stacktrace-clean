# aggregator

Combines multiple parsed stack traces into a unified aggregation report.

## API

### `groupByErrorType(stackTraces)`

Accepts an array of parsed stack trace objects and returns a map keyed by error type (e.g. `TypeError`, `RangeError`). The error type is extracted from the raw header string using `parseHeader`. Traces with no recognizable header fall under `"Unknown"`.

### `countOccurrences(stackTraces)`

Deduplicates stack traces by the identity of their first frame (`file:line:column`). Returns an array of `{ stackTrace, count }` objects, useful for spotting repeated crashes.

### `aggregateStackTraces(stackTraces)`

Main entry point. Returns:

```js
{
  total,        // number of input traces
  uniqueErrors, // distinct first-frame signatures
  groups,       // map of errorType -> traces[]
  occurrences,  // sorted by count desc
  stats,        // output of buildStats() across all frames
}
```

Returns a zero-state object when given an empty array.

### `formatAggregation(aggregated)`

Formats the aggregation result as a human-readable plain-text string. Shows totals, a breakdown by error type, and the top 5 most frequent stack traces by first-frame location.

## Usage

```js
const { aggregateStackTraces, formatAggregation } = require('./aggregator');

const traces = logs.map(parseStackTrace);
const agg = aggregateStackTraces(traces);
console.log(formatAggregation(agg));
```
