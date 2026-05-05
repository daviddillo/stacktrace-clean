/**
 * bookmark-cli.js — CLI subcommands for managing bookmarks
 */

const { addBookmark, getBookmark, removeBookmark, listBookmarks, clearBookmarks } = require('./bookmark');
const { formatStackTrace } = require('./formatter');
const { highlightStackTrace } = require('./highlighter');

function handleBookmarkCommand(argv, input) {
  const [sub, name] = argv;

  switch (sub) {
    case 'save': {
      if (!name) return void console.error('Usage: bookmark save <name>');
      if (!input) return void console.error('No stack trace input provided');
      addBookmark(name, input);
      console.log(`Bookmark '${name}' saved.`);
      break;
    }

    case 'show': {
      if (!name) return void console.error('Usage: bookmark show <name>');
      const entry = getBookmark(name);
      if (!entry) return void console.error(`No bookmark named '${name}'`);
      const formatted = formatStackTrace(entry.stackTrace);
      const highlighted = highlightStackTrace(formatted);
      console.log(`Bookmark: ${name} (saved ${entry.savedAt})\n`);
      console.log(highlighted);
      break;
    }

    case 'list': {
      const items = listBookmarks();
      if (items.length === 0) return void console.log('No bookmarks saved.');
      items.forEach(({ name: n, savedAt, frameCount }) => {
        console.log(`  ${n.padEnd(24)} ${frameCount} frames   ${savedAt}`);
      });
      break;
    }

    case 'remove': {
      if (!name) return void console.error('Usage: bookmark remove <name>');
      const removed = removeBookmark(name);
      console.log(removed ? `Removed '${name}'.` : `Bookmark '${name}' not found.`);
      break;
    }

    case 'clear': {
      clearBookmarks();
      console.log('All bookmarks cleared.');
      break;
    }

    default:
      console.error(`Unknown bookmark subcommand: ${sub}`);
      console.error('Available: save, show, list, remove, clear');
  }
}

module.exports = { handleBookmarkCommand };
