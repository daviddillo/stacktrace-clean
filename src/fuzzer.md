# fuzzer

Fuzzy-search stack frames by file path or function name.

## Overview

The `fuzzer` module lets you search through the frames of a parsed stack trace using a fuzzy-matching algorithm. It is useful for quickly finding relevant frames without needing an exact string.

## API

### `fuzzyScore(query, target) → number`

Returns a score in `[0, 1]` representing how well `query` matches `target`. A score of `1` means the query is a substring of the target. A score of `0` means the characters could not all be found in order.

### `scoreFrame(frame, query) → number`

Scores a single frame against a query by checking both `frame.file` and `frame.name`, returning the higher score.

### `fuzzySearch(frames, query, options?) → Frame[]`

Returns frames sorted by descending fuzzy score.

| Option | Default | Description |
|-----------|---------|-------------------------------|
| threshold | `0.3` | Minimum score to include |
| limit | `Infinity` | Maximum number of results |

### `bestMatch(frames, query) → Frame \| null`

Returns the single highest-scoring frame, or `null` if no frames are provided.

## CLI usage

```
cat error.log | stacktrace-clean fuzzy parseStack --limit 5
```

Pipes a stack trace through stdin and prints the top-matching frames for the query `parseStack`.
