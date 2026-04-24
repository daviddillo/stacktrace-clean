/**
 * Deduplicate and collapse repeated stack frames.
 */

/**
 * Create a unique key for a stack frame.
 * @param {object} frame
 * @returns {string}
 */
function frameKey(frame) {
  return `${frame.file || ''}:${frame.line || 0}:${frame.column || 0}:${frame.name || ''}`;
}

/**
 * Collapse consecutive duplicate frames into a single annotated frame.
 * @param {object[]} frames
 * @returns {object[]}
 */
function collapseRepeated(frames) {
  if (!frames || frames.length === 0) return [];

  const result = [];
  let i = 0;

  while (i < frames.length) {
    const current = frames[i];
    const key = frameKey(current);
    let count = 1;

    while (i + count < frames.length && frameKey(frames[i + count]) === key) {
      count++;
    }

    result.push(count > 1 ? { ...current, repeated: count } : current);
    i += count;
  }

  return result;
}

/**
 * Remove exact duplicate frames regardless of position.
 * @param {object[]} frames
 * @returns {object[]}
 */
function deduplicateFrames(frames) {
  if (!frames || frames.length === 0) return [];
  const seen = new Set();
  return frames.filter((frame) => {
    const key = frameKey(frame);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

module.exports = { frameKey, collapseRepeated, deduplicateFrames };
