/**
 * Filter stack frames based on configuration rules.
 */

/**
 * Check if a frame path matches any of the given patterns.
 * @param {string} filepath
 * @param {string[]} patterns
 * @returns {boolean}
 */
function matchesPattern(filepath, patterns) {
  if (!filepath || !patterns || patterns.length === 0) return false;
  return patterns.some((pattern) => {
    if (pattern.startsWith('/') && pattern.endsWith('/')) {
      const regex = new RegExp(pattern.slice(1, -1));
      return regex.test(filepath);
    }
    return filepath.includes(pattern);
  });
}

/**
 * Determine if a frame should be excluded.
 * @param {object} frame
 * @param {object} options
 * @param {string[]} [options.exclude] - patterns to exclude
 * @param {string[]} [options.include] - patterns to always include
 * @param {boolean} [options.hideNodeModules]
 * @param {boolean} [options.hideInternal]
 * @returns {boolean}
 */
function shouldExclude(frame, options = {}) {
  const { exclude = [], include = [], hideNodeModules = false, hideInternal = false } = options;
  const filepath = frame.file || '';

  if (matchesPattern(filepath, include)) return false;

  if (hideInternal && frame.isInternal) return true;
  if (hideNodeModules && filepath.includes('node_modules')) return true;
  if (matchesPattern(filepath, exclude)) return true;

  return false;
}

/**
 * Filter an array of parsed frames.
 * @param {object[]} frames
 * @param {object} options
 * @returns {object[]}
 */
function filterFrames(frames, options = {}) {
  return frames.filter((frame) => !shouldExclude(frame, options));
}

module.exports = { matchesPattern, shouldExclude, filterFrames };
