'use strict';

const {
  normalizeLineEndings,
  stripTrailingWhitespace,
  collapseBlankLines,
  normalizePaths,
  removeNullBytes,
  normalizeStackTrace,
} = require('./normalizer');

describe('normalizeLineEndings', () => {
  it('converts CRLF to LF', () => {
    expect(normalizeLineEndings('foo\r\nbar\r\nbaz')).toBe('foo\nbar\nbaz');
  });

  it('leaves LF-only input unchanged', () => {
    expect(normalizeLineEndings('foo\nbar')).toBe('foo\nbar');
  });
});

describe('stripTrailingWhitespace', () => {
  it('removes trailing spaces from each line', () => {
    expect(stripTrailingWhitespace('foo   \nbar\t\nbaz')).toBe('foo\nbar\nbaz');
  });

  it('does not affect leading whitespace', () => {
    expect(stripTrailingWhitespace('  at foo')).toBe('  at foo');
  });
});

describe('collapseBlankLines', () => {
  it('collapses 3+ blank lines to 2', () => {
    const input = 'a\n\n\n\nb';
    expect(collapseBlankLines(input)).toBe('a\n\nb');
  });

  it('leaves double newlines intact', () => {
    expect(collapseBlankLines('a\n\nb')).toBe('a\n\nb');
  });
});

describe('normalizePaths', () => {
  it('converts Windows backslash paths to forward slashes', () => {
    const input = 'at Object.<anonymous> (C:\\Users\\dev\\app.js:10:5)';
    expect(normalizePaths(input)).toBe('at Object.<anonymous> (C:/Users/dev/app.js:10:5)');
  });

  it('leaves non-Windows paths unchanged', () => {
    const input = 'at Object.<anonymous> (/home/dev/app.js:10:5)';
    expect(normalizePaths(input)).toBe(input);
  });
});

describe('removeNullBytes', () => {
  it('strips null bytes from the string', () => {
    expect(removeNullBytes('foo\0bar\0baz')).toBe('foobarbaz');
  });
});

describe('normalizeStackTrace', () => {
  it('applies all transformations', () => {
    const input = 'Error: boom\r\n  at foo (C:\\app.js:1:1)   \r\n\n\n\n  at bar (/lib.js:2:2)';
    const result = normalizeStackTrace(input);
    expect(result).not.toContain('\r');
    expect(result).not.toMatch(/[ \t]$/);
    expect(result).toContain('C:/app.js');
  });

  it('trims surrounding whitespace', () => {
    expect(normalizeStackTrace('  Error: x\n  at f  ')).toBe('Error: x\n  at f');
  });

  it('throws on non-string input', () => {
    expect(() => normalizeStackTrace(null)).toThrow(TypeError);
    expect(() => normalizeStackTrace(42)).toThrow(TypeError);
  });
});
