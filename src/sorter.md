# sorter

Sorts an array of parsed stack frames by a chosen criterion.

## API

### `sortFrames(frames, strategy?, descending?)`

Returns a **new** sorted array without mutating the input.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `frames` | `object[]` | — | Array of frame objects |
| `strategy` | `string` | `'category'` | One of `file`, `line`, `category`, `name` |
| `descending` | `boolean` | `false` | Reverse the sort order |

Throws if an unknown strategy is supplied.

### `listStrategies()`

Returns the list of valid strategy names as `string[]`.

## Strategies

| Key | Sorts by |
|-----|----------|
| `category` | user → dependency → node → unknown |
| `file` | File path, alphabetically |
| `line` | Line number, ascending |
| `name` | Function name, alphabetically |

## Example

```js
const { sortFrames } = require('./sorter');

const sorted = sortFrames(parsedTrace.frames, 'category');
```

The sort is **stable**: frames that compare equal retain their original relative order.
