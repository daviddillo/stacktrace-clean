/**
 * snapshot.js — Save and restore named stack trace snapshots
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const DEFAULT_STORE = path.join(os.homedir(), '.stacktrace-clean', 'snapshots.json');

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

function saveSnapshot(name, stackTrace, storePath = DEFAULT_STORE) {
  if (!name || typeof name !== 'string') throw new Error('Snapshot name is required');
  const store = loadStore(storePath);
  store[name] = {
    savedAt: new Date().toISOString(),
    stackTrace,
  };
  saveStore(store, storePath);
  return store[name];
}

function getSnapshot(name, storePath = DEFAULT_STORE) {
  const store = loadStore(storePath);
  return store[name] || null;
}

function removeSnapshot(name, storePath = DEFAULT_STORE) {
  const store = loadStore(storePath);
  if (!store[name]) return false;
  delete store[name];
  saveStore(store, storePath);
  return true;
}

function listSnapshots(storePath = DEFAULT_STORE) {
  const store = loadStore(storePath);
  return Object.entries(store).map(([name, entry]) => ({
    name,
    savedAt: entry.savedAt,
    frameCount: entry.stackTrace?.frames?.length ?? 0,
  }));
}

module.exports = { loadStore, saveStore, saveSnapshot, getSnapshot, removeSnapshot, listSnapshots };
