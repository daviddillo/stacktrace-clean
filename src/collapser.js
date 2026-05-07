/**
 * collapser.js — collapse consecutive internal/node_modules frames into a summary line
 */

const { isInternal } = require('./formatter');

const DEFAULT_LABEL = 'node_modules';
const NODE_INTERNALS_LABEL = 'node internals';

/**
 * Classify a frame for collapsing purposes.
 * Returns 'node_modules', 'internals', or 'user'.
 */
function classifyForCollapse(frame) {
  if (!frame.file) return 'internals';
  if (isInternal(frame.file)) return 'internals';
  if (frame.file.includes('node_modules')) return 'node_modules';
  return 'user';
}

/**
 * Build a collapsed placeholder entry from a run of frames.
 */
function buildCollapsed(frames, category) {
  const label = category === 'internals' ? NODE_INTERNALS_LABEL : DEFAULT_LABEL;
  return {
    collapsed: true,
    count: frames.length,
    category,
    label: `... ${frames.length} frame${frames.length === 1 ? '' : 's'} from ${label}`,
    frames,
  };
}

/**
 * Collapse consecutive frames of the given categories into summary objects.
 * @param {object[]} frames - parsed stack frames
 * @param {object} options
 * @param {boolean} options.collapseNodeModules - collapse node_modules frames (default true)
 * @param {boolean} options.collapseInternals - collapse node internal frames (default true)
 * @param {number} options.minRun - minimum consecutive frames before collapsing (default 2)
 * @returns {Array} mixed array of frames and collapsed placeholders
 */
function collapseFrames(frames, options = {}) {
  const {
    collapseNodeModules = true,
    collapseInternals = true,
    minRun = 2,
  } = options;

  const shouldCollapse = (cat) =>
    (cat === 'node_modules' && collapseNodeModules) ||
    (cat === 'internals' && collapseInternals);

  const result = [];
  let run = [];
  let runCat = null;

  const flush = () => {
    if (run.length === 0) return;
    if (run.length >= minRun && shouldCollapse(runCat)) {
      result.push(buildCollapsed(run, runCat));
    } else {
      result.push(...run);
    }
    run = [];
    runCat = null;
  };

  for (const frame of frames) {
    const cat = classifyForCollapse(frame);
    if (cat !== 'user' && shouldCollapse(cat)) {
      if (cat !== runCat) {
        flush();
        runCat = cat;
      }
      run.push(frame);
    } else {
      flush();
      result.push(frame);
    }
  }

  flush();
  return result;
}

/**
 * Expand a collapsed entry back to its original frames.
 */
function expandCollapsed(entry) {
  return entry.collapsed ? entry.frames : [entry];
}

module.exports = { classifyForCollapse, collapseFrames, expandCollapsed, buildCollapsed };
