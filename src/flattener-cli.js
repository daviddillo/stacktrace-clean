'use strict';

const { flattenWithHeaders, deduplicateAcrossCauses, flattenCauses } = require('./flattener');
const { parseStackTrace } = require('./parser');
const { formatFrame } = require('./formatter');
const { highlightErrorHeader } = require('./highlighter');

function parseFlattenArgs(argv) {
  const args = argv.slice(2);
  return {
    dedupe: args.includes('--dedupe') || args.includes('-d'),
    headers: args.includes('--headers') || args.includes('-H'),
    help: args.includes('--help') || args.includes('-h'),
  };
}

function handleFlattenCommand(input, opts, out = process.stdout) {
  if (opts.help) {
    out.write('Usage: stacktrace-clean flatten [--dedupe] [--headers]\n');
    out.write('  --dedupe,  -d   Remove duplicate frames across cause chain\n');
    out.write('  --headers, -H   Print error headers between sections\n');
    return;
  }

  const stackTrace = parseStackTrace(input);

  if (opts.headers) {
    const sections = flattenWithHeaders(stackTrace);
    for (const section of sections) {
      if (section.header) {
        out.write(highlightErrorHeader(section.header) + '\n');
      }
      for (const frame of section.frames) {
        out.write(formatFrame(frame) + '\n');
      }
    }
    return;
  }

  let frames = flattenCauses(stackTrace);
  if (opts.dedupe) {
    frames = deduplicateAcrossCauses(frames);
  }
  for (const frame of frames) {
    out.write(formatFrame(frame) + '\n');
  }
}

module.exports = { parseFlattenArgs, handleFlattenCommand };
