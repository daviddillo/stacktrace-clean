# watcher

Watches for incoming stack trace input, either from a file on disk or a readable stream (e.g. stdin). Emits events that the pipeline can react to.

## API

### `createWatcher(options?)`

Returns a new `Watcher` instance.

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `interval` | `number` | `300` | Debounce delay (ms) for file change events |

---

### `watcher.watchFile(filePath)`

Begins watching a file for changes. Emits `'data'` with the full file content each time the file is modified.

- Throws if the file does not exist at the time of the call.
- Emits `'ready'` immediately with the resolved file path.

---

### `watcher.watchStream(stream)`

Buffers data from a readable stream and emits `'data'` with the full buffered content when the stream ends.

Useful for piping stdin into the tool:

```bash
node index.js < error.log
```

---

### `watcher.stop()`

Stops the file watcher and clears any pending debounce timers. Emits `'stopped'`.

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `ready` | `filePath` | Fired when file watching starts |
| `data` | `string` | New stack trace content is available |
| `end` | — | Stream has finished |
| `error` | `Error` | An error occurred while reading |
| `stopped` | — | Watcher has been stopped |
