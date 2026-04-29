# pager

Handles paginating long stack trace output in the terminal, similar to `git log` or `man` pages.

## API

### `shouldPage(text, options?)`

Returns `true` if the text is long enough to warrant paging.

- `options.force` — always page regardless of length
- `options.threshold` — line count threshold (defaults to terminal height)

### `getPager()`

Resolves the pager command to use:
1. `$PAGER` env var if set
2. `less` on Unix-like systems
3. `null` on Windows (falls back to stdout)

### `pageText(text, options?)`

Spawns the pager process and pipes `text` into it. Returns a Promise that resolves when the pager exits.

- `options.pager` — override the pager binary

When using `less`, flags `-R -F -X` are passed to preserve ANSI colors, exit immediately for short output, and avoid clearing the screen.

### `maybePageOutput(text, options?)`

Convenience wrapper: writes directly to stdout if not a TTY or content is short, otherwise invokes the pager.

## Usage

```js
const { maybePageOutput } = require('./pager');

const rendered = formatStackTrace(trace);
await maybePageOutput(rendered);
```
