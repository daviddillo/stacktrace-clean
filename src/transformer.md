# transformer

Apply an ordered chain of transformation functions to a parsed stack trace.

## API

### `buildTransformer(transforms: Function[]): Function`

Compose an array of transform functions into a single transformer.
Each function receives the current trace object and returns a (possibly new) one.
Returns an identity function when the array is empty.

### `applyNamed(registry, name, trace)`

Apply a single named transform from a registry map. Throws if the name is unknown.

### `applyNamed_sequence(registry, names, trace)`

Apply a list of named transforms in order from a registry.

## Built-in transforms

| Name | Description |
|------|-------------|
| `identity` | No-op, returns trace as-is |
| `stripUnresolved` | Removes frames where `resolved === false` |
| `limitFrames(n)` | Returns a transform that keeps only the first `n` frames |

## CLI

The `transformer-cli.js` module exposes `--transform` flag support:

```
stacktrace-clean --transform stripUnresolved,limit:20 < trace.txt
```

Built-in CLI names: `identity`, `stripUnresolved`, `limit:10`, `limit:20`, `limit:50`.

## Example

```js
const { buildTransformer, stripUnresolved, limitFrames } = require('./transformer');

const transform = buildTransformer([stripUnresolved, limitFrames(5)]);
const cleaned = transform(parsedTrace);
```
