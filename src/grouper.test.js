const { GROUP_APP, GROUP_NODE_MODULES, GROUP_INTERNAL, classifyFrame, groupFrames, flattenGroups } = require('./grouper');
const path = require('path');

const appFrame = (file = '/home/user/project/src/index.js') => ({ file, line: 1, column: 1, name: 'fn' });
const nmFrame = (file = `/home/user/project/node_modules/express/index.js`) => ({ file, line: 5, column: 1, name: 'fn' });
const internalFrame = (file = 'node:internal/modules/cjs/loader') => ({ file, line: 2, column: 1, name: 'fn' });
const noFileFrame = () => ({ file: null, line: null, column: null, name: 'fn' });

describe('classifyFrame', () => {
  test('classifies app frames', () => {
    expect(classifyFrame(appFrame())).toBe(GROUP_APP);
  });

  test('classifies node_modules frames', () => {
    expect(classifyFrame(nmFrame())).toBe(GROUP_NODE_MODULES);
  });

  test('classifies node: internal frames', () => {
    expect(classifyFrame(internalFrame())).toBe(GROUP_INTERNAL);
  });

  test('classifies frames with no file as internal', () => {
    expect(classifyFrame(noFileFrame())).toBe(GROUP_INTERNAL);
  });

  test('classifies relative paths as internal', () => {
    expect(classifyFrame({ file: 'some/relative/path.js' })).toBe(GROUP_INTERNAL);
  });
});

describe('groupFrames', () => {
  test('returns empty array for empty input', () => {
    expect(groupFrames([])).toEqual([]);
  });

  test('returns empty array for null input', () => {
    expect(groupFrames(null)).toEqual([]);
  });

  test('groups consecutive frames of the same type', () => {
    const frames = [appFrame(), appFrame(), nmFrame(), internalFrame()];
    const groups = groupFrames(frames);
    expect(groups).toHaveLength(3);
    expect(groups[0].group).toBe(GROUP_APP);
    expect(groups[0].frames).toHaveLength(2);
    expect(groups[1].group).toBe(GROUP_NODE_MODULES);
    expect(groups[2].group).toBe(GROUP_INTERNAL);
  });

  test('starts a new group when type changes', () => {
    const frames = [appFrame(), nmFrame(), appFrame()];
    const groups = groupFrames(frames);
    expect(groups).toHaveLength(3);
  });
});

describe('flattenGroups', () => {
  test('flattens groups back to frames', () => {
    const frames = [appFrame(), nmFrame(), internalFrame()];
    const groups = groupFrames(frames);
    expect(flattenGroups(groups)).toEqual(frames);
  });

  test('handles empty groups array', () => {
    expect(flattenGroups([])).toEqual([]);
  });
});
