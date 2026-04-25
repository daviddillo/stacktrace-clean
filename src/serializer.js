/**
 * serializer.js
 * Converts parsed stack trace objects to various output formats (JSON, plain text, markdown).
 */

'use strict';

/**
 * Serialize a single frame to a plain object.
 * @param {object} frame
 * @returns {object}
 */
function serializeFrame(frame) {
  return {
    raw: frame.raw || null,
    name: frame.name || '<anonymous>',
    file: frame.file || null,
    line: frame.line != null ? Number(frame.line) : null,
    column: frame.column != null ? Number(frame.column) : null,
    isInternal: Boolean(frame.isInternal),
    isNative: Boolean(frame.isNative),
    resolved: frame.resolved || null,
  };
}

/**
 * Serialize a full stack trace to a plain object.
 * @param {object} stackTrace
 * @returns {object}
 */
function serializeStackTrace(stackTrace) {
  return {
    header: stackTrace.header || null,
    message: stackTrace.message || null,
    frames: (stackTrace.frames || []).map(serializeFrame),
  };
}

/**
 * Convert a stack trace to a JSON string.
 * @param {object} stackTrace
 * @param {boolean} [pretty=false]
 * @returns {string}
 */
function toJSON(stackTrace, pretty = false) {
  const data = serializeStackTrace(stackTrace);
  return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
}

/**
 * Convert a stack trace to plain text (no ANSI codes).
 * @param {object} stackTrace
 * @returns {string}
 */
function toPlainText(stackTrace) {
  const lines = [];
  if (stackTrace.header) lines.push(stackTrace.header);
  for (const frame of stackTrace.frames || []) {
    const loc = frame.file
      ? `${frame.file}:${frame.line ?? '?'}:${frame.column ?? '?'}`
      : '(unknown)';
    lines.push(`    at ${frame.name || '<anonymous>'} (${loc})`);
  }
  return lines.join('\n');
}

/**
 * Convert a stack trace to a markdown code block.
 * @param {object} stackTrace
 * @returns {string}
 */
function toMarkdown(stackTrace) {
  return '```\n' + toPlainText(stackTrace) + '\n```';
}

module.exports = { serializeFrame, serializeStackTrace, toJSON, toPlainText, toMarkdown };
