'use strict';

const {
  captureTrace,
  labelTrace,
  mergeWithCause,
  extractByContext,
  createTracer,
} = require('./tracer');

describe('captureTrace', () => {
  it('returns an array of frame objects', () => {
    const frames = captureTrace();
    expect(Array.isArray(frames)).toBe(true);
  });

  it('each frame has expected shape', () => {
    const frames = captureTrace();
    // parser may return objects; at minimum they should be objects
    frames.forEach(f => expect(typeof f).toBe('object'));
  });
});

describe('labelTrace', () => {
  const base = [{ file: 'a.js', line: 1 }, { file: 'b.js', line: 2 }];

  it('attaches traceContext to every frame', () => {
    const labeled = labelTrace(base, 'request-42');
    labeled.forEach(f => expect(f.traceContext).toBe('request-42'));
  });

  it('does not mutate original frames', () => {
    labelTrace(base, 'x');
    expect(base[0].traceContext).toBeUndefined();
  });
});

describe('mergeWithCause', () => {
  const primary = [{ file: 'a.js' }];
  const cause = [{ file: 'b.js' }];

  it('inserts a boundary marker between traces', () => {
    const merged = mergeWithCause(primary, cause);
    expect(merged[1].type).toBe('boundary');
    expect(merged[1].separator).toBe('caused by');
  });

  it('preserves all frames around the boundary', () => {
    const merged = mergeWithCause(primary, cause);
    expect(merged[0]).toEqual(primary[0]);
    expect(merged[2]).toEqual(cause[0]);
  });

  it('accepts a custom separator', () => {
    const merged = mergeWithCause(primary, cause, 'wrapped by');
    expect(merged[1].separator).toBe('wrapped by');
  });
});

describe('extractByContext', () => {
  const frames = [
    { file: 'a.js', traceContext: 'alpha' },
    { file: 'b.js', traceContext: 'beta' },
    { file: 'c.js', traceContext: 'alpha' },
  ];

  it('returns only frames matching the label', () => {
    const result = extractByContext(frames, 'alpha');
    expect(result).toHaveLength(2);
    result.forEach(f => expect(f.traceContext).toBe('alpha'));
  });

  it('returns empty array when no match', () => {
    expect(extractByContext(frames, 'gamma')).toEqual([]);
  });
});

describe('createTracer', () => {
  it('exposes the context name', () => {
    const t = createTracer('my-service');
    expect(t.context).toBe('my-service');
  });

  it('capture() returns labeled frames', () => {
    const t = createTracer('svc');
    const frames = t.capture();
    expect(Array.isArray(frames)).toBe(true);
    frames.forEach(f => expect(f.traceContext).toBe('svc'));
  });
});
