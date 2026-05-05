const { inspectMessage, inspectStackTrace, PATTERNS } = require('./inspector');

describe('inspectMessage', () => {
  test('detects null dereference', () => {
    const result = inspectMessage("Cannot read properties of undefined (reading 'foo')");
    expect(result).not.toBeNull();
    expect(result.category).toBe('null-deref');
    expect(result.hint).toMatch(/foo/);
  });

  test('detects not-a-function error', () => {
    const result = inspectMessage('someFunc is not a function');
    expect(result.category).toBe('type-error');
    expect(result.hint).toMatch(/callable/);
  });

  test('detects missing module', () => {
    const result = inspectMessage("Cannot find module './utils'");
    expect(result.category).toBe('module-not-found');
    expect(result.hint).toMatch(/utils/);
  });

  test('detects stack overflow', () => {
    const result = inspectMessage('Maximum call stack size exceeded');
    expect(result.category).toBe('stack-overflow');
    expect(result.hint).toMatch(/recursion/i);
  });

  test('detects ENOENT', () => {
    const result = inspectMessage('ENOENT: no such file or directory');
    expect(result.category).toBe('fs-error');
  });

  test('detects EACCES', () => {
    const result = inspectMessage('EACCES: permission denied');
    expect(result.category).toBe('fs-error');
    expect(result.hint).toMatch(/[Pp]ermission/);
  });

  test('detects SyntaxError', () => {
    const result = inspectMessage('SyntaxError: Unexpected token }');
    expect(result.category).toBe('syntax');
  });

  test('returns null for unknown message', () => {
    const result = inspectMessage('Something went completely wrong');
    expect(result).toBeNull();
  });
});

describe('inspectStackTrace', () => {
  const base = {
    header: 'TypeError: someFunc is not a function',
    frames: [
      { file: '/app/src/index.js', line: 10, col: 5, name: 'main' },
      { file: '/app/node_modules/lodash/lodash.js', line: 42, col: 1, name: 'map' },
      { file: 'fs', line: 0, col: 0, name: 'readFileSync' },
    ],
  };

  test('attaches diagnosis for known error', () => {
    const { diagnosis } = inspectStackTrace(base);
    expect(diagnosis).not.toBeNull();
    expect(diagnosis.category).toBe('type-error');
  });

  test('marks node_modules frames as third-party', () => {
    const { frames } = inspectStackTrace(base);
    expect(frames[1]._note).toBe('third-party');
  });

  test('marks built-in frames', () => {
    const { frames } = inspectStackTrace(base);
    expect(frames[2]._note).toBe('built-in');
  });

  test('leaves user frames unannotated', () => {
    const { frames } = inspectStackTrace(base);
    expect(frames[0]._note).toBeUndefined();
  });

  test('returns null diagnosis for unrecognised header', () => {
    const { diagnosis } = inspectStackTrace({ header: 'Oops', frames: [] });
    expect(diagnosis).toBeNull();
  });

  test('PATTERNS array is non-empty', () => {
    expect(PATTERNS.length).toBeGreaterThan(0);
  });
});
