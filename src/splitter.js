/**
 * splitter.js — splits raw input text into individual stack trace blocks
 */

const TRACE_START = /^(\w[\w.]*Error[^\n]*)$/m;
const FRAME_LINE = /^\s+at /;

/**
 * Find the index where a stack trace block ends.
 * A block ends when we hit a blank line or non-frame, non-header content.
 */
function findBlockEnd(lines, start) {
  let i = start + 1;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') break;
    if (!FRAME_LINE.test(line) && TRACE_START.test(line)) break;
    i++;
  }
  return i;
}

/**
 * Split a raw string into an array of raw stack trace blocks.
 * Each block is a string containing one error header + its frames.
 *
 * @param {string} input
 * @returns {string[]}
 */
function splitTraces(input) {
  const lines = input.split('\n');
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (TRACE_START.test(line.trim())) {
      const end = findBlockEnd(lines, i);
      const block = lines.slice(i, end).join('\n').trim();
      if (block) blocks.push(block);
      i = end;
    } else {
      i++;
    }
  }

  return blocks;
}

/**
 * Check whether a string contains at least one recognisable stack trace.
 *
 * @param {string} input
 * @returns {boolean}
 */
function containsTrace(input) {
  return TRACE_START.test(input) && FRAME_LINE.test(input);
}

module.exports = { splitTraces, containsTrace, findBlockEnd };
