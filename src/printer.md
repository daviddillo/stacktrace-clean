# printer

High-level module that ties the processing pipeline together and emits a
formatted stack trace to a stream or file.

## API

### `buildPrintOptions(overrides?)`

Returns a complete options object by merging `overrides` with the defaults:

| Option | Default | Description |
|---|---|---|
| `color` | `true` | Enable ANSI colour output |
| `maxFrames` | `50` | Maximum frames to display |
| `exclude` | `[]` | Glob/string patterns to filter out |
| `outputFile` | `null` | Write to file instead of a stream |
| `stream` | `process.stdout` | Destination stream |

### `printStackTrace(stackTrace, options?)`

Applies the full processing chain:

1. **filter** — removes frames matching `exclude` patterns
2. **truncate** — caps the frame list at `maxFrames`
3. **highlight** — applies ANSI colours (when `color` is `true`)
4. **output** — writes to `outputFile` or `stream`

Returns the rendered string.

### `printWithConfig(stackTrace, rawConfig?)`

Convenience wrapper that calls `resolveConfig` before delegating to
`printStackTrace`. Useful when the caller holds a raw config object that
may contain unknown keys or need defaulting.

## Example

```js
const { printWithConfig } = require('./printer');
const { parseStackTrace } = require('./parser');

const trace = parseStackTrace(rawText);
printWithConfig(trace, { color: true, maxFrames: 20 });
```
