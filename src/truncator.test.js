const { truncateFrames, omittedSummary, truncateStackTrace } = require('./truncator');

describe('truncateFrames', () => {
  const frames = [
    { name: 'a', file: 'a.js', line: 1 },
    { name: 'b', file: 'b.js', line: 2 },
    { name: 'c', file: 'c.js', line: 3 },
    { name: 'd', file: 'd.js', line: 4 },
  ];

  it('returns all frames when count is within limit', () => {
    const result = truncateFrames(frames, 10);
    expect(result.frames).toHaveLength(4);
    expect(result.omitted).toBe(0);
  });

  it('truncates frames beyond maxFrames', () => {
    const result = truncateFrames(frames, 2);
    expect(result.frames).toHaveLength(2);
    expect(result.frames[0].name).toBe('a');
    expect(result.omitted).toBe(2);
  });

  it('keeps exactly maxFrames when equal', () => {
    const result = truncateFrames(frames, 4);
    expect(result.frames).toHaveLength(4);
    expect(result.omitted).toBe(0);
  });

  it('throws on non-array input', () => {
    expect(() => truncateFrames('nope', 5)).toThrow(TypeError);
  });

  it('throws when maxFrames is zero or negative', () => {
    expect(() => truncateFrames(frames, 0)).toThrow(RangeError);
    expect(() => truncateFrames(frames, -1)).toThrow(RangeError);
  });
});

describe('omittedSummary', () => {
  it('returns null for zero omitted', () => {
    expect(omittedSummary(0)).toBeNull();
  });

  it('uses singular for one omitted frame', () => {
    expect(omittedSummary(1)).toBe('    ... 1 more frame omitted');
  });

  it('uses plural for multiple omitted frames', () => {
    expect(omittedSummary(3)).toBe('    ... 3 more frames omitted');
  });
});

describe('truncateStackTrace', () => {
  const trace = [
    'Error: something went wrong',
    '    at foo (foo.js:1:1)',
    '    at bar (bar.js:2:1)',
    '    at baz (baz.js:3:1)',
  ].join('\n');

  it('returns original trace when within limit', () => {
    expect(truncateStackTrace(trace, 5)).toBe(trace);
  });

  it('truncates frame lines and appends summary', () => {
    const result = truncateStackTrace(trace, 2);
    expect(result).toContain('at foo');
    expect(result).toContain('at bar');
    expect(result).not.toContain('at baz');
    expect(result).toContain('... 1 more frame omitted');
  });

  it('throws on non-string input', () => {
    expect(() => truncateStackTrace(null, 5)).toThrow(TypeError);
  });
});
