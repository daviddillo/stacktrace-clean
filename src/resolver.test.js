import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolveFrame, resolveFrames } from './resolver.js';
import * as sourcemap from './sourcemap.js';

vi.mock('./sourcemap.js');

const baseFrame = {
  raw: '    at myFn (/app/dist/index.js:10:5)',
  name: 'myFn',
  file: '/app/dist/index.js',
  line: 10,
  column: 5,
  isNative: false,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('resolveFrame', () => {
  it('returns frame unchanged when no source map found', async () => {
    sourcemap.resolveOriginalPosition.mockResolvedValue(null);
    const result = await resolveFrame(baseFrame);
    expect(result).toEqual(baseFrame);
    expect(result.isResolved).toBeUndefined();
  });

  it('returns frame unchanged when file is missing', async () => {
    const frame = { ...baseFrame, file: null };
    const result = await resolveFrame(frame);
    expect(result).toEqual(frame);
  });

  it('resolves frame to original source position', async () => {
    sourcemap.resolveOriginalPosition.mockResolvedValue({
      source: 'src/index.ts',
      line: 42,
      column: 3,
      name: 'originalFn',
    });

    const result = await resolveFrame(baseFrame);
    expect(result.file).toBe('src/index.ts');
    expect(result.line).toBe(42);
    expect(result.column).toBe(3);
    expect(result.name).toBe('originalFn');
    expect(result.isResolved).toBe(true);
  });

  it('keeps original frame name when source map name is null', async () => {
    sourcemap.resolveOriginalPosition.mockResolvedValue({
      source: 'src/index.ts',
      line: 42,
      column: 3,
      name: null,
    });

    const result = await resolveFrame(baseFrame);
    expect(result.name).toBe('myFn');
  });
});

describe('resolveFrames', () => {
  it('resolves all frames', async () => {
    sourcemap.resolveOriginalPosition.mockResolvedValue(null);
    const frames = [baseFrame, { ...baseFrame, name: 'otherFn' }];
    const results = await resolveFrames(frames);
    expect(results).toHaveLength(2);
  });
});
