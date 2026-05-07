/**
 * scoper.js — Extract and classify stack frames by scope (module, function, async, etc.)
 */

'use strict';

const ASYNC_PATTERNS = [/^async /, /Promise/, /processTicksAndRejections/];
const NATIVE_PATTERNS = [/\(native\)/, /\[native code\]/];
const NODE_INTERNALS = [/^node:/, /^internal\//];

/**
 * Determine the scope type of a single frame.
 * @param {object} frame
 * @returns {string} 'async' | 'native' | 'internal' | 'module' | 'anonymous' | 'user'
 */
function classifyScope(frame) {
  const name = frame.name || '';
  const file = frame.file || '';

  if (NATIVE_PATTERNS.some(p => p.test(file) || p.test(name))) return 'native';
  if (NODE_INTERNALS.some(p => p.test(file))) return 'internal';
  if (ASYNC_PATTERNS.some(p => p.test(name))) return 'async';
  if (!name || name === '<anonymous>') return 'anonymous';
  if (/node_modules/.test(file)) return 'module';
  return 'user';
}

/**
 * Annotate each frame with its scope.
 * @param {object[]} frames
 * @returns {object[]}
 */
function scopeFrames(frames) {
  return frames.map(frame => ({ ...frame, scope: classifyScope(frame) }));
}

/**
 * Filter frames to only those matching a given scope.
 * @param {object[]} frames
 * @param {string} scope
 * @returns {object[]}
 */
function filterByScope(frames, scope) {
  return scopeFrames(frames).filter(f => f.scope === scope);
}

/**
 * Group frames by scope label.
 * @param {object[]} frames
 * @returns {Object.<string, object[]>}
 */
function groupByScope(frames) {
  const scoped = scopeFrames(frames);
  return scoped.reduce((acc, frame) => {
    const key = frame.scope;
    if (!acc[key]) acc[key] = [];
    acc[key].push(frame);
    return acc;
  }, {});
}

/**
 * Return a summary count of frames per scope.
 * @param {object[]} frames
 * @returns {Object.<string, number>}
 */
function scopeSummary(frames) {
  const groups = groupByScope(frames);
  return Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, v.length]));
}

module.exports = { classifyScope, scopeFrames, filterByScope, groupByScope, scopeSummary };
