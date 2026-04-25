const { countByCategory, countResolved, buildStats, formatStats } = require('./stats');

const makeFrame = (type, resolved = false) => ({ type, resolved });

const makeGroup = (type, count) => ({
  type,
  frames: Array.from({ length: count }, () => makeFrame(type)),
});

describe('countByCategory', () => {
  it('counts frames by group type', () => {
    const groups = [makeGroup('app', 3), makeGroup('external', 2), makeGroup('internal', 1)];
    expect(countByCategory(groups)).toEqual({ app: 3, external: 2, internal: 1 });
  });

  it('defaults unknown types to app', () => {
    const groups = [{ type: 'unknown', frames: [makeFrame('unknown'), makeFrame('unknown')] }];
    expect(countByCategory(groups)).toEqual({ app: 2, external: 0, internal: 0 });
  });

  it('returns zeroes for empty groups', () => {
    expect(countByCategory([])).toEqual({ app: 0, external: 0, internal: 0 });
  });
});

describe('countResolved', () => {
  it('counts frames where resolved is true', () => {
    const frames = [makeFrame('app', true), makeFrame('app', false), makeFrame('external', true)];
    expect(countResolved(frames)).toBe(2);
  });

  it('returns 0 when none resolved', () => {
    expect(countResolved([makeFrame('app', false)])).toBe(0);
  });
});

describe('buildStats', () => {
  it('builds correct stats object', () => {
    const frames = [makeFrame('app', true), makeFrame('external', false)];
    const groups = [makeGroup('app', 1), makeGroup('external', 1)];
    const stats = buildStats({ frames, groups, originalCount: 5 });
    expect(stats.total).toBe(2);
    expect(stats.omitted).toBe(3);
    expect(stats.resolved).toBe(1);
    expect(stats.unresolved).toBe(1);
    expect(stats.byCategory.app).toBe(1);
  });

  it('omitted is 0 when originalCount equals total', () => {
    const frames = [makeFrame('app')];
    const groups = [makeGroup('app', 1)];
    const stats = buildStats({ frames, groups, originalCount: 1 });
    expect(stats.omitted).toBe(0);
  });
});

describe('formatStats', () => {
  it('formats a basic stats line', () => {
    const stats = buildStats({
      frames: [makeFrame('app', true), makeFrame('external', false)],
      groups: [makeGroup('app', 1), makeGroup('external', 1)],
      originalCount: 2,
    });
    const result = formatStats(stats);
    expect(result).toContain('2 frames');
    expect(result).toContain('1 source-mapped');
    expect(result).toContain('1 app');
  });

  it('uses singular frame when total is 1', () => {
    const stats = buildStats({
      frames: [makeFrame('app')],
      groups: [makeGroup('app', 1)],
      originalCount: 1,
    });
    expect(formatStats(stats)).toMatch(/^1 frame/);
  });

  it('includes omitted count when > 0', () => {
    const stats = buildStats({
      frames: [makeFrame('app')],
      groups: [makeGroup('app', 1)],
      originalCount: 4,
    });
    expect(formatStats(stats)).toContain('3 omitted');
  });
});
