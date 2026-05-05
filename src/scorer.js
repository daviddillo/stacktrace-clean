/**
 * scorer.js — assigns relevance scores to stack frames
 * Useful for surfacing the most actionable frames first.
 */

'use strict';

const INTERNAL_PENALTY = -10;
const NODE_MODULES_PENALTY = -5;
const RESOLVED_BONUS = 8;
const APP_CODE_BONUS = 15;
const ASYNC_PENALTY = -2;

/**
 * Score a single frame based on heuristics.
 * Higher score = more relevant to the user.
 * @param {object} frame
 * @param {object} [opts]
 * @returns {number}
 */
function scoreFrame(frame, opts = {}) {
  const { appRoot = process.cwd() } = opts;
  let score = 0;

  if (!frame || typeof frame !== 'object') return score;

  // Internal Node.js frames are least useful
  if (frame.isInternal) {
    score += INTERNAL_PENALTY;
  }

  // node_modules are less relevant than app code
  if (frame.file && frame.file.includes('node_modules')) {
    score += NODE_MODULES_PENALTY;
  } else if (frame.file && frame.file.startsWith(appRoot)) {
    score += APP_CODE_BONUS;
  }

  // Resolved source map frames are more trustworthy
  if (frame.resolved) {
    score += RESOLVED_BONUS;
  }

  // Async frames are slightly less actionable
  if (frame.isAsync) {
    score += ASYNC_PENALTY;
  }

  // Named functions are easier to debug
  if (frame.name && frame.name !== '<anonymous>') {
    score += 3;
  }

  // Frames with line/column info are more useful
  if (frame.line != null && frame.column != null) {
    score += 2;
  }

  return score;
}

/**
 * Score all frames in a stack trace and attach scores.
 * @param {object[]} frames
 * @param {object} [opts]
 * @returns {object[]} frames with `score` property attached
 */
function scoreFrames(frames, opts = {}) {
  if (!Array.isArray(frames)) return [];
  return frames.map(frame => ({
    ...frame,
    score: scoreFrame(frame, opts)
  }));
}

/**
 * Sort frames by score descending (highest relevance first).
 * @param {object[]} frames — already scored
 * @returns {object[]}
 */
function rankFrames(frames) {
  if (!Array.isArray(frames)) return [];
  return [...frames].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}

module.exports = { scoreFrame, scoreFrames, rankFrames };
