# linker

Builds terminal hyperlinks for file references in stack frames, allowing supported terminals to make file paths clickable.

## Functions

### `buildFileUri(filePath, line, column)`

Constructs a `file://` URI from an absolute path and optional line/column position.

```js
buildFileUri('/home/user/app/src/index.js', 10, 5)
// => 'file:///home/user/app/src/index.js'
```

### `hyperlink(text, url)`

Wraps `text` in an OSC 8 terminal hyperlink escape sequence pointing to `url`. Falls back to plain `text` when hyperlinks are not supported.

```js
hyperlink('src/index.js:10:5', 'file:///home/user/app/src/index.js')
// => '\x1b]8;;file:///...\x1b\\src/index.js:10:5\x1b]8;;\x1b\\'
```

### `supportsHyperlinks()`

Detects whether the current terminal environment supports OSC 8 hyperlinks by inspecting environment variables (`TERM_PROGRAM`, `VTE_VERSION`, etc.).

Returns `true` for iTerm2, Hyper, VSCode integrated terminal, and recent VTE-based terminals.

### `linkFrame(frame)`

Accepts a parsed/resolved frame object and returns a copy with a `link` property containing a ready-to-render terminal hyperlink string (or plain path text when unsupported).

```js
const linked = linkFrame({ file: '/app/src/index.js', line: 10, column: 5, name: 'myFn' })
// linked.link => clickable 'src/index.js:10:5' or plain text
```

## Notes

- Relative paths are computed from `process.cwd()` for display, but the URI always uses the absolute path so the terminal can resolve the file.
- When `supportsHyperlinks()` returns `false`, `linkFrame` still attaches a `link` property containing the plain formatted path string so downstream renderers don't need to branch.
