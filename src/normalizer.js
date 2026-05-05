/**
 * normalizer.js
 * Normalizes raw stack trace strings into consistent formats
 * before further processing in the pipeline.
 */

'use strict';

const WINDOWS_PATH_RE = /^([A-Za-z]):\\/;
const TRAILING_WHITESPACE_RE = /[ \t]+$/gm;
const CRLF_RE = /\r\n/g;
const NULL_BYTE_RE = /\0/g;
const REPEATED_NEWLINES_RE = /\n{3,}/g;

/**
 * Normalize line endings to LF.
 * @param {string} input
 * @returns {string}
 */
function normalizeLineEndings(input) {
  return input.replace(CRLF_RE, '\n');
}

/**
 * Strip trailing whitespace from each line.
 * @param {string} input
 * @returns {string}
 */
function stripTrailingWhitespace(input) {
  return input.replace(TRAILING_WHITESPACE_RE, '');
}

/**
 * Collapse 3+ consecutive blank lines down to 2.
 * @param {string} input
 * @returns {string}
 */
function collapseBlankLines(input) {
  return input.replace(REPEATED_NEWLINES_RE, '\n\n');
}

/**
 * Convert Windows-style backslash paths to forward slashes.
 * @param {string} input
 * @returns {string}
 */
function normalizePaths(input) {
  if (!WINDOWS_PATH_RE.test(input)) return input;
  return input.replace(/\\/g, '/');
}

/**
 * Remove null bytes that can appear in some environments.
 * @param {string} input
 * @returns {string}
 */
function removeNullBytes(input) {
  return input.replace(NULL_BYTE_RE, '');
}

/**
 * Apply all normalization steps to a raw stack trace string.
 * @param {string} raw
 * @returns {string}
 */
function normalizeStackTrace(raw) {
  if (typeof raw !== 'string') {
    throw new TypeError(`Expected string, got ${typeof raw}`);
  }
  let result = raw;
  result = removeNullBytes(result);
  result = normalizeLineEndings(result);
  result = normalizePaths(result);
  result = stripTrailingWhitespace(result);
  result = collapseBlankLines(result);
  return result.trim();
}

module.exports = {
  normalizeLineEndings,
  stripTrailingWhitespace,
  collapseBlankLines,
  normalizePaths,
  removeNullBytes,
  normalizeStackTrace,
};
