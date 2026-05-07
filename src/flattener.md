# flattener

Flattens nested (chained) error stack traces into a single ordered frame list.

## Overview

Node.js errors can carry a `cause` property forming a chain. `flattener` walks
that chain, tags each frame with its depth, and exposes helpers for rendering
or further processing.

## API

### `extractCauses(stackTrace)`

Returns an array of `{ header, frames, cause }` objects from root to deepest
cause.

### `tagWithDepth(frames, depth)`

Returns a new array of frames each decorated with `causeDepth: number`.
Original frames are not mutated.

### `flattenCauses(stackTrace)`

Returns a single flat array of all frames across the cause chain, tagged with
`causeDepth`.

### `flattenWithHeaders(stackTrace)`

Returns an array of `{ header, frames, depth }` sections — useful when you
want to render error headers between groups.

### `deduplicateAcrossCauses(frames)`

Filters out duplicate frames (same file, line, column, name) that appear more
than once across cause boundaries. Preserves first occurrence.

## CLI

```
stacktrace-clean flatten [--dedupe] [--headers]
```

| Flag | Description |
|------|-------------|
| `--dedupe`, `-d` | Remove duplicate frames across the chain |
| `--headers`, `-H` | Print each error header before its frames |

## Example

```js
const { flattenCauses } = require('./flattener');
const frames = flattenCauses(parsedTrace);
// frames[0].causeDepth === 0  (root error)
// frames[N].causeDepth === 1  (first cause)
```
