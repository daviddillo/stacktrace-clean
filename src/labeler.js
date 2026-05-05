/**
 * labeler.js — Attach human-readable labels to stack frames based on
 * heuristics: framework detection, user code, test files, etc.
 */

const FRAMEWORK_PATTERNS = [
  { pattern: /node_modules[\\/]express/, label: 'express' },
  { pattern: /node_modules[\\/]koa/, label: 'koa' },
  { pattern: /node_modules[\\/]fastify/, label: 'fastify' },
  { pattern: /node_modules[\\/]jest/, label: 'jest' },
  { pattern: /node_modules[\\/]mocha/, label: 'mocha' },
  { pattern: /node_modules[\\/]webpack/, label: 'webpack' },
  { pattern: /node_modules[\\/]babel/, label: 'babel' },
  { pattern: /node_modules[\\/]typescript/, label: 'typescript' },
];

const TEST_PATTERN = /[._-](test|spec)\.[jt]sx?$/i;
const INTERNAL_PATTERN = /^node:|^internal\//;
const NODE_MODULES_PATTERN = /node_modules/;

/**
 * Derive a single label string for a frame.
 * @param {object} frame
 * @returns {string}
 */
function deriveLabel(frame) {
  const file = frame.resolvedFile || frame.file || '';

  if (INTERNAL_PATTERN.test(file)) return 'node-internal';

  for (const { pattern, label } of FRAMEWORK_PATTERNS) {
    if (pattern.test(file)) return label;
  }

  if (NODE_MODULES_PATTERN.test(file)) return 'dependency';
  if (TEST_PATTERN.test(file)) return 'test';

  return 'app';
}

/**
 * Attach a `label` property to every frame in the array.
 * Returns a new array; frames are shallow-cloned.
 * @param {object[]} frames
 * @returns {object[]}
 */
function labelFrames(frames) {
  return frames.map((frame) => ({
    ...frame,
    label: deriveLabel(frame),
  }));
}

/**
 * Return the subset of frames matching a given label.
 * @param {object[]} frames
 * @param {string} label
 * @returns {object[]}
 */
function filterByLabel(frames, label) {
  return frames.filter((f) => f.label === label);
}

/**
 * List every distinct label present in the frame set.
 * @param {object[]} frames
 * @returns {string[]}
 */
function listLabels(frames) {
  return [...new Set(frames.map((f) => f.label || deriveLabel(f)))];
}

module.exports = { deriveLabel, labelFrames, filterByLabel, listLabels };
