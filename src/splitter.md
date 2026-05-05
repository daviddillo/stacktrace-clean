# splitter

Splits raw input text (e.g. from stdin or a log file) into individual stack
trace blocks so that each block can be processed independently by the pipeline.

## API

### `splitTraces(input: string): string[]`

Scans `input` line-by-line looking for error headers (e.g. `TypeError: …`).
Each header and its subsequent `at …` frame lines are collected into one block.
Blocks are separated by blank lines or the start of the next error header.

Returns an array of trimmed raw stack trace strings.

```js
const { splitTraces } = require('./splitter');

const blocks = splitTraces(rawLog);
// blocks[0] → 'TypeError: ...\n    at ...'
// blocks[1] → 'RangeError: ...\n    at ...'
```

### `containsTrace(input: string): boolean`

Quick check — returns `true` when `input` contains at least one error header
**and** at least one `at …` frame line.

```js
if (containsTrace(data)) {
  const blocks = splitTraces(data);
}
```

### `findBlockEnd(lines: string[], start: number): number`

Low-level helper used internally. Given the array of lines and the index of an
error header, returns the index of the first line that does **not** belong to
the current block (blank line or next error header).

## Integration

`splitter` sits at the very start of the processing pipeline, before
`parser.js`. Feed it raw multi-trace input and pass each resulting block to
`parseStackTrace`.
