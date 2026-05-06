/**
 * indexer.js — builds a searchable index of frames by various keys
 */

/**
 * Build a map from file path to list of frames
 * @param {object[]} frames
 * @returns {Map<string, object[]>}
 */
function indexByFile(frames) {
  const map = new Map();
  for (const frame of frames) {
    const key = frame.file || '<unknown>';
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(frame);
  }
  return map;
}

/**
 * Build a map from function name to list of frames
 * @param {object[]} frames
 * @returns {Map<string, object[]>}
 */
function indexByName(frames) {
  const map = new Map();
  for (const frame of frames) {
    const key = frame.name || '<anonymous>';
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(frame);
  }
  return map;
}

/**
 * Build a composite index keyed by "file:line"
 * @param {object[]} frames
 * @returns {Map<string, object[]>}
 */
function indexByLocation(frames) {
  const map = new Map();
  for (const frame of frames) {
    const key = `${frame.file || '<unknown>'}:${frame.line ?? '?'}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(frame);
  }
  return map;
}

/**
 * Build a full index object with all three indexes
 * @param {object[]} frames
 * @returns {{ byFile: Map, byName: Map, byLocation: Map }}
 */
function buildIndex(frames) {
  return {
    byFile: indexByFile(frames),
    byName: indexByName(frames),
    byLocation: indexByLocation(frames),
  };
}

/**
 * Look up frames matching a query against a built index
 * @param {{ byFile: Map, byName: Map, byLocation: Map }} index
 * @param {'file'|'name'|'location'} field
 * @param {string} key
 * @returns {object[]}
 */
function lookup(index, field, key) {
  const map = field === 'file' ? index.byFile
    : field === 'name' ? index.byName
    : index.byLocation;
  return map.get(key) ?? [];
}

module.exports = { indexByFile, indexByName, indexByLocation, buildIndex, lookup };
