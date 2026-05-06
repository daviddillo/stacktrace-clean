'use strict';

const readline = require('readline');
const { fuzzySearch } = require('./fuzzer');
const { parseStackTrace } = require('./parser');
const { formatFrame } = require('./formatter');
const { highlightFrame } = require('./highlighter');

/**
 * Parse CLI args for the fuzzer subcommand.
 * Usage: stacktrace-clean fuzzy <query> [--limit N] [--threshold N]
 */
function parseFuzzerArgs(argv) {
  const args = { query: '', limit: 20, threshold: 0.3 };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--limit' && argv[i + 1]) {
      args.limit = parseInt(argv[++i], 10);
    } else if (argv[i] === '--threshold' && argv[i + 1]) {
      args.threshold = parseFloat(argv[++i]);
    } else if (!argv[i].startsWith('--')) {
      args.query = argv[i];
    }
  }
  return args;
}

/**
 * Read stdin to completion and return a string.
 */
function readStdin() {
  return new Promise(resolve => {
    const chunks = [];
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', d => chunks.push(d));
    process.stdin.on('end', () => resolve(chunks.join('')));
  });
}

/**
 * Main handler for the fuzzy subcommand.
 */
async function handleFuzzerCommand(argv, { stdin = process.stdin, stdout = process.stdout } = {}) {
  const { query, limit, threshold } = parseFuzzerArgs(argv);

  if (!query) {
    stdout.write('Usage: stacktrace-clean fuzzy <query> [--limit N] [--threshold N]\n');
    return 1;
  }

  const raw = await readStdin();
  const trace = parseStackTrace(raw);

  if (!trace || trace.frames.length === 0) {
    stdout.write('No stack trace found in input.\n');
    return 1;
  }

  const matches = fuzzySearch(trace.frames, query, { limit, threshold });

  if (matches.length === 0) {
    stdout.write(`No frames matched "${query}".\n`);
    return 0;
  }

  stdout.write(`Found ${matches.length} matching frame(s) for "${query}":\n\n`);
  for (const frame of matches) {
    stdout.write(highlightFrame(formatFrame(frame)) + '\n');
  }
  return 0;
}

module.exports = { parseFuzzerArgs, handleFuzzerCommand };
