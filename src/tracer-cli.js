'use strict';

/**
 * tracer-cli.js — CLI sub-command for capturing/displaying trace context info
 */

const fs = require('fs');
const { parseStackTrace } = require('./parser');
const { labelTrace, mergeWithCause, extractByContext } = require('./tracer');
const { highlightStackTrace } = require('./highlighter');

function parseTracerArgs(argv) {
  const args = { context: null, causeFile: null, extract: null, input: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--context' && argv[i + 1]) args.context = argv[++i];
    else if (argv[i] === '--cause' && argv[i + 1]) args.causeFile = argv[++i];
    else if (argv[i] === '--extract' && argv[i + 1]) args.extract = argv[++i];
    else if (!argv[i].startsWith('--')) args.input = argv[i];
  }
  return args;
}

function handleTracerCommand(argv, stdin, stdout) {
  const args = parseTracerArgs(argv);

  let raw = '';
  if (args.input) {
    raw = fs.readFileSync(args.input, 'utf8');
  } else {
    raw = stdin;
  }

  let frames = parseStackTrace(raw);

  if (args.context) {
    frames = labelTrace(frames, args.context);
  }

  if (args.causeFile) {
    const causeRaw = fs.readFileSync(args.causeFile, 'utf8');
    const causeFrames = parseStackTrace(causeRaw);
    frames = mergeWithCause(frames, causeFrames);
  }

  if (args.extract) {
    frames = extractByContext(frames, args.extract);
  }

  const output = highlightStackTrace({ frames });
  stdout.write(output + '\n');
}

module.exports = { parseTracerArgs, handleTracerCommand };
