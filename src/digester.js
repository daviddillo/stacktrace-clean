/**
 * digester.js — compute stable fingerprints for stack traces
 */

const crypto = require('crypto');

/**
 * Produce a short hash from a string.
 * @param {string} input
 * @param {number} length
 * @returns {string}
 */
function shortHash(input, length = 8) {
  return crypto.createHash('sha1').update(input).digest('hex').slice(0, length);
}

/**
 * Build a canonical string for a single frame suitable for hashing.
 * Ignores line/column so minor source changes don't alter the fingerprint.
 * @param {object} frame
 * @returns {string}
 */
function frameSignature(frame) {
  const file = frame.file || '<unknown>';
  const name = frame.name || '<anonymous>';
  return `${name}@${file}`;
}

/**
 * Compute a fingerprint for an entire stack trace.
 * Uses the top N frames (default 5) for stability.
 * @param {object} stackTrace  - { frames: Frame[] }
 * @param {object} [options]
 * @param {number} [options.depth=5]
 * @param {number} [options.hashLength=12]
 * @returns {string}
 */
function digestStackTrace(stackTrace, options = {}) {
  const { depth = 5, hashLength = 12 } = options;
  const frames = (stackTrace.frames || []).slice(0, depth);
  const sig = frames.map(frameSignature).join('|');
  return shortHash(sig, hashLength);
}

/**
 * Compute a fingerprint that also incorporates the error type/message header.
 * @param {object} stackTrace  - { header?: string, frames: Frame[] }
 * @param {object} [options]
 * @returns {string}
 */
function digestWithHeader(stackTrace, options = {}) {
  const { depth = 5, hashLength = 12 } = options;
  const frames = (stackTrace.frames || []).slice(0, depth);
  const sig = (stackTrace.header || '') + '|' + frames.map(frameSignature).join('|');
  return shortHash(sig, hashLength);
}

/**
 * Group an array of stack traces by their fingerprint.
 * @param {object[]} traces
 * @param {object} [options]
 * @returns {Map<string, object[]>}
 */
function groupByFingerprint(traces, options = {}) {
  const map = new Map();
  for (const trace of traces) {
    const key = digestStackTrace(trace, options);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(trace);
  }
  return map;
}

module.exports = { shortHash, frameSignature, digestStackTrace, digestWithHeader, groupByFingerprint };
