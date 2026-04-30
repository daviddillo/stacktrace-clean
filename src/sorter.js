/**
 * sorter.js — Sort stack frames by various criteria
 */

const CATEGORY_ORDER = { user: 0, dependency: 1, node: 2, unknown: 3 };

/**
 * Compare two frames by file path alphabetically.
 */
function byFile(a, b) {
  const fa = a.file || '';
  const fb = b.file || '';
  return fa.localeCompare(fb);
}

/**
 * Compare two frames by line number ascending.
 */
function byLine(a, b) {
  return (a.line || 0) - (b.line || 0);
}

/**
 * Compare two frames by category priority (user > dependency > node > unknown).
 */
function byCategory(a, b) {
  const ca = CATEGORY_ORDER[a.category] ?? 99;
  const cb = CATEGORY_ORDER[b.category] ?? 99;
  return ca - cb;
}

/**
 * Compare two frames by function name alphabetically.
 */
function byName(a, b) {
  const na = a.name || '';
  const nb = b.name || '';
  return na.localeCompare(nb);
}

const SORT_STRATEGIES = { file: byFile, line: byLine, category: byCategory, name: byName };

/**
 * Sort an array of frames using the given strategy key.
 * Preserves original order for equal elements (stable sort).
 * @param {object[]} frames
 * @param {'file'|'line'|'category'|'name'} strategy
 * @param {boolean} [descending=false]
 * @returns {object[]}
 */
function sortFrames(frames, strategy = 'category', descending = false) {
  const compareFn = SORT_STRATEGIES[strategy];
  if (!compareFn) {
    throw new Error(`Unknown sort strategy: "${strategy}". Valid options: ${Object.keys(SORT_STRATEGIES).join(', ')}`);
  }
  const indexed = frames.map((frame, i) => ({ frame, i }));
  indexed.sort((a, b) => {
    const cmp = compareFn(a.frame, b.frame);
    return descending ? -cmp || a.i - b.i : cmp || a.i - b.i;
  });
  return indexed.map(({ frame }) => frame);
}

/**
 * List available sort strategy names.
 * @returns {string[]}
 */
function listStrategies() {
  return Object.keys(SORT_STRATEGIES);
}

module.exports = { sortFrames, listStrategies, byFile, byLine, byCategory, byName };
