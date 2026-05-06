const { shortHash, frameSignature, digestStackTrace, digestWithHeader, groupByFingerprint } = require('./digester');

const frame1 = { name: 'foo', file: '/app/src/foo.js', line: 10, col: 5 };
const frame2 = { name: 'bar', file: '/app/src/bar.js', line: 22, col: 3 };
const frame3 = { name: 'baz', file: '/app/src/baz.js', line: 7,  col: 1 };

const traceA = { header: 'TypeError: cannot read property', frames: [frame1, frame2, frame3] };
const traceB = { header: 'TypeError: cannot read property', frames: [frame1, frame2, frame3] };
const traceC = { header: 'RangeError: out of range',        frames: [frame2, frame3] };

describe('shortHash', () => {
  test('returns a hex string of the requested length', () => {
    const h = shortHash('hello', 8);
    expect(h).toHaveLength(8);
    expect(h).toMatch(/^[0-9a-f]+$/);
  });

  test('same input produces same hash', () => {
    expect(shortHash('abc')).toBe(shortHash('abc'));
  });

  test('different inputs produce different hashes', () => {
    expect(shortHash('abc')).not.toBe(shortHash('xyz'));
  });
});

describe('frameSignature', () => {
  test('combines name and file', () => {
    expect(frameSignature(frame1)).toBe('foo@/app/src/foo.js');
  });

  test('handles missing fields gracefully', () => {
    expect(frameSignature({})).toBe('<anonymous>@<unknown>');
  });

  test('ignores line and column numbers', () => {
    const a = frameSignature({ name: 'x', file: 'f.js', line: 1 });
    const b = frameSignature({ name: 'x', file: 'f.js', line: 99 });
    expect(a).toBe(b);
  });
});

describe('digestStackTrace', () => {
  test('identical traces produce the same fingerprint', () => {
    expect(digestStackTrace(traceA)).toBe(digestStackTrace(traceB));
  });

  test('different traces produce different fingerprints', () => {
    expect(digestStackTrace(traceA)).not.toBe(digestStackTrace(traceC));
  });

  test('respects depth option', () => {
    const full  = digestStackTrace(traceA, { depth: 3 });
    const short = digestStackTrace(traceA, { depth: 1 });
    expect(full).not.toBe(short);
  });

  test('returns string of requested hashLength', () => {
    const fp = digestStackTrace(traceA, { hashLength: 16 });
    expect(fp).toHaveLength(16);
  });
});

describe('digestWithHeader', () => {
  test('same trace, different header → different fingerprint', () => {
    const a = digestWithHeader({ ...traceA, header: 'TypeError: x' });
    const b = digestWithHeader({ ...traceA, header: 'RangeError: x' });
    expect(a).not.toBe(b);
  });

  test('identical input → identical fingerprint', () => {
    expect(digestWithHeader(traceA)).toBe(digestWithHeader(traceB));
  });
});

describe('groupByFingerprint', () => {
  test('groups identical traces together', () => {
    const groups = groupByFingerprint([traceA, traceB, traceC]);
    expect(groups.size).toBe(2);
  });

  test('each group contains the right traces', () => {
    const groups = groupByFingerprint([traceA, traceB, traceC]);
    const key = digestStackTrace(traceA);
    expect(groups.get(key)).toHaveLength(2);
  });
});
