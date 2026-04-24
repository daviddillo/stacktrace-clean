const { frameKey, collapseRepeated, deduplicateFrames } = require('./deduplicator');

const makeFrame = (file, line = 1, column = 0, name = '') => ({ file, line, column, name });

describe('frameKey', () => {
  it('produces a consistent key from frame fields', () => {
    const frame = makeFrame('/app/src/index.js', 10, 5, 'myFunc');
    expect(frameKey(frame)).toBe('/app/src/index.js:10:5:myFunc');
  });

  it('handles missing fields gracefully', () => {
    expect(frameKey({})).toBe(':0:0:');
  });
});

describe('collapseRepeated', () => {
  it('returns empty array for empty input', () => {
    expect(collapseRepeated([])).toEqual([]);
  });

  it('does not modify non-repeating frames', () => {
    const frames = [
      makeFrame('/app/a.js', 1),
      makeFrame('/app/b.js', 2),
    ];
    const result = collapseRepeated(frames);
    expect(result).toHaveLength(2);
    expect(result[0].repeated).toBeUndefined();
  });

  it('collapses consecutive duplicate frames', () => {
    const frame = makeFrame('/app/a.js', 5);
    const frames = [frame, { ...frame }, { ...frame }, makeFrame('/app/b.js', 1)];
    const result = collapseRepeated(frames);
    expect(result).toHaveLength(2);
    expect(result[0].repeated).toBe(3);
    expect(result[1].repeated).toBeUndefined();
  });

  it('does not collapse non-consecutive duplicates', () => {
    const a = makeFrame('/app/a.js', 1);
    const b = makeFrame('/app/b.js', 2);
    const frames = [a, b, { ...a }];
    const result = collapseRepeated(frames);
    expect(result).toHaveLength(3);
  });
});

describe('deduplicateFrames', () => {
  it('returns empty array for empty input', () => {
    expect(deduplicateFrames([])).toEqual([]);
  });

  it('removes duplicate frames keeping first occurrence', () => {
    const a = makeFrame('/app/a.js', 1);
    const b = makeFrame('/app/b.js', 2);
    const frames = [a, b, { ...a }, { ...b }];
    const result = deduplicateFrames(frames);
    expect(result).toHaveLength(2);
    expect(result[0].file).toBe('/app/a.js');
    expect(result[1].file).toBe('/app/b.js');
  });

  it('keeps all frames when none are duplicates', () => {
    const frames = [makeFrame('/a.js', 1), makeFrame('/b.js', 2), makeFrame('/c.js', 3)];
    expect(deduplicateFrames(frames)).toHaveLength(3);
  });
});
