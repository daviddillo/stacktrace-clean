'use strict';

const { classifyScope, scopeFrames, filterByScope, groupByScope, scopeSummary } = require('./scoper');

const frames = [
  { name: 'readFile', file: '/home/user/app/index.js', line: 10, col: 5 },
  { name: 'processTicksAndRejections', file: 'node:internal/process/task_queues', line: 95, col: 5 },
  { name: '<anonymous>', file: '/home/user/app/handler.js', line: 22, col: 3 },
  { name: 'Module._load', file: 'internal/modules/cjs/loader.js', line: 137, col: 12 },
  { name: 'async fetchData', file: '/home/user/app/api.js', line: 44, col: 7 },
  { name: 'connect', file: '/home/user/app/node_modules/pg/lib/client.js', line: 55, col: 9 },
  { name: 'nativeMethod', file: '(native)', line: 0, col: 0 },
];

describe('classifyScope', () => {
  test('classifies user frame', () => {
    expect(classifyScope(frames[0])).toBe('user');
  });

  test('classifies internal async frame', () => {
    expect(classifyScope(frames[1])).toBe('internal');
  });

  test('classifies anonymous frame', () => {
    expect(classifyScope(frames[2])).toBe('anonymous');
  });

  test('classifies node internal frame', () => {
    expect(classifyScope(frames[3])).toBe('internal');
  });

  test('classifies async frame', () => {
    expect(classifyScope(frames[4])).toBe('async');
  });

  test('classifies module frame', () => {
    expect(classifyScope(frames[5])).toBe('module');
  });

  test('classifies native frame', () => {
    expect(classifyScope(frames[6])).toBe('native');
  });
});

describe('scopeFrames', () => {
  test('annotates all frames with scope', () => {
    const result = scopeFrames(frames);
    expect(result).toHaveLength(frames.length);
    result.forEach(f => expect(f).toHaveProperty('scope'));
  });

  test('does not mutate original frames', () => {
    scopeFrames(frames);
    expect(frames[0]).not.toHaveProperty('scope');
  });
});

describe('filterByScope', () => {
  test('returns only user frames', () => {
    const result = filterByScope(frames, 'user');
    expect(result.every(f => f.scope === 'user')).toBe(true);
  });

  test('returns empty array for unknown scope', () => {
    expect(filterByScope(frames, 'unknown')).toEqual([]);
  });
});

describe('groupByScope', () => {
  test('groups frames by scope key', () => {
    const groups = groupByScope(frames);
    expect(groups).toHaveProperty('user');
    expect(groups).toHaveProperty('internal');
    expect(groups).toHaveProperty('module');
  });
});

describe('scopeSummary', () => {
  test('returns counts per scope', () => {
    const summary = scopeSummary(frames);
    expect(typeof summary.user).toBe('number');
    expect(summary.internal).toBeGreaterThanOrEqual(1);
  });

  test('total equals number of frames', () => {
    const summary = scopeSummary(frames);
    const total = Object.values(summary).reduce((a, b) => a + b, 0);
    expect(total).toBe(frames.length);
  });
});
