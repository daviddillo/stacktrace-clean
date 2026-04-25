/**
 * reporter.js
 * Generates human-readable reports from processed stack trace data.
 */

const { formatStats } = require('./stats');
const { formatSummary } = require('./summarizer');

/**
 * Build a compact one-line report header.
 * @param {string} errorType
 * @param {string} message
 * @returns {string}
 */
function buildHeader(errorType, message) {
  const type = errorType || 'Error';
  const msg = message ? `: ${message}` : '';
  return `${type}${msg}`;
}

/**
 * Format a list of frames into a readable block.
 * @param {object[]} frames
 * @param {object} options
 * @returns {string}
 */
function buildFrameBlock(frames, options = {}) {
  const { maxFrames = Infinity, indent = '  ' } = options;
  return frames
    .slice(0, maxFrames)
    .map((f) => {
      const loc = f.file ? `${f.file}:${f.line || 0}:${f.column || 0}` : '<unknown>';
      const name = f.name || '<anonymous>';
      return `${indent}at ${name} (${loc})`;
    })
    .join('\n');
}

/**
 * Generate a full plain-text report for a processed stack trace.
 * @param {object} data  - { header, frames, groups, stats, summary }
 * @param {object} options
 * @returns {string}
 */
function generateReport(data, options = {}) {
  const { header, frames = [], stats, summary } = data;
  const lines = [];

  if (header) {
    lines.push(buildHeader(header.errorType, header.message));
    lines.push('');
  }

  if (frames.length > 0) {
    lines.push(buildFrameBlock(frames, options));
    lines.push('');
  }

  if (summary) {
    lines.push('Summary:');
    lines.push(formatSummary(summary));
    lines.push('');
  }

  if (stats) {
    lines.push('Stats:');
    lines.push(formatStats(stats));
  }

  return lines.join('\n').trimEnd();
}

module.exports = { buildHeader, buildFrameBlock, generateReport };
