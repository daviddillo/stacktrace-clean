const { compileRule, buildRedactor, redactStackTrace, DEFAULT_PATTERNS } = require('./redactor');

describe('compileRule', () => {
  test('accepts a RegExp rule object', () => {
    const rule = compileRule({ pattern: /foo/g, replacement: 'bar' });
    expect(rule.pattern).toBeInstanceOf(RegExp);
    expect(rule.replacement).toBe('bar');
  });

  test('defaults replacement to <redacted> when omitted', () => {
    const rule = compileRule({ pattern: /secret/g });
    expect(rule.replacement).toBe('<redacted>');
  });

  test('accepts a plain string and escapes it', () => {
    const rule = compileRule('my.secret');
    expect('my.secret'.replace(rule.pattern, rule.replacement)).toBe('<redacted>');
    // dot should be literal, not wildcard
    expect('myXsecret'.replace(rule.pattern, rule.replacement)).toBe('myXsecret');
  });

  test('throws on invalid input', () => {
    expect(() => compileRule(42)).toThrow(TypeError);
  });
});

describe('buildRedactor', () => {
  test('redacts home directory on macOS/Linux', () => {
    const redact = buildRedactor();
    expect(redact('/Users/alice/projects/app/index.js')).toBe('/Users/<user>/projects/app/index.js');
    expect(redact('/home/bob/app/server.js')).toBe('/home/<user>/app/server.js');
  });

  test('redacts Windows user paths', () => {
    const redact = buildRedactor();
    expect(redact('C:\\Users\\alice\\app\\index.js')).toBe('C:\\Users\\<user>\\app\\index.js');
  });

  test('redacts token query params', () => {
    const redact = buildRedactor();
    expect(redact('https://api.example.com/data?token=abc123&page=1'))
      .toBe('https://api.example.com/data?token=<redacted>&page=1');
  });

  test('redacts IP addresses', () => {
    const redact = buildRedactor();
    expect(redact('connect to 192.168.1.100 failed')).toBe('connect to <ip> failed');
  });

  test('skips default patterns when defaults=false', () => {
    const redact = buildRedactor({ defaults: false });
    expect(redact('/Users/alice/app')).toBe('/Users/alice/app');
  });

  test('applies custom rules alongside defaults', () => {
    const redact = buildRedactor({ rules: [{ pattern: /PROJ-\d+/g, replacement: '<ticket>' }] });
    expect(redact('error in PROJ-4321 handler')).toBe('error in <ticket> handler');
  });

  test('handles non-string input gracefully', () => {
    const redact = buildRedactor();
    expect(redact(null)).toBeNull();
    expect(redact(42)).toBe(42);
  });
});

describe('redactStackTrace', () => {
  test('redacts header and frame files', () => {
    const redact = buildRedactor();
    const trace = {
      header: 'Error: failed at /Users/alice/app/index.js',
      frames: [
        { file: '/Users/alice/app/lib/util.js', line: 10, raw: '    at util (/Users/alice/app/lib/util.js:10:5)' },
        { file: 'node:internal/modules/cjs/loader', line: 1, raw: '    at Module._load (node:internal:1:1)' },
      ],
    };
    redactStackTrace(trace, redact);
    expect(trace.header).toContain('<user>');
    expect(trace.frames[0].file).toBe('/Users/<user>/app/lib/util.js');
    expect(trace.frames[0].raw).toContain('<user>');
    // Internal node frame should be unchanged for file path
    expect(trace.frames[1].file).toBe('node:internal/modules/cjs/loader');
  });

  test('returns the mutated object', () => {
    const redact = buildRedactor();
    const trace = { header: 'Error', frames: [] };
    expect(redactStackTrace(trace, redact)).toBe(trace);
  });
});
