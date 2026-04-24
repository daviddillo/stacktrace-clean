'use strict';

const path = require('path');
const { resolveSourceMap } = require('./sourcemap');

/**
 * Attempt to resolve a single frame through its source map.
 * Returns a new frame object with updated file/line/column if resolved.
 */
async function resolveFrame(frame, options = {}) {
  if (!frame || !frame.file) return frame;

  try {
    const position = await resolveSourceMap(frame.file, frame.line, frame.column);
    if (!position) return frame;

    return {
      ...frame,
      file: position.source || frame.file,
      line: position.line != null ? position.line : frame.line,
      column: position.column != null ? position.column : frame.column,
      originalFile: frame.file,
      originalLine: frame.line,
      originalColumn: frame.column,
      name: position.name || frame.name,
    };
  } catch {
    return frame;
  }
}

/**
 * Resolve all frames in a parsed stack trace.
 */
async function resolveFrames(frames, options = {}) {
  if (!Array.isArray(frames)) return [];
  return Promise.all(frames.map(frame => resolveFrame(frame, options)));
}

module.exports = { resolveFrame, resolveFrames };
