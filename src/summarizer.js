/**
 * summarizer.js
 * Produces a human-readable summary of a processed stack trace,
 * including error type, message, frame count, and top locations.
 */

'use strict';

/**
 * Extract the error type and message from the header line.
 * @param {string} header
 * @returns {{ type: string, message: string }}
 */
function parseHeader(header) {
  const match = header.match(/^([\w.]+(?:Error|Exception)?):?\s*(.*)$/);
  if (match) {
    return { type: match[1], message: match[2].trim() };
  }
  return { type: 'Error', message: header.trim() };
}

/**
 * Build a short summary object from a stack trace result.
 * @param {{ header: string, frames: Array<object> }} stackTrace
 * @param {object} [options]
 * @param {number} [options.topFrames=3] - how many top frames to include
 * @returns {object}
 */
function summarizeStackTrace(stackTrace, options = {}) {
  const { topFrames = 3 } = options;
  const { type, message } = parseHeader(stackTrace.header || '');

  const frames = stackTrace.frames || [];
  const total = frames.length;

  const top = frames.slice(0, topFrames).map((f) => ({
    name: f.name || '<anonymous>',
    file: f.file || '<unknown>',
    line: f.line ?? null,
    column: f.column ?? null,
    internal: f.internal || false,
  }));

  const internalCount = frames.filter((f) => f.internal).length;
  const userCount = total - internalCount;

  return {
    type,
    message,
    totalFrames: total,
    userFrames: userCount,
    internalFrames: internalCount,
    topFrames: top,
  };
}

/**
 * Format a summary object as a plain-text string.
 * @param {object} summary
 * @returns {string}
 */
function formatSummary(summary) {
  const lines = [
    `Error Type : ${summary.type}`,
    `Message    : ${summary.message || '(none)'}`,
    `Frames     : ${summary.totalFrames} total (${summary.userFrames} user, ${summary.internalFrames} internal)`,
    'Top Frames :',
  ];

  for (const f of summary.topFrames) {
    const loc = f.line != null ? `:${f.line}` + (f.column != null ? `:${f.column}` : '') : '';
    const tag = f.internal ? ' [internal]' : '';
    lines.push(`  ${f.name} (${f.file}${loc})${tag}`);
  }

  return lines.join('\n');
}

module.exports = { parseHeader, summarizeStackTrace, formatSummary };
