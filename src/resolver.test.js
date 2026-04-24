'use strict';

jest.mock('./sourcemap');

const { resolveSourceMap } = require('./sourcemap');
const { resolveFrame, resolveFrames } = require('./resolver');

const baseFrame = {
  file: '/project/dist/index.js',
  line: 42,
  column: 10,
  name: 'doSomething',
  raw: '    at doSomething (/project/dist/index.js:42:10)',
};

describe('resolveFrame', () => {
  afterEach(() => jest.resetAllMocks());

  test('returns original frame when no source map found', async () => {
    resolveSourceMap.mockResolvedValue(null);
    const result = await resolveFrame(baseFrame);
    expect(result).toEqual(baseFrame);
  });

  test('maps frame to original source position', async () => {
    resolveSourceMap.mockResolvedValue({
      source: '/project/src/index.ts',
      line: 10,
      column: 3,
      name: 'doSomething',
    });
    const result = await resolveFrame(baseFrame);
    expect(result.file).toBe('/project/src/index.ts');
    expect(result.line).toBe(10);
    expect(result.column).toBe(3);
    expect(result.originalFile).toBe('/project/dist/index.js');
    expect(result.originalLine).toBe(42);
  });

  test('returns frame unchanged if resolveSourceMap throws', async () => {
    resolveSourceMap.mockRejectedValue(new Error('read error'));
    const result = await resolveFrame(baseFrame);
    expect(result).toEqual(baseFrame);
  });

  test('handles null frame gracefully', async () => {
    const result = await resolveFrame(null);
    expect(result).toBeNull();
  });
});

describe('resolveFrames', () => {
  test('resolves all frames in array', async () => {
    resolveSourceMap.mockResolvedValue(null);
    const frames = [baseFrame, { ...baseFrame, line: 99 }];
    const results = await resolveFrames(frames);
    expect(results).toHaveLength(2);
  });

  test('returns empty array for non-array input', async () => {
    const results = await resolveFrames(null);
    expect(results).toEqual([]);
  });
});
