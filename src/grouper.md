# grouper

Groups stack trace frames by their origin into three categories: **app**, **node_modules**, and **internal**.

## API

### `classifyFrame(frame) → string`

Returns one of the group constants for a single frame object.

| Constant | Value | Description |
|---|---|---|
| `GROUP_APP` | `'app'` | Absolute paths not inside `node_modules` |
| `GROUP_NODE_MODULES` | `'node_modules'` | Paths containing `/node_modules/` |
| `GROUP_INTERNAL` | `'internal'` | `node:` builtins, relative paths, or frames with no file |

### `groupFrames(frames) → GroupEntry[]`

Groups **consecutive** frames that share the same classification into `GroupEntry` objects:

```js
{ group: 'app' | 'node_modules' | 'internal', frames: Frame[] }
```

Useful for collapsing or summarising noisy sections of a stack trace (e.g. hiding all `node_modules` frames behind a single line).

### `flattenGroups(groups) → Frame[]`

Reverses `groupFrames` — returns a flat array of frames in original order.

## Example

```js
const { groupFrames, GROUP_NODE_MODULES } = require('./grouper');

const groups = groupFrames(stackTrace.frames);

for (const { group, frames } of groups) {
  if (group === GROUP_NODE_MODULES) {
    console.log(`  ... ${frames.length} node_modules frame(s) hidden`);
  } else {
    frames.forEach(f => console.log(formatFrame(f)));
  }
}
```
