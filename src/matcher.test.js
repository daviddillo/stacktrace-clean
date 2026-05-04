const { compilePattern, testFrame, matchesAny, matchesAll, buildMatcher } = require('./matcher');

const frame = (file, name = '') => ({ file, name, source: '' });

describe('compilePattern', () => {
  test('compiles exact string to anchored regex', () => {
    const rx = compilePattern('node_modules');
    expect(rx.test('node_modules')).toBe(true);
    expect(rx.test('other')).toBe(false);
  });

  test('compiles glob with single *', () => {
    const rx = compilePattern('src/*.js');
    expect(rx.test('src/foo.js')).toBe(true);
    expect(rx.test('src/sub/foo.js')).toBe(false);
  });

  test('compiles glob with **', () => {
    const rx = compilePattern('src/**/*.js');
    expect(rx.test('src/sub/foo.js')).toBe(true);
    expect(rx.test('lib/foo.js')).toBe(false);
  });

  test('compiles /regex/ pattern', () => {
    const rx = compilePattern('/node_modules|internal/');
    expect(rx.test('node_modules/lodash')).toBe(true);
    expect(rx.test('internal/stream')).toBe(true);
    expect(rx.test('src/app.js')).toBe(false);
  });

  test('throws on invalid pattern', () => {
    expect(() => compilePattern('')).toThrow(TypeError);
    expect(() => compilePattern(42)).toThrow(TypeError);
  });
});

describe('testFrame', () => {
  test('matches against file field', () => {
    const rx = /node_modules/;
    expect(testFrame(frame('/app/node_modules/lodash/index.js'), rx)).toBe(true);
    expect(testFrame(frame('/app/src/index.js'), rx)).toBe(false);
  });

  test('matches against name field', () => {
    const rx = /Object\.method/;
    expect(testFrame({ file: '', name: 'Object.method', source: '' }, rx)).toBe(true);
  });
});

describe('matchesAny', () => {
  test('returns true if any pattern matches', () => {
    const f = frame('/app/node_modules/lodash/index.js');
    expect(matchesAny(f, ['node_modules', 'internal'])).toBe(true);
  });

  test('returns false if no pattern matches', () => {
    const f = frame('/app/src/index.js');
    expect(matchesAny(f, ['node_modules', 'internal'])).toBe(false);
  });

  test('returns false for empty patterns', () => {
    expect(matchesAny(frame('/app/src/x.js'), [])).toBe(false);
  });
});

describe('matchesAll', () => {
  test('returns true only when all patterns match', () => {
    const f = frame('/app/node_modules/foo/bar.js');
    expect(matchesAll(f, ['node_modules', '/\.js$/'])).toBe(true);
    expect(matchesAll(f, ['node_modules', 'internal'])).toBe(false);
  });
});

describe('buildMatcher', () => {
  test('any mode (default)', () => {
    const match = buildMatcher(['node_modules', 'internal']);
    expect(match(frame('/app/node_modules/x.js'))).toBe(true);
    expect(match(frame('/app/src/x.js'))).toBe(false);
  });

  test('all mode', () => {
    const match = buildMatcher(['node_modules', '/\.js$/'], 'all');
    expect(match(frame('/app/node_modules/x.js'))).toBe(true);
    expect(match(frame('/app/node_modules/x.ts'))).toBe(false);
  });
});
