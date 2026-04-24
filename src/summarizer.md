# summarizer

Builds a concise, human-readable summary of a processed stack trace.

## Exports

### `parseHeader(header) → { type, message }`

Splits a raw stack-trace header line (e.g. `TypeError: foo is not a function`)
into its error type and message.

### `summarizeStackTrace(stackTrace, options?) → summary`

Accepts the output of the parser/pipeline and returns a plain summary object.

| Field | Type | Description |
|---|---|---|
| `type` | string | Error class name |
| `message` | string | Error message text |
| `totalFrames` | number | Total number of frames |
| `userFrames` | number | Non-internal frames |
| `internalFrames` | number | Node.js / internal frames |
| `topFrames` | Frame[] | First N frames (default 3) |

**Options**

| Option | Default | Description |
|---|---|---|
| `topFrames` | `3` | How many leading frames to include in the summary |

### `formatSummary(summary) → string`

Converts a summary object into a plain-text, human-readable string suitable
for printing to stdout or writing to a report file.

## Example

```js
const { summarizeStackTrace, formatSummary } = require('./summarizer');

const summary = summarizeStackTrace(parsedTrace, { topFrames: 5 });
console.log(formatSummary(summary));
```

```
Error Type : TypeError
Message    : Cannot read property 'x' of undefined
Frames     : 8 total (5 user, 3 internal)
Top Frames :
  doWork (/app/src/worker.js:12:5)
  runTask (/app/src/runner.js:34:3)
  ...
```
