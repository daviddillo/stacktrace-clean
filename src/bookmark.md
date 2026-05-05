# bookmark

Save and recall named stack trace snapshots across CLI sessions.

## Overview

The `bookmark` module persists parsed stack traces to a JSON store in `~/.stacktrace-clean/bookmarks.json`. Bookmarks can be listed, retrieved, and compared later using the differ.

## API

### `addBookmark(name, stackTrace, [storePath])`
Saves a stack trace under the given name. Overwrites any existing entry with the same name.

### `getBookmark(name, [storePath])`
Retrieves a previously saved bookmark. Returns `null` if not found.

### `removeBookmark(name, [storePath])`
Deletes a named bookmark. Returns `true` if removed, `false` if not found.

### `listBookmarks([storePath])`
Returns an array of summary objects `{ name, savedAt, frameCount }`.

### `clearBookmarks([storePath])`
Removes all saved bookmarks.

## CLI Usage

```
stacktrace-clean bookmark save <name>    # pipe a trace and save it
stacktrace-clean bookmark show <name>    # pretty-print a saved trace
stacktrace-clean bookmark list           # list all saved bookmarks
stacktrace-clean bookmark remove <name>  # delete a bookmark
stacktrace-clean bookmark clear          # delete all bookmarks
```

## Integration

Bookmarks integrate with `differ.js` — use `bookmark show` to retrieve a trace and pipe it into `stacktrace-clean diff` to compare against a new trace.
