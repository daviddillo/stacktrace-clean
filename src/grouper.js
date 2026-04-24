/**
 * Groups stack frames by origin: app, node_modules, or node internals.
 */

const path = require('path');

const GROUP_APP = 'app';
const GROUP_NODE_MODULES = 'node_modules';
const GROUP_INTERNAL = 'internal';

/**
 * Determine which group a frame belongs to.
 * @param {object} frame
 * @returns {string}
 */
function classifyFrame(frame) {
  if (!frame.file) return GROUP_INTERNAL;

  if (
    frame.file.startsWith('node:') ||
    frame.file.startsWith('internal/') ||
    !path.isAbsolute(frame.file)
  ) {
    return GROUP_INTERNAL;
  }

  if (frame.file.includes(`${path.sep}node_modules${path.sep}`)) {
    return GROUP_NODE_MODULES;
  }

  return GROUP_APP;
}

/**
 * Group consecutive frames that share the same classification.
 * @param {object[]} frames
 * @returns {{ group: string, frames: object[] }[]}
 */
function groupFrames(frames) {
  if (!frames || frames.length === 0) return [];

  const groups = [];
  let current = null;

  for (const frame of frames) {
    const group = classifyFrame(frame);

    if (!current || current.group !== group) {
      current = { group, frames: [frame] };
      groups.push(current);
    } else {
      current.frames.push(frame);
    }
  }

  return groups;
}

/**
 * Flatten grouped frames back into a plain array.
 * @param {{ group: string, frames: object[] }[]} groups
 * @returns {object[]}
 */
function flattenGroups(groups) {
  return groups.flatMap((g) => g.frames);
}

module.exports = { GROUP_APP, GROUP_NODE_MODULES, GROUP_INTERNAL, classifyFrame, groupFrames, flattenGroups };
