# digester

Computes stable fingerprints (short SHA-1 hashes) for parsed stack traces.
Fingerprints let you deduplicate, group, or compare traces across runs without
storing the full trace text.

## API

### `digestStackTrace(stackTrace, options?)`

Returns a hex fingerprint derived from the top N frames (ignoring line/column
numbers so minor edits don't change the fingerprint).

| Option | Default | Description |
|---|---|---|
| `depth` | `5` | Number of frames to include |
| `hashLength` | `12` | Characters of the SHA-1 hex digest to return |

### `digestWithHeader(stackTrace, options?)`

Like `digestStackTrace` but also incorporates the error header (type + message)
so two traces with identical frames but different error types get different
fingerprints.

### `groupByFingerprint(traces, options?)`

Groups an array of stack trace objects by their `digestStackTrace` fingerprint.
Returns a `Map<string, object[]>`.

### `frameSignature(frame)`

Low-level helper — returns `"name@file"` for a single frame.

### `shortHash(input, length?)`

Generic SHA-1-based short hash utility.

## CLI

```
cat traces.txt | stacktrace-clean digest [--depth 5] [--hash-length 12] [--with-header] [--group]
```

- `--with-header` — include the error header in the fingerprint
- `--group` — group traces and print occurrence counts instead of per-trace lines
