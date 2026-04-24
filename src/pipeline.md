# Pipeline

The `pipeline` module orchestrates the full stack trace processing flow from raw input to final colored output.

## Overview

Each stack trace string passes through a series of named steps. The pipeline is stateful — each step receives the current state object and returns an updated copy.

## Default Steps

| Step          | Description                                          |
|---------------|------------------------------------------------------|
| `parse`       | Parse raw string into header + frame objects         |
| `resolve`     | Apply source maps to resolve original file positions |
| `filter`      | Remove excluded frames (node_modules, internals)     |
| `deduplicate` | Collapse repeated or identical frames                |
| `truncate`    | Limit total number of visible frames                 |
| `group`       | Classify frames into labeled groups                  |
| `format`      | Convert frames to formatted string                   |
| `highlight`   | Apply ANSI color codes                               |

## Usage

```js
import { runPipeline } from './pipeline.js';
import { resolveConfig } from './config.js';

const config = await resolveConfig();
const output = await runPipeline(rawInput, config);
console.log(output);
```

## Custom Steps

You can pass a custom steps array to `runPipeline` to skip or reorder processing:

```js
const output = await runPipeline(input, config, ['parse', 'filter', 'format']);
```

## State Shape

```ts
{
  raw: string;       // original input
  header: string;    // error message line
  frames: Frame[];   // current frame list
  groups?: Group[];  // set after 'group' step
  output: string;    // set after 'format' step
}
```
