/**
 * transformer.js — Apply a chain of transformation functions to a stack trace.
 */

'use strict';

/**
 * Build a transformer pipeline from an ordered list of transform functions.
 * Each transform receives the stack trace object and returns a (possibly new) one.
 *
 * @param {Function[]} transforms
 * @returns {Function} composed transformer
 */
function buildTransformer(transforms) {
  if (!Array.isArray(transforms) || transforms.length === 0) {
    return (trace) => trace;
  }
  return (trace) => transforms.reduce((acc, fn) => fn(acc), trace);
}

/**
 * Apply a single named transform by key from a registry.
 *
 * @param {object} registry  - map of name -> transform fn
 * @param {string} name
 * @param {object} trace
 * @returns {object}
 */
function applyNamed(registry, name, trace) {
  if (!registry[name]) {
    throw new Error(`Unknown transform: "${name}"`);
  }
  return registry[name](trace);
}

/**
 * Apply a list of named transforms in order.
 *
 * @param {object} registry
 * @param {string[]} names
 * @param {object} trace
 * @returns {object}
 */
function applyNamed_sequence(registry, names, trace) {
  return names.reduce((acc, name) => applyNamed(registry, name, acc), trace);
}

/**
 * Built-in no-op transform (identity).
 */
function identity(trace) {
  return trace;
}

/**
 * Built-in transform: strip frames with no resolved source.
 */
function stripUnresolved(trace) {
  return {
    ...trace,
    frames: (trace.frames || []).filter((f) => f.resolved !== false),
  };
}

/**
 * Built-in transform: limit frames to a maximum count.
 */
function limitFrames(max) {
  return (trace) => ({
    ...trace,
    frames: (trace.frames || []).slice(0, max),
  });
}

module.exports = {
  buildTransformer,
  applyNamed,
  applyNamed_sequence,
  identity,
  stripUnresolved,
  limitFrames,
};
