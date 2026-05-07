# highlighter-theme

Applies theme-aware ANSI styling to stack trace output, bridging the `highlighter` and `theme` modules.

## API

### `highlightHeaderWithTheme(header, themeName)`

Highlights an error header string (e.g. `TypeError: something went wrong`) using styles from the named theme. The error type and message are styled independently.

### `highlightFrameWithTheme(frame, themeName)`

Highlights a single parsed stack frame object using theme styles. Handles anonymous functions and frames without file locations gracefully.

### `highlightStackTraceWithTheme(stackTrace, themeName)`

Highlights a full parsed stack trace (header + frames array) using the named theme. Returns a newline-joined string ready for output.

### `applyStyle(text, styleName, theme)`

Low-level helper. Looks up `styleName` in the resolved `theme` object and wraps `text` with the corresponding ANSI style function. Returns plain text if the style is not defined.

## Themes

Theme names are resolved via `resolveTheme` from `src/theme.js`. If an unknown theme name is passed, the default theme is used as a fallback.

## Example

```js
const { highlightStackTraceWithTheme } = require('./highlighter-theme');

const output = highlightStackTraceWithTheme(parsedTrace, 'monokai');
process.stdout.write(output + '\n');
```
