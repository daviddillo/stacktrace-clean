/**
 * merger.js — Merge multiple stack traces into a unified deduplicated trace
 */

'use strict';

const { frameKey } = require('./deduplicator');

/**
 * Build a frequency map of frames across all traces
 * @param {Array<Array>} traces - array of frame arrays
 * @returns {Map<string, {frame, count, traceIndices}>}
 */
function buildFrequencyMap(traces) {
  const map = new Map();
  traces.forEach((frames, traceIndex) => {
    frames.forEach(frame => {
      const key = frameKey(frame);
      if (!map.has(key)) {
        map.set(key, { frame, count: 0, traceIndices: new Set() });
      }
      const entry = map.get(key);
      entry.count += 1;
      entry.traceIndices.add(traceIndex);
    });
  });
  return map;
}

/**
 * Merge traces keeping insertion order, annotating shared frames
 * @param {Array<Array>} traces
 * @returns {Array} merged frames with `mergeCount` annotation
 */
function mergeTraces(traces) {
  if (!Array.isArray(traces) || traces.length === 0) return [];

  const freqMap = buildFrequencyMap(traces);
  const seen = new Set();
  const merged = [];

  for (const frames of traces) {
    for (const frame of frames) {
      const key = frameKey(frame);
      if (seen.has(key)) continue;
      seen.add(key);
      const { count, traceIndices } = freqMap.get(key);
      merged.push({
        ...frame,
        mergeCount: count,
        sharedBy: Array.from(traceIndices),
      });
    }
  }

  return merged;
}

/**
 * Return only frames that appear in every trace (intersection)
 * @param {Array<Array>} traces
 * @returns {Array}
 */
function intersectTraces(traces) {
  if (!Array.isArray(traces) || traces.length === 0) return [];
  const freqMap = buildFrequencyMap(traces);
  const result = [];
  const seen = new Set();
  for (const frames of traces) {
    for (const frame of frames) {
      const key = frameKey(frame);
      if (seen.has(key)) continue;
      const entry = freqMap.get(key);
      if (entry && entry.traceIndices.size === traces.length) {
        seen.add(key);
        result.push({ ...frame, mergeCount: entry.count, sharedBy: Array.from(entry.traceIndices) });
      }
    }
  }
  return result;
}

module.exports = { buildFrequencyMap, mergeTraces, intersectTraces };
