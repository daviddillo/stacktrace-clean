const { buildFileUri, hyperlink, linkFrame } = require('./linker');
const path = require('path');

describe('buildFileUri', () => {
  test('absolute path produces correct file URI', () => {
    const uri = buildFileUri('/home/user/app/src/index.js', 10, 5);
    expect(uri).toBe('file:///home/user/app/src/index.js:10:5');
  });

  test('omits col when not provided', () => {
    const uri = buildFileUri('/home/user/app/src/index.js', 3);
    expect(uri).toBe('file:///home/user/app/src/index.js:3');
  });

  test('omits line and col when neither provided', () => {
    const uri = buildFileUri('/home/user/app/src/index.js');
    expect(uri).toBe('file:///home/user/app/src/index.js');
  });

  test('relative path is resolved against cwd', () => {
    const uri = buildFileUri('src/foo.js');
    const expected = 'file://' + path.resolve(process.cwd(), 'src/foo.js').replace(/\\/g, '/');
    expect(uri).toBe(expected);
  });

  test('normalizes Windows-style backslashes', () => {
    // Simulate a Windows path by passing a pre-resolved absolute path with backslashes
    const winPath = '/C:/Users/dev/project/src/app.js';
    const uri = buildFileUri(winPath, 1, 1);
    expect(uri).not.toContain('\\');
  });
});

describe('hyperlink', () => {
  test('wraps text with OSC 8 sequences', () => {
    const result = hyperlink('click me', 'https://example.com');
    expect(result).toContain('\u001B]8;;https://example.com\u0007');
    expect(result).toContain('click me');
    expect(result).toContain('\u001B]8;;\u0007');
  });

  test('text appears between the two OSC sequences', () => {
    const result = hyperlink('label', 'file:///foo.js');
    const parts = result.split('label');
    expect(parts).toHaveLength(2);
    expect(parts[0]).toContain('\u001B]8');
    expect(parts[1]).toContain('\u001B]8');
  });
});

describe('linkFrame', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    Object.assign(process.env, originalEnv);
    // remove keys added during test
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) delete process.env[key];
    }
  });

  test('returns plain label when hyperlinks not supported', () => {
    delete process.env.WT_SESSION;
    delete process.env.VTE_VERSION;
    delete process.env.TERM_PROGRAM;
    delete process.env.TERM;
    const result = linkFrame('src/app.js:10:5', '/abs/src/app.js', 10, 5);
    expect(result).toBe('src/app.js:10:5');
  });

  test('returns hyperlinked label when iTerm is detected', () => {
    process.env.TERM_PROGRAM = 'iTerm.app';
    const result = linkFrame('src/app.js:10:5', '/abs/src/app.js', 10, 5);
    expect(result).toContain('\u001B]8');
    expect(result).toContain('src/app.js:10:5');
  });

  test('returns plain label when filePath is empty', () => {
    process.env.TERM_PROGRAM = 'iTerm.app';
    const result = linkFrame('native', '', null, null);
    expect(result).toBe('native');
  });
});
