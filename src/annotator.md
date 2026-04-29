# annotator

Attaches inline source-code snippets to parsed stack frames so downstream formatters can render contextual code alongside each frame.

## API

### `extractSnippet(lines, lineNumber, radius?)`

Returns an array of `{ line, text, isTarget }` objects centred on `lineNumber`.
`radius` (default `2`) controls how many lines above and below are included.
Returns `null` when `lines` is falsy or `lineNumber < 1`.

### `annotateFrame(frame, options?)`

Reads the source file referenced by `frame.file` and attaches a `snippet` array.
Returns a new frame object — the original is not mutated.

| Option | Default | Description |
|--------|---------|-------------|
| `radius` | `2` | Lines of context around the target line |
| `readLines` | built-in fs reader | Override for testing or virtual filesystems |

Returns `{ ...frame, snippet: null }` when the file cannot be read or `frame.line` is absent.

### `annotateStackTrace(stackTrace, options?)`

Maps `annotateFrame` over every frame in `stackTrace.frames`.
Returns the original object unchanged if `frames` is not an array.

## Example

```js
const { annotateStackTrace } = require('./annotator');

const annotated = annotateStackTrace(parsed);
console.log(annotated.frames[0].snippet);
// [
//   { line: 1, text: 'function foo() {', isTarget: false },
//   { line: 2, text: '  throw new Error();', isTarget: true },
//   { line: 3, text: '}', isTarget: false },
// ]
```
