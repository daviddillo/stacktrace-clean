/**
 * timeline.js — orders and timestamps stack trace frames for chronological analysis
 */

'use strict';

/**
 * Attach a monotonic index to each frame as a proxy for timeline position.
 * @param {object[]} frames
 * @returns {object[]}
 */
function indexFrames(frames) {
  return frames.map((frame, i) => ({ ...frame, timelineIndex: i }));
}

/**
 * Group frames into buckets by their source category (app / module / internal).
 * @param {object[]} frames
 * @returns {object}
 */
function bucketByCategory(frames) {
  const buckets = { app: [], module: [], internal: [] };
  for (const frame of frames) {
    const key = frame.category || 'internal';
    if (!buckets[key]) buckets[key] = [];
    buckets[key].push(frame);
  }
  return buckets;
}

/**
 * Build a flat timeline entry for each frame with position metadata.
 * @param {object[]} frames
 * @param {object} [opts]
 * @param {boolean} [opts.includeInternal=false]
 * @returns {object[]}
 */
function buildTimeline(frames, opts = {}) {
  const { includeInternal = false } = opts;
  const indexed = indexFrames(frames);
  return indexed
    .filter(f => includeInternal || f.category !== 'internal')
    .map((f, position) => ({
      position,
      originalIndex: f.timelineIndex,
      file: f.file || '<unknown>',
      line: f.line ?? null,
      column: f.column ?? null,
      name: f.name || '<anonymous>',
      category: f.category || 'internal',
    }));
}

/**
 * Format a timeline as a human-readable string.
 * @param {object[]} timeline
 * @returns {string}
 */
function formatTimeline(timeline) {
  if (timeline.length === 0) return '(empty timeline)';
  return timeline
    .map(entry => {
      const loc = entry.line != null ? `:${entry.line}` : '';
      return `  [${entry.position}] ${entry.name} @ ${entry.file}${loc} (${entry.category})`;
    })
    .join('\n');
}

module.exports = { indexFrames, bucketByCategory, buildTimeline, formatTimeline };
