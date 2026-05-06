import { isInternal, formatFile, formatName, formatFrame, formatStackTrace } from './formatter.js';

const frame = {
  name: 'myFunction',
  file: '/home/user/project/src/app.js',
  line: 42,
  col: 7,
  isNative: false,
  isInternal: false,
};

const internalFrame = {
  name: 'Module._compile',
  file: 'internal/modules/cjs/loader.js',
  line: 1,
  col: 1,
  isNative: false,
  isInternal: true,
};

const nativeFrame = {
  name: 'Array.forEach',
  file: null,
  line: null,
  col: null,
  isNative: true,
  isInternal: false,
};

describe('isInternal', () => {
  test('returns true for node internals', () => {
    expect(isInternal('internal/modules/cjs/loader.js')).toBe(true);
  });

  test('returns true for node_modules', () => {
    expect(isInternal('/project/node_modules/express/index.js')).toBe(true);
  });

  test('returns false for user code', () => {
    expect(isInternal('/home/user/project/src/app.js')).toBe(false);
  });

  test('returns false for null', () => {
    expect(isInternal(null)).toBe(false);
  });
});

describe('formatFile', () => {
  test('formats file with line and col', () => {
    expect(formatFile(frame)).toBe('/home/user/project/src/app.js:42:7');
  });

  test('returns native label for native frames', () => {
    expect(formatFile(nativeFrame)).toBe('<native>');
  });

  test('returns unknown for frames with no file', () => {
    expect(formatFile({ file: null, line: null, col: null, isNative: false })).toBe('<unknown>');
  });
});

describe('formatName', () => {
  test('returns name when present', () => {
    expect(formatName(frame)).toBe('myFunction');
  });

  test('returns anonymous when name is missing', () => {
    expect(formatName({ ...frame, name: null })).toBe('<anonymous>');
  });
});

describe('formatFrame', () => {
  test('formats a user frame correctly', () => {
    const result = formatFrame(frame);
    expect(result).toContain('myFunction');
    expect(result).toContain('/home/user/project/src/app.js:42:7');
  });

  test('formats an internal frame correctly', () => {
    const result = formatFrame(internalFrame);
    expect(result).toContain('Module._compile');
  });
});

describe('formatStackTrace', () => {
  test('formats all frames', () => {
    const result = formatStackTrace([frame, internalFrame]);
    expect(result).toHaveLength(2);
  });

  test('returns empty array for empty input', () => {
    expect(formatStackTrace([])).toEqual([]);
  });
});
