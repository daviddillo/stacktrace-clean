'use strict';

const { parseHeader, summarizeStackTrace, formatSummary } = require('./summarizer');

describe('parseHeader', () => {
  test('parses standard error header', () => {
    const result = parseHeader('TypeError: Cannot read property \'x\' of undefined');
    expect(result.type).toBe('TypeError');
    expect(result.message).toBe("Cannot read property 'x' of undefined");
  });

  test('parses header with no message', () => {
    const result = parseHeader('RangeError:');
    expect(result.type).toBe('RangeError');
    expect(result.message).toBe('');
  });

  test('falls back gracefully for unrecognised header', () => {
    const result = parseHeader('something went wrong');
    expect(result.type).toBe('Error');
    expect(result.message).toBe('something went wrong');
  });
});

describe('summarizeStackTrace', () => {
  const frames = [
    { name: 'doWork', file: '/app/src/worker.js', line: 12, column: 5, internal: false },
    { name: 'runTask', file: '/app/src/runner.js', line: 34, column: 3, internal: false },
    { name: 'Module._compile', file: 'internal/modules/cjs/loader.js', line: 999, column: 1, internal: true },
    { name: 'Object.<anonymous>', file: '/app/index.js', line: 7, column: 1, internal: false },
  ];

  const stackTrace = {
    header: 'Error: something broke',
    frames,
  };

  test('counts frames correctly', () => {
    const s = summarizeStackTrace(stackTrace);
    expect(s.totalFrames).toBe(4);
    expect(s.userFrames).toBe(3);
    expect(s.internalFrames).toBe(1);
  });

  test('extracts error type and message', () => {
    const s = summarizeStackTrace(stackTrace);
    expect(s.type).toBe('Error');
    expect(s.message).toBe('something broke');
  });

  test('returns top 3 frames by default', () => {
    const s = summarizeStackTrace(stackTrace);
    expect(s.topFrames).toHaveLength(3);
    expect(s.topFrames[0].name).toBe('doWork');
  });

  test('respects topFrames option', () => {
    const s = summarizeStackTrace(stackTrace, { topFrames: 2 });
    expect(s.topFrames).toHaveLength(2);
  });

  test('handles empty frames array', () => {
    const s = summarizeStackTrace({ header: 'Error: oops', frames: [] });
    expect(s.totalFrames).toBe(0);
    expect(s.topFrames).toHaveLength(0);
  });
});

describe('formatSummary', () => {
  test('produces a multi-line string', () => {
    const summary = {
      type: 'TypeError',
      message: 'bad input',
      totalFrames: 2,
      userFrames: 1,
      internalFrames: 1,
      topFrames: [
        { name: 'fn', file: '/app/a.js', line: 10, column: 4, internal: false },
        { name: 'internal', file: 'node:internal', line: 1, column: null, internal: true },
      ],
    };
    const out = formatSummary(summary);
    expect(out).toContain('TypeError');
    expect(out).toContain('bad input');
    expect(out).toContain('2 total');
    expect(out).toContain('[internal]');
    expect(out).toContain('/app/a.js:10:4');
  });

  test('shows (none) when message is empty', () => {
    const summary = {
      type: 'Error', message: '', totalFrames: 0,
      userFrames: 0, internalFrames: 0, topFrames: [],
    };
    expect(formatSummary(summary)).toContain('(none)');
  });
});
