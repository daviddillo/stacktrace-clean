const { buildPrintOptions, printStackTrace, printWithConfig } = require('./printer');
const { makeWritable } = require('./output.test');

const sampleTrace = {
  header: 'Error: something went wrong',
  frames: [
    { name: 'doWork', file: '/app/src/worker.js', line: 12, column: 5, isInternal: false },
    { name: 'run',    file: '/app/src/runner.js', line: 34, column: 3, isInternal: false },
    { name: 'Module._compile', file: 'internal/modules/cjs/loader.js', line: 999, column: 30, isInternal: true },
  ],
};

describe('buildPrintOptions', () => {
  it('returns defaults when called with no args', () => {
    const opts = buildPrintOptions();
    expect(opts.color).toBe(true);
    expect(opts.maxFrames).toBe(50);
    expect(opts.exclude).toEqual([]);
    expect(opts.outputFile).toBeNull();
  });

  it('merges overrides', () => {
    const opts = buildPrintOptions({ color: false, maxFrames: 10 });
    expect(opts.color).toBe(false);
    expect(opts.maxFrames).toBe(10);
  });
});

describe('printStackTrace', () => {
  it('writes rendered text to the provided stream', () => {
    const chunks = [];
    const stream = makeWritable(chunks);
    const result = printStackTrace(sampleTrace, { color: false, stream });
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    expect(chunks.join('')).toBe(result);
  });

  it('respects maxFrames truncation', () => {
    const chunks = [];
    const stream = makeWritable(chunks);
    printStackTrace(sampleTrace, { color: false, maxFrames: 1, stream });
    const output = chunks.join('');
    // Only 1 frame rendered; internal frame and second app frame omitted
    expect((output.match(/at /g) || []).length).toBeLessThanOrEqual(2);
  });

  it('excludes frames matching exclude patterns', () => {
    const chunks = [];
    const stream = makeWritable(chunks);
    printStackTrace(sampleTrace, {
      color: false,
      exclude: ['runner'],
      stream,
    });
    expect(chunks.join('')).not.toMatch(/runner/);
  });
});

describe('printWithConfig', () => {
  it('runs without throwing given a minimal config', () => {
    const chunks = [];
    const stream = makeWritable(chunks);
    expect(() =>
      printWithConfig(sampleTrace, { color: false, stream })
    ).not.toThrow();
  });
});
