import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolveOriginalPosition, clearCache } from './sourcemap.js';
import { SourceMapConsumer } from 'source-map';
import fs from 'fs';

vi.mock('fs');
vi.mock('source-map');

const FAKE_MAP = JSON.stringify({
  version: 3,
  sources: ['src/original.ts'],
  names: ['myFunction'],
  mappings: 'AAAA',
});

const FAKE_JS = `function foo() {}\n//# sourceMappingURL=app.js.map`;

beforeEach(() => {
  clearCache();
  vi.clearAllMocks();
});

describe('resolveOriginalPosition', () => {
  it('returns null when file has no source map comment', async () => {
    fs.readFileSync.mockReturnValue('function foo() {}');
    const result = await resolveOriginalPosition('/app/dist/app.js', 1, 0);
    expect(result).toBeNull();
  });

  it('returns null when map file does not exist', async () => {
    fs.readFileSync.mockReturnValue(FAKE_JS);
    fs.existsSync.mockReturnValue(false);
    const result = await resolveOriginalPosition('/app/dist/app.js', 1, 0);
    expect(result).toBeNull();
  });

  it('resolves original position from map file', async () => {
    fs.readFileSync
      .mockReturnValueOnce(FAKE_JS)
      .mockReturnValueOnce(FAKE_MAP);
    fs.existsSync.mockReturnValue(true);

    SourceMapConsumer.mockImplementation(() => ({
      originalPositionFor: () => ({
        source: 'src/original.ts',
        line: 10,
        column: 5,
        name: 'myFunction',
      }),
    }));

    const result = await resolveOriginalPosition('/app/dist/app.js', 1, 0);
    expect(result).toEqual({
      source: 'src/original.ts',
      line: 10,
      column: 5,
      name: 'myFunction',
    });
  });

  it('returns null when consumer has no matching source', async () => {
    fs.readFileSync
      .mockReturnValueOnce(FAKE_JS)
      .mockReturnValueOnce(FAKE_MAP);
    fs.existsSync.mockReturnValue(true);

    SourceMapConsumer.mockImplementation(() => ({
      originalPositionFor: () => ({ source: null, line: null, column: null, name: null }),
    }));

    const result = await resolveOriginalPosition('/app/dist/app.js', 1, 0);
    expect(result).toBeNull();
  });
});
