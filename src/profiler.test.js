const profiler = require('./profiler');

beforeEach(() => {
  profiler.reset();
});

describe('start / stop', () => {
  test('returns a positive elapsed time in ms', () => {
    profiler.start('parse');
    const ms = profiler.stop('parse');
    expect(ms).toBeGreaterThanOrEqual(0);
  });

  test('throws when stop called without matching start', () => {
    expect(() => profiler.stop('unknown')).toThrow(/no start mark/);
  });

  test('records multiple stages independently', () => {
    profiler.start('a');
    profiler.start('b');
    profiler.stop('a');
    profiler.stop('b');
    const names = profiler.results().map((r) => r.name);
    expect(names).toContain('a');
    expect(names).toContain('b');
  });
});

describe('results', () => {
  test('returns entries sorted by descending ms', () => {
    profiler.start('fast');
    profiler.stop('fast');
    profiler.start('slow');
    // simulate work
    const end = Date.now() + 5;
    while (Date.now() < end) {}
    profiler.stop('slow');
    const res = profiler.results();
    expect(res[0].ms).toBeGreaterThanOrEqual(res[1].ms);
  });
});

describe('report', () => {
  test('returns placeholder when no data', () => {
    expect(profiler.report()).toBe('No profiling data.');
  });

  test('contains stage name and ms in output', () => {
    profiler.start('resolve');
    profiler.stop('resolve');
    const out = profiler.report();
    expect(out).toContain('resolve');
    expect(out).toMatch(/\d+\.\d{3} ms/);
  });
});

describe('reset', () => {
  test('clears recorded durations', () => {
    profiler.start('x');
    profiler.stop('x');
    profiler.reset();
    expect(profiler.results()).toHaveLength(0);
  });
});
