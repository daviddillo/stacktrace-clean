/**
 * bookmark.js — save and recall named stack trace snapshots
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const DEFAULT_STORE = path.join(os.homedir(), '.stacktrace-clean', 'bookmarks.json');

function loadStore(storePath = DEFAULT_STORE) {
  try {
    const raw = fs.readFileSync(storePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveStore(store, storePath = DEFAULT_STORE) {
  const dir = path.dirname(storePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');
}

function addBookmark(name, stackTrace, storePath = DEFAULT_STORE) {
  if (!name || typeof name !== 'string') throw new Error('Bookmark name must be a non-empty string');
  const store = loadStore(storePath);
  store[name] = {
    savedAt: new Date().toISOString(),
    stackTrace,
  };
  saveStore(store, storePath);
  return store[name];
}

function getBookmark(name, storePath = DEFAULT_STORE) {
  const store = loadStore(storePath);
  return store[name] || null;
}

function removeBookmark(name, storePath = DEFAULT_STORE) {
  const store = loadStore(storePath);
  if (!store[name]) return false;
  delete store[name];
  saveStore(store, storePath);
  return true;
}

function listBookmarks(storePath = DEFAULT_STORE) {
  const store = loadStore(storePath);
  return Object.entries(store).map(([name, entry]) => ({
    name,
    savedAt: entry.savedAt,
    frameCount: entry.stackTrace?.frames?.length ?? 0,
  }));
}

function clearBookmarks(storePath = DEFAULT_STORE) {
  saveStore({}, storePath);
}

module.exports = { addBookmark, getBookmark, removeBookmark, listBookmarks, clearBookmarks, DEFAULT_STORE };
