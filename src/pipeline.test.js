import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runPipeline, DEFAULT_STEPS } from './pipeline.js';

vi.mock('./parser.js', () => ({
  parseStackTrace: vi.fn((raw) => ({
    header: 'Error: boom',
    frames: [{ file: 'app.js', line: 1, col: 1, name: 'main', raw: '  at main (app.js:1:1)' }],
  })),
}));

vi.mock('./resolver.js', () => ({
  resolveFrames: vi.fn(async (frames) => frames),
}));

vi.mock('./filter.js', () => ({
  filterFrames: vi.fn((frames) => frames),
}));

vi.mock('./deduplicator.js', () => ({
  deduplicateFrames: vi.fn((frames) => frames),
}));

vi.mock('./truncator.js', () => ({
  truncateStackTrace: vi.fn((frames) => frames),
}));

vi.mock('./grouper.js', () => ({
  groupFrames: vi.fn((frames) => [{ label: 'app', frames }]),
  flattenGroups: vi.fn((groups) => groups.flatMap((g) => g.frames)),
}));

vi.mock('./formatter.js', () => ({
  formatStackTrace: vi.fn((header, frames) => `${header}\nformatted`),
}));

vi.mock('./highlighter.js', () => ({
  highlightStackTrace: vi.fn((output) => `\x1b[31m${output}\x1b[0m`),
}));

describe('runPipeline', () => {
  it('returns a string result', async () => {
    const result = await runPipeline('Error: boom\n  at main (app.js:1:1)', {});
    expect(typeof result).toBe('string');
    expect(result).toContain('formatted');
  });

  it('skips highlight when color is false', async () => {
    const result = await runPipeline('Error: boom\n  at main (app.js:1:1)', { color: false });
    expect(result).not.toContain('\x1b[');
  });

  it('runs only specified steps', async () => {
    const result = await runPipeline('Error: boom\n  at main (app.js:1:1)', {}, ['parse', 'format', 'highlight']);
    expect(result).toBeTruthy();
  });

  it('throws on unknown step', async () => {
    await expect(
      runPipeline('Error: boom', {}, ['parse', 'explode'])
    ).rejects.toThrow('Unknown pipeline step: "explode"');
  });

  it('exports DEFAULT_STEPS array', () => {
    expect(Array.isArray(DEFAULT_STEPS)).toBe(true);
    expect(DEFAULT_STEPS).toContain('parse');
    expect(DEFAULT_STEPS).toContain('highlight');
  });
});
