'use strict';

const { buildFrequencyMap, mergeTraces, intersectTraces } = require('./merger');

const frameA = { file: 'app.js', line: 10, column: 5, name: 'foo' };
const frameB = { file: 'app.js', line: 20, column: 3, name: 'bar' };
const frameC = { file: 'lib.js', line: 5,  column: 1, name: 'baz' };

describe('buildFrequencyMap', () => {
  it('counts frames across traces', () => {
    const map = buildFrequencyMap([[frameA, frameB], [frameA, frameC]]);
    expect(map.get(`${frameA.file}:${frameA.line}:${frameA.column}`).count).toBe(2);
    expect(map.get(`${frameB.file}:${frameB.line}:${frameB.column}`).count).toBe(1);
  });

  it('records which trace indices contain each frame', () => {
    const map = buildFrequencyMap([[frameA], [frameA, frameB]]);
    const key = `${frameA.file}:${frameA.line}:${frameA.column}`;
    expect(map.get(key).traceIndices).toEqual(new Set([0, 1]));
  });

  it('returns empty map for empty input', () => {
    expect(buildFrequencyMap([]).size).toBe(0);
  });
});

describe('mergeTraces', () => {
  it('returns empty array for empty input', () => {
    expect(mergeTraces([])).toEqual([]);
  });

  it('deduplicates frames appearing in multiple traces', () => {
    const result = mergeTraces([[frameA, frameB], [frameA, frameC]]);
    expect(result).toHaveLength(3);
  });

  it('preserves insertion order across traces', () => {
    const result = mergeTraces([[frameA, frameB], [frameC]]);
    expect(result[0].name).toBe('foo');
    expect(result[1].name).toBe('bar');
    expect(result[2].name).toBe('baz');
  });

  it('annotates shared frames with mergeCount and sharedBy', () => {
    const result = mergeTraces([[frameA], [frameA]]);
    expect(result[0].mergeCount).toBe(2);
    expect(result[0].sharedBy).toEqual([0, 1]);
  });

  it('handles a single trace without modification', () => {
    const result = mergeTraces([[frameA, frameB]]);
    expect(result).toHaveLength(2);
    expect(result[0].mergeCount).toBe(1);
  });
});

describe('intersectTraces', () => {
  it('returns only frames present in all traces', () => {
    const result = intersectTraces([[frameA, frameB], [frameA, frameC]]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('foo');
  });

  it('returns empty when no common frames', () => {
    const result = intersectTraces([[frameA], [frameB]]);
    expect(result).toHaveLength(0);
  });

  it('returns empty for empty input', () => {
    expect(intersectTraces([])).toEqual([]);
  });
});
