# tracer

Captures and attaches runtime **trace context** to stack trace frames, enabling multi-trace correlation and cause-chain analysis.

## API

### `captureTrace(skip?)`

Captures the current call stack as a parsed frame array. `skip` controls how many top frames are omitted (default `1` removes the tracer frame itself).

```js
const { captureTrace } = require('./tracer');
const frames = captureTrace();
```

### `labelTrace(frames, label)`

Attaches a `traceContext` string to every frame without mutating the originals.

```js
const labeled = labelTrace(frames, 'request-99');
```

### `mergeWithCause(primary, cause, separator?)`

Combines two frame arrays with a `{ type: 'boundary' }` marker between them, mirroring the `cause` chaining pattern from Node.js `Error` objects.

```js
const merged = mergeWithCause(primaryFrames, causeFrames, 'caused by');
```

### `extractByContext(frames, label)`

Filters a merged frame array to only those whose `traceContext` matches `label`.

### `createTracer(contextName)`

Returns a bound tracer object `{ capture(), context }` that automatically labels captured frames with the given context name.

```js
const t = createTracer('auth-service');
const frames = t.capture(); // all frames labeled 'auth-service'
```

## CLI

See `tracer-cli.js` for the `--context`, `--cause`, and `--extract` flags.
