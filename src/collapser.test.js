const { classifyForCollapse, collapseFrames, expandCollapsed } = require('./collapser');

const userFrame = (name = 'myFn', file = '/home/user/project/src/app.js') => ({
  name,
  file,
  line: 10,
  column: 5,
});

const nmFrame = (name = 'dep') => ({
  name,
  file: '/home/user/project/node_modules/some-lib/index.js',
  line: 3,
  column: 1,
});

const internalFrame = (name = 'emit') => ({
  name,
  file: 'events.js',
  line: 200,
  column: 1,
});

describe('classifyForCollapse', () => {
  test('classifies user frame', () => {
    expect(classifyForCollapse(userFrame())).toBe('user');
  });

  test('classifies node_modules frame', () => {
    expect(classifyForCollapse(nmFrame())).toBe('node_modules');
  });

  test('classifies internal frame', () => {
    expect(classifyForCollapse(internalFrame())).toBe('internals');
  });

  test('classifies frame with no file as internals', () => {
    expect(classifyForCollapse({ name: 'anon' })).toBe('internals');
  });
});

describe('collapseFrames', () => {
  test('collapses a run of node_modules frames', () => {
    const frames = [userFrame(), nmFrame(), nmFrame(), nmFrame(), userFrame('end')];
    const result = collapseFrames(frames);
    expect(result).toHaveLength(3);
    expect(result[1].collapsed).toBe(true);
    expect(result[1].count).toBe(3);
    expect(result[1].label).toMatch(/3 frames from node_modules/);
  });

  test('does not collapse runs shorter than minRun', () => {
    const frames = [userFrame(), nmFrame(), userFrame('end')];
    const result = collapseFrames(frames, { minRun: 2 });
    expect(result).toHaveLength(3);
    expect(result[1].collapsed).toBeUndefined();
  });

  test('respects collapseNodeModules: false', () => {
    const frames = [nmFrame(), nmFrame(), nmFrame()];
    const result = collapseFrames(frames, { collapseNodeModules: false });
    expect(result).toHaveLength(3);
    expect(result.every((f) => !f.collapsed)).toBe(true);
  });

  test('collapses internals separately from node_modules', () => {
    const frames = [internalFrame(), internalFrame(), nmFrame(), nmFrame(), userFrame()];
    const result = collapseFrames(frames);
    expect(result).toHaveLength(3);
    expect(result[0].category).toBe('internals');
    expect(result[1].category).toBe('node_modules');
  });

  test('preserves user frames untouched', () => {
    const frames = [userFrame('a'), userFrame('b'), userFrame('c')];
    const result = collapseFrames(frames);
    expect(result).toHaveLength(3);
    expect(result.every((f) => !f.collapsed)).toBe(true);
  });
});

describe('expandCollapsed', () => {
  test('expands a collapsed entry back to original frames', () => {
    const originals = [nmFrame(), nmFrame()];
    const collapsed = { collapsed: true, count: 2, frames: originals, label: '...' };
    expect(expandCollapsed(collapsed)).toEqual(originals);
  });

  test('returns plain frame as-is', () => {
    const frame = userFrame();
    expect(expandCollapsed(frame)).toEqual([frame]);
  });
});
