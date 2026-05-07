const {
  highlightHeaderWithTheme,
  highlightFrameWithTheme,
  highlightStackTraceWithTheme,
} = require('./highlighter-theme');

const frame = (overrides = {}) => ({
  name: 'myFunction',
  file: '/app/src/index.js',
  line: 10,
  column: 5,
  internal: false,
  ...overrides,
});

describe('highlightHeaderWithTheme', () => {
  it('returns a non-empty string for a valid header', () => {
    const result = highlightHeaderWithTheme('TypeError: something went wrong', 'default');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('handles header with no colon gracefully', () => {
    const result = highlightHeaderWithTheme('Error', 'default');
    expect(result).toContain('Error');
  });

  it('works with unknown theme name without throwing', () => {
    expect(() => highlightHeaderWithTheme('RangeError: out of range', 'nonexistent')).not.toThrow();
  });
});

describe('highlightFrameWithTheme', () => {
  it('includes the function name', () => {
    const result = highlightFrameWithTheme(frame(), 'default');
    expect(result).toContain('myFunction');
  });

  it('includes the file location', () => {
    const result = highlightFrameWithTheme(frame(), 'default');
    expect(result).toContain('/app/src/index.js');
    expect(result).toContain('10');
  });

  it('uses anonymous label when name is missing', () => {
    const result = highlightFrameWithTheme(frame({ name: null }), 'default');
    expect(result).toContain('anonymous');
  });

  it('omits location when file is missing', () => {
    const result = highlightFrameWithTheme(frame({ file: null }), 'default');
    expect(result).not.toContain('undefined');
  });
});

describe('highlightStackTraceWithTheme', () => {
  const trace = {
    header: 'TypeError: bad input',
    frames: [frame(), frame({ name: 'otherFn', line: 20 })],
  };

  it('includes the header in output', () => {
    const result = highlightStackTraceWithTheme(trace, 'default');
    expect(result).toContain('TypeError');
  });

  it('includes all frames', () => {
    const result = highlightStackTraceWithTheme(trace, 'default');
    expect(result).toContain('myFunction');
    expect(result).toContain('otherFn');
  });

  it('handles empty frames array', () => {
    const result = highlightStackTraceWithTheme({ header: 'Error', frames: [] }, 'default');
    expect(result).toContain('Error');
  });

  it('handles missing header', () => {
    const result = highlightStackTraceWithTheme({ frames: [frame()] }, 'default');
    expect(result).toContain('myFunction');
  });
});
