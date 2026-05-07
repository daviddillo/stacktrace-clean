/**
 * extractor.js — pull specific frames or segments from a parsed stack trace
 */

'use strict';

/**
 * Extract frames matching a file path substring.
 * @param {object[]} frames
 * @param {string} filePath
 * @returns {object[]}
 */
function extractByFile(frames, filePath) {
  return frames.filter(f => f.file && f.file.includes(filePath));
}

/**
 * Extract frames within a line-number range (inclusive).
 * @param {object[]} frames
 * @param {number} start
 * @param {number} end
 * @returns {object[]}
 */
function extractByLineRange(frames, start, end) {
  return frames.filter(f => {
    const line = f.line ?? f.lineNumber;
    return typeof line === 'number' && line >= start && line <= end;
  });
}

/**
 * Extract the first N frames from a stack trace.
 * @param {object[]} frames
 * @param {number} n
 * @returns {object[]}
 */
function extractHead(frames, n = 5) {
  return frames.slice(0, n);
}

/**
 * Extract the last N frames from a stack trace.
 * @param {object[]} frames
 * @param {number} n
 * @returns {object[]}
 */
function extractTail(frames, n = 5) {
  return frames.slice(-n);
}

/**
 * Extract a named slice between two frame indices.
 * @param {object[]} frames
 * @param {number} from  inclusive
 * @param {number} to    exclusive
 * @returns {object[]}
 */
function extractSlice(frames, from, to) {
  return frames.slice(from, to);
}

/**
 * Extract frames belonging to a specific category (user/node/native/module).
 * @param {object[]} frames
 * @param {string} category
 * @returns {object[]}
 */
function extractByCategory(frames, category) {
  return frames.filter(f => f.category === category);
}

module.exports = {
  extractByFile,
  extractByLineRange,
  extractHead,
  extractTail,
  extractSlice,
  extractByCategory,
};
