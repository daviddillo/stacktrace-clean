/**
 * aggregator.js — Combine multiple stack traces into a unified report
 */

'use strict';

const { buildStats } = require('./stats');
const { parseHeader } = require('./summarizer');

/**
 * Group stack traces by their error type
 * @param {Array} stackTraces
 * @returns {Object} map of errorType -> stackTraces[]
 */
function groupByErrorType(stackTraces) {
  const groups = {};
  for (const st of stackTraces) {
    const header = parseHeader(st.raw || '');
    const key = header.errorType || 'Unknown';
    if (!groups[key]) groups[key] = [];
    groups[key].push(st);
  }
  return groups;
}

/**
 * Count occurrences of each unique stack trace (by first frame)
 * @param {Array} stackTraces
 * @returns {Array} [{ stackTrace, count }]
 */
function countOccurrences(stackTraces) {
  const seen = new Map();
  for (const st of stackTraces) {
    const firstFrame = st.frames && st.frames[0];
    const key = firstFrame
      ? `${firstFrame.file}:${firstFrame.line}:${firstFrame.column}`
      : '__empty__';
    if (seen.has(key)) {
      seen.get(key).count++;
    } else {
      seen.set(key, { stackTrace: st, count: 1 });
    }
  }
  return Array.from(seen.values());
}

/**
 * Aggregate an array of parsed stack traces into a summary object
 * @param {Array} stackTraces
 * @returns {Object}
 */
function aggregateStackTraces(stackTraces) {
  if (!Array.isArray(stackTraces) || stackTraces.length === 0) {
    return { total: 0, groups: {}, occurrences: [], stats: null };
  }

  const groups = groupByErrorType(stackTraces);
  const occurrences = countOccurrences(stackTraces);
  const allFrames = stackTraces.flatMap((st) => st.frames || []);
  const stats = buildStats(allFrames);

  return {
    total: stackTraces.length,
    uniqueErrors: occurrences.length,
    groups,
    occurrences: occurrences.sort((a, b) => b.count - a.count),
    stats,
  };
}

/**
 * Format aggregated results as a plain-text summary string
 * @param {Object} aggregated
 * @returns {string}
 */
function formatAggregation(aggregated) {
  const lines = [];
  lines.push(`Total stack traces: ${aggregated.total}`);
  lines.push(`Unique errors: ${aggregated.uniqueErrors}`);
  lines.push('');
  lines.push('By error type:');
  for (const [type, traces] of Object.entries(aggregated.groups)) {
    lines.push(`  ${type}: ${traces.length}`);
  }
  lines.push('');
  lines.push('Most frequent (top 5):');
  for (const { stackTrace, count } of aggregated.occurrences.slice(0, 5)) {
    const frame = stackTrace.frames && stackTrace.frames[0];
    const loc = frame ? `${frame.file}:${frame.line}` : '(unknown)';
    lines.push(`  x${count}  ${loc}`);
  }
  return lines.join('\n');
}

module.exports = { groupByErrorType, countOccurrences, aggregateStackTraces, formatAggregation };
