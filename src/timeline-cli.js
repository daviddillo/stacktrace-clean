'use strict';

/**
 * timeline-cli.js — CLI handler for the `--timeline` flag
 */

const { buildTimeline, formatTimeline } = require('./timeline');
const { writeToStream } = require('./output');

/**
 * Parse minimal CLI flags relevant to timeline display.
 * @param {string[]} argv
 * @returns {object}
 */
function parseTimelineArgs(argv) {
  return {
    includeInternal: argv.includes('--internal'),
    json: argv.includes('--json'),
  };
}

/**
 * Handle the timeline sub-command.
 * Expects a parsed stack trace object with a `frames` array.
 *
 * @param {object} stackTrace
 * @param {string[]} argv
 * @param {object} [streams]
 * @param {NodeJS.WritableStream} [streams.stdout]
 * @param {NodeJS.WritableStream} [streams.stderr]
 */
function handleTimelineCommand(stackTrace, argv, streams = {}) {
  const stdout = streams.stdout || process.stdout;
  const stderr = streams.stderr || process.stderr;

  if (!stackTrace || !Array.isArray(stackTrace.frames)) {
    writeToStream(stderr, 'timeline: no frames to display\n');
    return 1;
  }

  const opts = parseTimelineArgs(argv);
  const timeline = buildTimeline(stackTrace.frames, { includeInternal: opts.includeInternal });

  if (opts.json) {
    writeToStream(stdout, JSON.stringify(timeline, null, 2) + '\n');
  } else {
    const header = `Timeline (${timeline.length} frame${timeline.length !== 1 ? 's' : ''})`;
    writeToStream(stdout, header + '\n' + formatTimeline(timeline) + '\n');
  }

  return 0;
}

module.exports = { parseTimelineArgs, handleTimelineCommand };
