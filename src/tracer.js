/**
 * tracer.js — captures and attaches runtime trace context to stack traces
 */

'use strict';

const { parseStackTrace } = require('./parser');

/**
 * Capture the current stack trace as a parsed frame array.
 * @param {number} [skip=1] - how many top frames to skip (default skips tracer itself)
 */
function captureTrace(skip = 1) {
  const err = new Error();
  const lines = (err.stack || '').split('\n');
  // Remove 'Error' header + skip frames
  const frameLines = lines.slice(1 + skip).join('\n');
  return parseStackTrace(frameLines);
}

/**
 * Attach a trace context label to each frame.
 * @param {object[]} frames
 * @param {string} label
 */
function labelTrace(frames, label) {
  return frames.map(f => ({ ...f, traceContext: label }));
}

/**
 * Merge a "cause" trace into a primary trace, separated by a boundary marker.
 * @param {object[]} primary
 * @param {object[]} cause
 * @param {string} [separator]
 */
function mergeWithCause(primary, cause, separator = 'caused by') {
  const boundary = { type: 'boundary', separator, traceContext: null };
  return [...primary, boundary, ...cause];
}

/**
 * Extract only frames that belong to a given traceContext label.
 * @param {object[]} frames
 * @param {string} label
 */
function extractByContext(frames, label) {
  return frames.filter(f => f.traceContext === label);
}

/**
 * Build a tracer bound to a named context.
 * @param {string} contextName
 */
function createTracer(contextName) {
  return {
    capture(skip = 1) {
      return labelTrace(captureTrace(skip + 1), contextName);
    },
    context: contextName,
  };
}

module.exports = {
  captureTrace,
  labelTrace,
  mergeWithCause,
  extractByContext,
  createTracer,
};
