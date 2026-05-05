/**
 * snapshot-cli.js — CLI handler for snapshot subcommands
 */

const { saveSnapshot, getSnapshot, removeSnapshot, listSnapshots } = require('./snapshot');

function handleSnapshotCommand(args, input, config) {
  const [subcommand, name] = args;

  switch (subcommand) {
    case 'save': {
      if (!name) return { error: 'Usage: snapshot save <name>' };
      if (!input) return { error: 'No stack trace input provided' };
      const entry = saveSnapshot(name, input, config?.snapshotStore);
      return { message: `Snapshot "${name}" saved at ${entry.savedAt}` };
    }

    case 'get': {
      if (!name) return { error: 'Usage: snapshot get <name>' };
      const entry = getSnapshot(name, config?.snapshotStore);
      if (!entry) return { error: `Snapshot "${name}" not found` };
      return { snapshot: entry };
    }

    case 'remove': {
      if (!name) return { error: 'Usage: snapshot remove <name>' };
      const removed = removeSnapshot(name, config?.snapshotStore);
      if (!removed) return { error: `Snapshot "${name}" not found` };
      return { message: `Snapshot "${name}" removed` };
    }

    case 'list': {
      const snapshots = listSnapshots(config?.snapshotStore);
      if (snapshots.length === 0) return { message: 'No snapshots saved' };
      return { snapshots };
    }

    default:
      return { error: `Unknown snapshot subcommand: "${subcommand}". Use save, get, remove, or list.` };
  }
}

module.exports = { handleSnapshotCommand };
