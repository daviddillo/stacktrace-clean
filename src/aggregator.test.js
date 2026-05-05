'use strict';

const { groupByErrorType, countOccurrences, aggregateStackTraces, formatAggregation } = require('./aggregator');

const makeTrace = (raw, file, line, col) => ({
  raw,
  frames: [{ file, line, column: col, name: 'fn' }],
});

const traceA = makeTrace('TypeError: bad input\n    at fn (app.js:1:1)', 'app.js', 1, 1);
const traceB = makeTrace('TypeError: bad input\n    at fn (app.js:1:1)', 'app.js', 1, 1);
const traceC = makeTrace('RangeError: out of bounds\n    at g (lib.js:5:3)', 'lib.js', 5, 3);
const traceD = makeTrace('', 'utils.js', 10, 0);

describe('groupByErrorType', () => {
  it('groups by error type extracted from raw header', () => {
    const groups = groupByErrorType([traceA, traceB, traceC]);
    expect(Object.keys(groups)).toEqual(expect.arrayContaining(['TypeError', 'RangeError']));
    expect(groups['TypeError']).toHaveLength(2);
    expect(groups['RangeError']).toHaveLength(1);
  });

  it('falls back to Unknown for empty raw', () => {
    const groups = groupByErrorType([traceD]);
    expect(groups['Unknown']).toHaveLength(1);
  });

  it('returns empty object for empty input', () => {
    expect(groupByErrorType([])).toEqual({});
  });
});

describe('countOccurrences', () => {
  it('merges identical first-frame traces', () => {
    const result = countOccurrences([traceA, traceB, traceC]);
    expect(result).toHaveLength(2);
    const typeError = result.find((r) => r.stackTrace.frames[0].file === 'app.js');
    expect(typeError.count).toBe(2);
  });

  it('handles traces with no frames', () => {
    const empty = { raw: '', frames: [] };
    const result = countOccurrences([empty, empty]);
    expect(result).toHaveLength(1);
    expect(result[0].count).toBe(2);
  });
});

describe('aggregateStackTraces', () => {
  it('returns zero-state for empty input', () => {
    const result = aggregateStackTraces([]);
    expect(result.total).toBe(0);
    expect(result.stats).toBeNull();
  });

  it('returns correct totals', () => {
    const result = aggregateStackTraces([traceA, traceB, traceC]);
    expect(result.total).toBe(3);
    expect(result.uniqueErrors).toBe(2);
  });

  it('sorts occurrences by count descending', () => {
    const result = aggregateStackTraces([traceA, traceB, traceC]);
    expect(result.occurrences[0].count).toBeGreaterThanOrEqual(result.occurrences[1].count);
  });
});

describe('formatAggregation', () => {
  it('includes total and unique counts', () => {
    const agg = aggregateStackTraces([traceA, traceB, traceC]);
    const text = formatAggregation(agg);
    expect(text).toMatch(/Total stack traces: 3/);
    expect(text).toMatch(/Unique errors: 2/);
  });

  it('lists error types', () => {
    const agg = aggregateStackTraces([traceA, traceC]);
    const text = formatAggregation(agg);
    expect(text).toMatch(/TypeError/);
    expect(text).toMatch(/RangeError/);
  });

  it('shows most frequent locations', () => {
    const agg = aggregateStackTraces([traceA, traceB, traceC]);
    const text = formatAggregation(agg);
    expect(text).toMatch(/x2.*app\.js:1/);
  });
});
