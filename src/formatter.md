# formatter

Formats parsed stack trace frames into human-readable strings.

## Functions

### `isInternal(file)`

Returns `true` if the given file path belongs to Node.js internals or `node_modules`.

```js
isInternal('internal/modules/cjs/loader.js'); // true
isInternal('/project/node_modules/lodash/index.js'); // true
isInternal('/project/src/app.js'); // false
```

### `formatFile(frame)`

Returns a formatted file location string for a frame.

- Native frames → `<native>`
- Frames without a file → `<unknown>`
- Otherwise → `file:line:col`

### `formatName(frame)`

Returns the function name, or `<anonymous>` if unavailable.

### `formatFrame(frame)`

Formats a single frame as a string in the style:

```
at myFunction (/project/src/app.js:42:7)
```

### `formatStackTrace(frames)`

Maps an array of frames through `formatFrame`, returning an array of strings.

## Usage

```js
import { formatStackTrace } from './formatter.js';

const lines = formatStackTrace(parsedFrames);
console.log(lines.join('\n'));
```

## Notes

- This module is purely presentational and does not apply ANSI colors — see `highlighter.js` for colored output.
- Internal and native frames are still formatted but are marked differently by the highlighter.
