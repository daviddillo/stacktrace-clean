/**
 * printer.js — formats and prints a final stack trace to a destination stream
 * Ties together highlight, truncate, filter, and output into one call.
 */

const { highlightStackTrace } = require('./highlighter');
const { truncateStackTrace } = require('./truncator');
const { filterFrames } = require('./filter');
const { prepareOutput, writeToStream, writeToFile } = require('./output');
const { resolveConfig } = require('./config');

/**
 * Build print options by merging defaults with caller overrides.
 * @param {object} overrides
 * @returns {object}
 */
function buildPrintOptions(overrides = {}) {
  const defaults = {
    color: true,
    maxFrames: 50,
    exclude: [],
    outputFile: null,
    stream: process.stdout,
  };
  return Object.assign({}, defaults, overrides);
}

/**
 * Core print routine — applies filter → truncate → highlight → output.
 * @param {object} stackTrace  parsed stack trace object
 * @param {object} options
 * @returns {string} the rendered text that was emitted
 */
function printStackTrace(stackTrace, options = {}) {
  const opts = buildPrintOptions(options);

  const filtered = filterFrames(stackTrace.frames, { exclude: opts.exclude });
  const truncated = truncateStackTrace(
    { ...stackTrace, frames: filtered },
    opts.maxFrames
  );

  const rendered = opts.color
    ? highlightStackTrace(truncated)
    : prepareOutput(truncated, { color: false });

  if (opts.outputFile) {
    writeToFile(opts.outputFile, rendered);
  } else {
    writeToStream(opts.stream, rendered);
  }

  return rendered;
}

/**
 * Convenience wrapper that resolves config before printing.
 * @param {object} stackTrace
 * @param {object} rawConfig
 * @returns {string}
 */
function printWithConfig(stackTrace, rawConfig = {}) {
  const config = resolveConfig(rawConfig);
  return printStackTrace(stackTrace, {
    color: config.color,
    maxFrames: config.maxFrames,
    exclude: config.exclude,
    outputFile: config.outputFile || null,
  });
}

module.exports = { buildPrintOptions, printStackTrace, printWithConfig };
