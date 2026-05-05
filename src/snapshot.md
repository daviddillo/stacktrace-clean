# snapshot

Save and restore named stack trace snapshots to disk for later comparison or reference.

## Functions

### `saveSnapshot(name, stackTrace, storePath?)`

Persists a stack trace under the given name. Overwrites any existing snapshot with the same name.

```js
const { saveSnapshot } = require('./snapshot');
saveSnapshot('before-deploy', parsedTrace);
```

### `getSnapshot(name, storePath?)`

Retrieves a previously saved snapshot by name. Returns `null` if not found.

### `removeSnapshot(name, storePath?)`

Deletes a snapshot by name. Returns `true` if removed, `false` if it didn't exist.

### `listSnapshots(storePath?)`

Returns an array of metadata objects for all saved snapshots:

```js
[
  { name: 'before-deploy', savedAt: '2024-06-01T12:00:00Z', frameCount: 8 },
  ...
]
```

## Storage

Snapshots are stored in `~/.stacktrace-clean/snapshots.json` by default. Pass a custom `storePath` for testing or alternate environments.

## CLI Usage

```
stacktrace-clean snapshot save <name>
stacktrace-clean snapshot get <name>
stacktrace-clean snapshot remove <name>
stacktrace-clean snapshot list
```
