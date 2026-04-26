'use strict';

const { diffFrames, diffSummary, compareStackTraces } = require('./differ');

const frameA = { file: 'app.js', line: 10, column: 5, name: 'doThing' };
const frameB = { file: 'app.js', line: 20, column: 3, name: 'doOther' };
const frameC = { file: 'lib.js', line: 1, column: 1, name: 'helper' };

describe('diffFrames', () => {
  test('identical frame lists produce all same', () => {
    const diff = diffFrames([frameA, frameC], [frameA, frameC]);
    expect(diff).toHaveLength(2);
    expect(diff.every(d => d.type === 'same')).toBe(true);
  });

  test('added frames are detected', () => {
    const diff = diffFrames([frameA], [frameA, frameB]);
    const types = diff.map(d => d.type);
    expect(types).toContain('added');
    expect(diff.find(d => d.type === 'added').frame).toEqual(frameB);
  });

  test('removed frames are detected', () => {
    const diff = diffFrames([frameA, frameB], [frameA]);
    const types = diff.map(d => d.type);
    expect(types).toContain('removed');
    expect(diff.find(d => d.type === 'removed').frame).toEqual(frameB);
  });

  test('completely different lists mark all as removed then added', () => {
    const diff = diffFrames([frameA], [frameB]);
    const types = diff.map(d => d.type);
    expect(types).toContain('removed');
    expect(types).toContain('added');
  });

  test('empty inputs return empty diff', () => {
    expect(diffFrames([], [])).toEqual([]);
  });
});

describe('diffSummary', () => {
  test('counts entries by type', () => {
    const diff = [
      { type: 'same', frame: frameA },
      { type: 'added', frame: frameB },
      { type: 'removed', frame: frameC },
      { type: 'added', frame: frameC },
    ];
    const summary = diffSummary(diff);
    expect(summary).toEqual({ same: 1, added: 2, removed: 1 });
  });
});

describe('compareStackTraces', () => {
  test('detects header change', () => {
    const a = { header: 'Error: foo', frames: [] };
    const b = { header: 'Error: bar', frames: [] };
    const result = compareStackTraces(a, b);
    expect(result.headerChanged).toBe(true);
  });

  test('no header change when same', () => {
    const a = { header: 'Error: foo', frames: [frameA] };
    const b = { header: 'Error: foo', frames: [frameA] };
    const result = compareStackTraces(a, b);
    expect(result.headerChanged).toBe(false);
    expect(result.summary.same).toBe(1);
  });

  test('returns diff and summary', () => {
    const a = { header: 'Error: x', frames: [frameA] };
    const b = { header: 'Error: x', frames: [frameA, frameB] };
    const { diff, summary } = compareStackTraces(a, b);
    expect(diff).toBeDefined();
    expect(summary.added).toBe(1);
  });
});
