const { splitTraces, containsTrace, findBlockEnd } = require('./splitter');

const SINGLE = `TypeError: Cannot read property 'x' of undefined
    at Object.<anonymous> (/app/index.js:10:5)
    at Module._compile (node:internal/modules/cjs/loader:1376:14)`;

const DOUBLE = `${SINGLE}

RangeError: Maximum call stack size exceeded
    at recurse (/app/recurse.js:3:3)
    at recurse (/app/recurse.js:3:3)`;

const NO_TRACE = 'Just some plain log output\nwith multiple lines';

describe('splitTraces', () => {
  test('returns single block for one trace', () => {
    const result = splitTraces(SINGLE);
    expect(result).toHaveLength(1);
    expect(result[0]).toContain("TypeError");
  });

  test('returns two blocks for two traces separated by blank line', () => {
    const result = splitTraces(DOUBLE);
    expect(result).toHaveLength(2);
    expect(result[0]).toContain('TypeError');
    expect(result[1]).toContain('RangeError');
  });

  test('returns empty array when no traces found', () => {
    const result = splitTraces(NO_TRACE);
    expect(result).toHaveLength(0);
  });

  test('trims whitespace from each block', () => {
    const result = splitTraces('\n\n' + SINGLE + '\n\n');
    expect(result[0]).not.toMatch(/^\n/);
    expect(result[0]).not.toMatch(/\n$/);
  });

  test('handles empty string', () => {
    expect(splitTraces('')).toEqual([]);
  });
});

describe('containsTrace', () => {
  test('returns true when input has a recognisable trace', () => {
    expect(containsTrace(SINGLE)).toBe(true);
  });

  test('returns false for plain text', () => {
    expect(containsTrace(NO_TRACE)).toBe(false);
  });

  test('returns false for error header with no frames', () => {
    expect(containsTrace('TypeError: something went wrong')).toBe(false);
  });
});

describe('findBlockEnd', () => {
  test('stops at blank line', () => {
    const lines = ['Error: boom', '    at foo (x.js:1:1)', '', 'other stuff'];
    expect(findBlockEnd(lines, 0)).toBe(2);
  });

  test('stops at next error header', () => {
    const lines = ['Error: first', '    at a (a.js:1:1)', 'RangeError: second'];
    expect(findBlockEnd(lines, 0)).toBe(2);
  });
});
