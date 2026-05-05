const { buildSanitizer, sanitizeFrame, sanitizeStackTrace, DEFAULT_PATTERNS } = require('./sanitizer');

describe('buildSanitizer', () => {
  it('returns a function', () => {
    expect(typeof buildSanitizer()).toBe('function');
  });

  it('redacts token query params', () => {
    const sanitize = buildSanitizer();
    const input = 'https://example.com/api?token=supersecret123&foo=bar';
    expect(sanitize(input)).toContain('[REDACTED]');
    expect(sanitize(input)).not.toContain('supersecret123');
  });

  it('redacts api_key query params', () => {
    const sanitize = buildSanitizer();
    expect(sanitize('GET /data?api_key=abc123')).toContain('[REDACTED]');
  });

  it('replaces unix home directory', () => {
    const sanitize = buildSanitizer();
    expect(sanitize('/Users/alice/projects/app/index.js')).toBe('/~/projects/app/index.js');
  });

  it('replaces linux home directory', () => {
    const sanitize = buildSanitizer();
    expect(sanitize('/home/bob/app/server.js')).toBe('/~/app/server.js');
  });

  it('replaces windows home directory', () => {
    const sanitize = buildSanitizer();
    expect(sanitize('C:\\Users\\alice\\app\\index.js')).toMatch(/C:\\Users\\~/);
  });

  it('passes through non-sensitive text unchanged', () => {
    const sanitize = buildSanitizer();
    const plain = 'at Object.<anonymous> (src/index.js:10:5)';
    expect(sanitize(plain)).toBe(plain);
  });

  it('handles non-string input gracefully', () => {
    const sanitize = buildSanitizer();
    expect(sanitize(null)).toBeNull();
    expect(sanitize(42)).toBe(42);
  });

  it('accepts custom rules', () => {
    const rules = [{ label: 'ssn', pattern: /\d{3}-\d{2}-\d{4}/g, replacement: '[SSN]' }];
    const sanitize = buildSanitizer(rules);
    expect(sanitize('ssn: 123-45-6789')).toBe('ssn: [SSN]');
  });
});

describe('sanitizeFrame', () => {
  const sanitize = buildSanitizer();

  it('sanitizes file path', () => {
    const frame = { file: '/Users/carol/app/index.js', line: 5, col: 1, raw: 'at fn (/Users/carol/app/index.js:5:1)' };
    const result = sanitizeFrame(frame, sanitize);
    expect(result.file).toBe('/~/app/index.js');
    expect(result.raw).toContain('/~/app/index.js');
  });

  it('does not mutate the original frame', () => {
    const frame = { file: '/home/dan/app.js', raw: 'at x (/home/dan/app.js:1:1)' };
    sanitizeFrame(frame, sanitize);
    expect(frame.file).toBe('/home/dan/app.js');
  });
});

describe('sanitizeStackTrace', () => {
  it('sanitizes header and all frames', () => {
    const stack = {
      header: 'Error: request to https://api.example.com?token=abc failed',
      frames: [
        { file: '/Users/eve/project/src/index.js', raw: 'at fn (/Users/eve/project/src/index.js:3:1)' },
        { file: '/usr/lib/node/http.js', raw: 'at http (/usr/lib/node/http.js:10:2)' },
      ],
    };
    const result = sanitizeStackTrace(stack);
    expect(result.header).toContain('[REDACTED]');
    expect(result.frames[0].file).toBe('/~/project/src/index.js');
    expect(result.frames[1].file).toBe('/usr/lib/node/http.js');
  });
});
