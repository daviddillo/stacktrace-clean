const { buildHeader, buildFrameBlock, generateReport } = require('./reporter');

describe('buildHeader', () => {
  test('returns type and message when both provided', () => {
    expect(buildHeader('TypeError', 'cannot read property')).toBe(
      'TypeError: cannot read property'
    );
  });

  test('returns only type when message is absent', () => {
    expect(buildHeader('RangeError', '')).toBe('RangeError');
  });

  test('defaults to Error when type is falsy', () => {
    expect(buildHeader(null, 'oops')).toBe('Error: oops');
  });
});

describe('buildFrameBlock', () => {
  const frames = [
    { name: 'foo', file: 'src/foo.js', line: 10, column: 5 },
    { name: 'bar', file: 'src/bar.js', line: 20, column: 1 },
    { name: null, file: null, line: null, column: null },
  ];

  test('formats frames with default indent', () => {
    const result = buildFrameBlock(frames);
    expect(result).toContain('  at foo (src/foo.js:10:5)');
    expect(result).toContain('  at bar (src/bar.js:20:1)');
    expect(result).toContain('  at <anonymous> (<unknown>)');
  });

  test('respects maxFrames option', () => {
    const result = buildFrameBlock(frames, { maxFrames: 1 });
    const lines = result.split('\n');
    expect(lines).toHaveLength(1);
  });

  test('uses custom indent', () => {
    const result = buildFrameBlock([frames[0]], { indent: '    ' });
    expect(result).toMatch(/^    at /);
  });
});

describe('generateReport', () => {
  const header = { errorType: 'TypeError', message: 'bad input' };
  const frames = [
    { name: 'main', file: 'index.js', line: 1, column: 1 },
  ];

  test('includes header line', () => {
    const report = generateReport({ header, frames });
    expect(report).toContain('TypeError: bad input');
  });

  test('includes frame block', () => {
    const report = generateReport({ header, frames });
    expect(report).toContain('at main (index.js:1:1)');
  });

  test('handles empty frames gracefully', () => {
    const report = generateReport({ header, frames: [] });
    expect(report).toBe('TypeError: bad input');
  });

  test('includes summary when provided', () => {
    const summary = { totalFrames: 1, resolvedFrames: 1, internalFrames: 0 };
    const report = generateReport({ header, frames, summary });
    expect(report).toContain('Summary:');
  });
});
