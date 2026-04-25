/**
 * stats.js — collects and reports statistics about a processed stack trace
 */

/**
 * Count frames by category (internal, external, app)
 * @param {object[]} groups - grouped frames from grouper
 * @returns {object} counts per category
 */
function countByCategory(groups) {
  const counts = { internal: 0, external: 0, app: 0 };
  for (const group of groups) {
    const key = group.type in counts ? group.type : 'app';
    counts[key] += group.frames.length;
  }
  return counts;
}

/**
 * Count how many frames have source map resolution
 * @param {object[]} frames
 * @returns {number}
 */
function countResolved(frames) {
  return frames.filter(f => f.resolved === true).length;
}

/**
 * Build a stats object for a processed stack trace
 * @param {object} options
 * @param {object[]} options.frames - all frames after pipeline
 * @param {object[]} options.groups - grouped frames
 * @param {number} options.originalCount - frame count before filtering/truncating
 * @returns {object}
 */
function buildStats({ frames, groups, originalCount }) {
  const total = frames.length;
  const resolved = countResolved(frames);
  const omitted = originalCount - total;
  const byCategory = countByCategory(groups);

  return {
    total,
    originalCount,
    omitted: omitted > 0 ? omitted : 0,
    resolved,
    unresolved: total - resolved,
    byCategory,
  };
}

/**
 * Format stats as a human-readable summary line
 * @param {object} stats
 * @returns {string}
 */
function formatStats(stats) {
  const parts = [
    `${stats.total} frame${stats.total !== 1 ? 's' : ''}`,
  ];
  if (stats.omitted > 0) {
    parts.push(`${stats.omitted} omitted`);
  }
  if (stats.resolved > 0) {
    parts.push(`${stats.resolved} source-mapped`);
  }
  const { byCategory } = stats;
  const catParts = [];
  if (byCategory.app > 0) catParts.push(`${byCategory.app} app`);
  if (byCategory.external > 0) catParts.push(`${byCategory.external} external`);
  if (byCategory.internal > 0) catParts.push(`${byCategory.internal} internal`);
  if (catParts.length) parts.push(`(${catParts.join(', ')})`);
  return parts.join(' · ');
}

module.exports = { countByCategory, countResolved, buildStats, formatStats };
