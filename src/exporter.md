# Exporter

The `exporter` module converts a parsed stack trace into a file or stream in a chosen format.

## Supported Formats

| Format     | Extension | Description                        |
|------------|-----------|------------------------------------|
| `json`     | `.json`   | Machine-readable JSON object       |
| `text`     | `.txt`    | Plain-text representation          |
| `markdown` | `.md`     | Markdown with header and list      |

## API

### `validateFormat(format)`
Throws if the format string is not one of the supported values.

### `serializeAs(stackTrace, format)`
Returns the serialized string for the given stack trace and format.

### `getExtension(format)`
Returns the file extension string (e.g. `'.json'`) for a format.

### `exportToFile(stackTrace, format, filePath)`
Writes the serialized stack trace to `filePath`. Appends the correct extension if it is missing. Returns the resolved file path.

### `exportToStream(stackTrace, format, stream)`
Writes the serialized content to a writable stream.

### `listFormats()`
Returns the array of supported format strings.

## Example

```js
import { exportToFile } from './exporter.js';

await exportToFile(parsedTrace, 'json', './output/trace');
// writes to ./output/trace.json
```
