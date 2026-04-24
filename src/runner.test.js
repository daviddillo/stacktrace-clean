import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { run, readInput } from './runner.js';
import { Readable } from 'stream';

vi.mock('./pipeline.js', () => ({
  runPipeline: vi.fn(async () => 'Error: test\n  at fn (app.js:1:1)'),
}));

vi.mock('./config.js', () => ({
  resolveConfig: vi.fn(async (argv) => ({ ...argv, color: false })),
}));

vi.mock('./output.js', () => ({
  prepareOutput: vi.fn(async () => {}),
}));

vi.mock('fs', () => ({
  readFileSync: vi.fn((path) => {
    if (path === 'trace.txt') return 'Error: from file\n  at x (x.js:1:1)';
    throw new Error('ENOENT');
  }),
}));

describe('readInput', () => {
  it('reads from file when path provided', async () => {
    const content = await readInput('trace.txt');
    expect(content).toContain('from file');
  });

  it('throws when file not found', async () => {
    await expect(readInput('missing.txt')).rejects.toThrow();
  });
});

describe('run', () => {
  let exitSpy;
  let stderrSpy;

  beforeEach(() => {
    exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('runs successfully with a file argument', async () => {
    const { prepareOutput } = await import('./output.js');
    await run({ file: 'trace.txt' });
    expect(prepareOutput).toHaveBeenCalled();
  });

  it('exits with error when file is missing', async () => {
    await expect(run({ file: 'missing.txt' })).rejects.toThrow('exit');
    expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining('failed to read input'));
  });

  it('exits when input is empty', async () => {
    const { readFileSync } = await import('fs');
    readFileSync.mockReturnValueOnce('   ');
    await expect(run({ file: 'trace.txt' })).rejects.toThrow('exit');
    expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining('no input provided'));
  });
});
