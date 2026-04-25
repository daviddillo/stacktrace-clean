# reporter

Generates plain-text reports from processed stack trace data.

## API

### `buildHeader(errorType, message) → string`

Builds a single-line error header.

```js
buildHeader('TypeError', 'cannot read property x');
// => 'TypeError: cannot read property x'
```

### `buildFrameBlock(frames, options) → string`

Formats an array of resolved frame objects into an indented call-stack block.

| Option | Default | Description |
|--------|---------|-------------|
| `maxFrames` | `Infinity` | Maximum number of frames to include |
| `indent` | `'  '` | Leading whitespace per frame line |

### `generateReport(data, options) → string`

Produces a complete plain-text report combining the header, frame block, summary, and stats sections.

`data` shape:
```js
{
  header:  { errorType, message },
  frames:  Frame[],
  summary: SummaryObject,   // optional
  stats:   StatsObject      // optional
}
```

## Usage

```js
const { generateReport } = require('./reporter');

const report = generateReport({ header, frames, stats });
process.stdout.write(report + '\n');
```

The reporter is intentionally plain-text only. For colour output pass the result through `highlighter.highlightStackTrace`.
