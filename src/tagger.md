# tagger

Attaches semantic **tags** to parsed stack frames so that other modules can filter, group, or highlight frames without re-implementing detection logic.

## API

### `tagFrame(frame) → string[]`

Inspects the frame's `name`, `file`, and `raw` fields and returns an array of matching tag names.

```js
const { tagFrame } = require('./tagger');
tagFrame({ name: 'async myFn', file: '/app/src/util.js', raw: '' });
// → ['async']
```

### `tagStackTrace(stackTrace) → stackTrace`

Returns a new stack trace object where every frame has a `tags` array added.

```js
const tagged = tagStackTrace(parsed);
// tagged.frames[0].tags → ['node_modules']
```

### `filterByTags(frames, wantedTags) → frames`

Returns only the frames that carry **at least one** of the requested tags.

```js
const thirdParty = filterByTags(frames, ['node_modules']);
```

### `listTags() → string[]`

Returns all built-in tag names: `async`, `native`, `eval`, `anonymous`, `node_modules`, `internal`, `test`, `typescript`.

## Built-in tags

| Tag | Matches |
|---|---|
| `async` | name starts with `async ` |
| `native` | `(native)` in raw |
| `eval` | `eval` keyword present |
| `anonymous` | `<anonymous>` or `<unknown>` |
| `node_modules` | path contains `node_modules` |
| `internal` | path starts with `node:` or `internal/` |
| `test` | file ends in `.test.js` / `.spec.ts` etc. |
| `typescript` | file has a `.ts` / `.tsx` extension |
