# inspector

Inspects parsed stack traces and error messages for well-known patterns, attaching human-readable diagnostic hints and frame annotations.

## API

### `inspectMessage(message)`

Matches an error message string against a catalogue of known patterns.

**Returns** `{ category, hint }` or `null` if no pattern matches.

```js
const { inspectMessage } = require('./inspector');
const result = inspectMessage("Cannot read properties of undefined (reading 'id')");
// { category: 'null-deref', hint: "Check that the object is defined before accessing '.id'." }
```

### `inspectStackTrace(stackTrace)`

Accepts a parsed stack trace object `{ header, frames }` and returns:

- `diagnosis` — result of `inspectMessage` on the header, or `null`.
- `frames` — the original frames array with an optional `_note` field added:
  - `'third-party'` for frames inside `node_modules`
  - `'built-in'` for Node.js built-in module frames (no path separator)

```js
const { inspectStackTrace } = require('./inspector');
const { diagnosis, frames } = inspectStackTrace(parsed);
if (diagnosis) console.log(`Hint: ${diagnosis.hint}`);
```

## Categories

| Category | Description |
|---|---|
| `null-deref` | Null / undefined property access |
| `type-error` | Value is not a function |
| `module-not-found` | Missing require/import target |
| `stack-overflow` | Infinite recursion |
| `fs-error` | File-system permission or missing-path errors |
| `syntax` | JavaScript syntax errors |

## Integration

The inspector is used by the pipeline after parsing and source-map resolution to enrich the output before formatting and display.
