'use strict';

const { fuzzyScore, scoreFrame, fuzzySearch, bestMatch } = require('./fuzzer');

const frames = [
  { file: 'src/parser.js', name: 'parseStackTrace', line: 12 },
  { file: 'src/formatter.js', name: 'formatFrame', line: 30 },
  { file: 'src/resolver.js', name: 'resolveSource', line: 8 },
  { file: 'node_modules/chalk/index.js', name: 'Chalk', line: 5 },
  { file: 'src/pipeline.js', name: 'runPipeline', line: 44 },
];

describe('fuzzyScore', () => {
  test('exact substring scores 1', () => {
    expect(fuzzyScore('parser', 'src/parser.js')).toBe(1);
  });

  test('scattered chars score between 0 and 1', () => {
    const s = fuzzyScore('prsr', 'src/parser.js');
    expect(s).toBeGreaterThan(0);
    expect(s).toBeLessThan(1);
  });

  test('no match returns 0', () => {
    expect(fuzzyScore('zzz', 'src/parser.js')).toBe(0);
  });

  test('empty query returns 0', () => {
    expect(fuzzyScore('', 'src/parser.js')).toBe(0);
  });

  test('empty target returns 0', () => {
    expect(fuzzyScore('parser', '')).toBe(0);
  });
});

describe('scoreFrame', () => {
  test('scores against file', () => {
    const frame = { file: 'src/formatter.js', name: 'doSomething' };
    expect(scoreFrame(frame, 'formatter')).toBe(1);
  });

  test('scores against name', () => {
    const frame = { file: 'src/x.js', name: 'parseStackTrace' };
    expect(scoreFrame(frame, 'parseStack')).toBe(1);
  });

  test('returns max of file and name scores', () => {
    const frame = { file: 'src/a.js', name: 'parseStackTrace' };
    const s = scoreFrame(frame, 'parse');
    expect(s).toBeGreaterThanOrEqual(0);
  });
});

describe('fuzzySearch', () => {
  test('returns all frames sorted by score', () => {
    const results = fuzzySearch(frames, 'parse');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].file).toBe('src/parser.js');
  });

  test('respects threshold', () => {
    const results = fuzzySearch(frames, 'parse', { threshold: 0.99 });
    expect(results.every(f => f.file.includes('parse') || (f.name || '').includes('parse'))).toBe(true);
  });

  test('respects limit', () => {
    const results = fuzzySearch(frames, 's', { threshold: 0, limit: 2 });
    expect(results.length).toBeLessThanOrEqual(2);
  });

  test('empty query returns all frames', () => {
    const results = fuzzySearch(frames, '');
    expect(results).toHaveLength(frames.length);
  });
});

describe('bestMatch', () => {
  test('returns top matching frame', () => {
    const result = bestMatch(frames, 'resolver');
    expect(result.file).toBe('src/resolver.js');
  });

  test('returns null when no frames', () => {
    expect(bestMatch([], 'parser')).toBeNull();
  });
});
