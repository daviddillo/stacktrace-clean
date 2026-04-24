import { describe, it, expect, vi } from 'vitest';
import chalk from 'chalk';
import { highlightErrorHeader, highlightFrame, highlightStackTrace } from './highlighter.js';

// Disable chalk colors for predictable test output
chalk.level = 0;

describe('highlightErrorHeader', () => {
  it('highlights a standard error header', () => {
    const result = highlightErrorHeader('TypeError: Cannot read properties of undefined');
    expect(result).toContain('TypeError');
    expect(result).toContain('Cannot read properties of undefined');
  });

  it('handles a line that does not match error pattern', () => {
    const result = highlightErrorHeader('some random line');
    expect(result).toBe('some random line');
  });

  it('handles Error without subtype', () => {
    const result = highlightErrorHeader('Error: something went wrong');
    expect(result).toContain('Error');
    expect(result).toContain('something went wrong');
  });
});

describe('highlightFrame', () => {
  it('formats a frame with file, line, and column', () => {
    const frame = { name: 'myFunction', file: '/app/src/index.js', line: 42, column: 10 };
    const result = highlightFrame(frame, false);
    expect(result).toContain('myFunction');
    expect(result).toContain('/app/src/index.js');
    expect(result).toContain('42');
    expect(result).toContain('10');
  });

  it('formats a frame without a function name', () => {
    const frame = { name: null, file: '/app/src/index.js', line: 5, column: 1 };
    const result = highlightFrame(frame, false);
    expect(result).toContain('/app/src/index.js');
    expect(result).not.toContain('null');
  });

  it('formats an anonymous frame with no file', () => {
    const frame = { name: 'anonymous', file: null, line: null, column: null };
    const result = highlightFrame(frame, false);
    expect(result).toContain('<anonymous>');
  });

  it('applies internal frame styling when isInternalFrame is true', () => {
    const frame = { name: 'internalFn', file: 'node:internal/modules', line: 1, column: 1 };
    const result = highlightFrame(frame, true);
    expect(result).toContain('internalFn');
    expect(result).toContain('node:internal/modules');
  });
});

describe('highlightStackTrace', () => {
  it('highlights the first line as error header', () => {
    const lines = [
      'TypeError: bad value',
      '    at doSomething (/app/index.js:10:5)',
    ];
    const result = highlightStackTrace(lines);
    expect(result).toContain('TypeError');
    expect(result).toContain('at doSomething');
  });

  it('uses isInternalFn to classify frames', () => {
    const lines = [
      'Error: oops',
      '    at internal (node:internal/process:1:1)',
      '    at userCode (/app/src/main.js:20:3)',
    ];
    const isInternalFn = (line) => line.includes('node:internal');
    const result = highlightStackTrace(lines, isInternalFn);
    expect(result).toContain('internal');
    expect(result).toContain('userCode');
  });
});
