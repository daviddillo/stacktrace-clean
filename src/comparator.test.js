const {
  similarityScore,
  classifyRelationship,
  compareTraces,
  formatComparison,
} = require('./comparator');

const frameA1 = { file: 'app.js', line: 10, column: 5, name: 'doThing' };
const frameA2 = { file: 'server.js', line: 42, column: 3, name: 'handleReq' };
const frameB1 = { file: 'app.js', line: 10, column: 5, name: 'doThing' };
const frameB2 = { file: 'utils.js', line: 7, column: 1, name: 'helper' };

const traceA = { errorType: 'TypeError', frames: [frameA1, frameA2] };
const traceB = { errorType: 'TypeError', frames: [frameB1, frameB2] };
const traceC = { errorType: 'RangeError', frames: [frameB2] };

describe('similarityScore', () => {
  it('returns 1 for identical diff summary', () => {
    expect(similarityScore({ summary: { added: 0, removed: 0, unchanged: 3 } })).toBe(1);
  });

  it('returns 0 for completely different', () => {
    expect(similarityScore({ summary: { added: 2, removed: 2, unchanged: 0 } })).toBe(0);
  });

  it('returns 1 for empty traces', () => {
    expect(similarityScore({ summary: { added: 0, removed: 0, unchanged: 0 } })).toBe(1);
  });

  it('returns fractional value for partial overlap', () => {
    const score = similarityScore({ summary: { added: 1, removed: 1, unchanged: 2 } });
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(1);
  });
});

describe('classifyRelationship', () => {
  it('classifies 1.0 as identical', () => {
    expect(classifyRelationship(1.0)).toBe('identical');
  });

  it('classifies 0.8 as similar', () => {
    expect(classifyRelationship(0.8)).toBe('similar');
  });

  it('classifies 0.5 as related', () => {
    expect(classifyRelationship(0.5)).toBe('related');
  });

  it('classifies 0.1 as distinct', () => {
    expect(classifyRelationship(0.1)).toBe('distinct');
  });
});

describe('compareTraces', () => {
  it('returns a relationship field', () => {
    const result = compareTraces(traceA, traceB);
    expect(typeof result.relationship).toBe('string');
  });

  it('detects same error type', () => {
    const result = compareTraces(traceA, traceB);
    expect(result.sameError).toBe(true);
  });

  it('detects different error type', () => {
    const result = compareTraces(traceA, traceC);
    expect(result.sameError).toBe(false);
  });

  it('includes similarity score between 0 and 1', () => {
    const result = compareTraces(traceA, traceB);
    expect(result.similarityScore).toBeGreaterThanOrEqual(0);
    expect(result.similarityScore).toBeLessThanOrEqual(1);
  });

  it('includes diff and summary', () => {
    const result = compareTraces(traceA, traceA);
    expect(result.diff).toBeDefined();
    expect(result.summary).toBeDefined();
  });
});

describe('formatComparison', () => {
  it('includes relationship label', () => {
    const result = compareTraces(traceA, traceA);
    const text = formatComparison(result);
    expect(text).toMatch(/Relationship/);
  });

  it('includes similarity percentage', () => {
    const result = compareTraces(traceA, traceB);
    const text = formatComparison(result);
    expect(text).toMatch(/Similarity/);
  });

  it('mentions same error when available', () => {
    const result = compareTraces(traceA, traceB);
    const text = formatComparison(result);
    expect(text).toMatch(/Same error/);
  });
});
