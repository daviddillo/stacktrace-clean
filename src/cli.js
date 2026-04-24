#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { parseStackTrace } = require('./parser');
const { formatStackTrace } = require('./formatter');
const { resolveFrames } = require('./resolver');

const args = process.argv.slice(2);

function printHelp() {
  console.log(`
Usage: stacktrace-clean [options] [file]

Options:
  --no-color     Disable color output
  --no-internal  Hide internal Node.js frames
  --cwd <dir>    Set working directory for source map resolution
  -h, --help     Show this help message

Examples:
  cat error.log | stacktrace-clean
  stacktrace-clean error.log
  stacktrace-clean --no-internal error.log
`);
}

async function run(input, options = {}) {
  const frames = parseStackTrace(input);
  const resolved = await resolveFrames(frames, options);
  const output = formatStackTrace(resolved, options);
  process.stdout.write(output + '\n');
}

async function main() {
  const options = {
    color: true,
    showInternal: true,
    cwd: process.cwd(),
  };

  let file = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '-h' || arg === '--help') {
      printHelp();
      process.exit(0);
    } else if (arg === '--no-color') {
      options.color = false;
    } else if (arg === '--no-internal') {
      options.showInternal = false;
    } else if (arg === '--cwd') {
      options.cwd = args[++i];
    } else if (!arg.startsWith('-')) {
      file = arg;
    }
  }

  if (file) {
    const input = fs.readFileSync(path.resolve(file), 'utf8');
    await run(input, options);
  } else if (!process.stdin.isTTY) {
    let input = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => { input += chunk; });
    process.stdin.on('end', async () => {
      await run(input, options);
    });
  } else {
    printHelp();
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
