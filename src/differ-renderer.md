# differ-renderer

Renderers for stack trace diff output. Consumes the result of `compareStackTraces` from `differ.js` and produces colored, human-readable terminal output.

## Functions

### `colorize(type, text)`

Applies ANSI color and a prefix symbol based on the diff entry type:

- `added` → green `+`
- `removed` → red `-`
- `unchanged` → dim `  ` (two spaces)

### `renderDiffEntry(entry)`

Formats a single diff entry (`{ type, frame }`) into a colored line. Uses `formatFrame` from `formatter.js` for the frame text.

### `renderHeader(headerA, headerB)`

Renders a two-line header block showing the original (`-`) and new (`+`) error messages.

### `renderSummary(summary)`

Renders a compact summary line showing counts of added, removed, and unchanged frames.

```
~ 1 added, 2 removed, 5 unchanged
```

### `renderDiff(diffResult)`

Full render pipeline. Accepts the return value of `compareStackTraces` and produces a complete diff string ready for terminal output.

## Usage

```js
import { compareStackTraces } from './differ.js';
import { renderDiff } from './differ-renderer.js';

const result = compareStackTraces(traceA, traceB);
console.log(renderDiff(result));
```
