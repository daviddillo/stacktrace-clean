const { shouldPage, countLines, getPager } = require('./pager');

describe('countLines', () => {
  it('counts single line', () => {
    expect(countLines('hello')).toBe(1);
  });

  it('counts multiple lines', () => {
    expect(countLines('a\nb\nc')).toBe(3);
  });

  it('counts trailing newline', () => {
    expect(countLines('a\nb\n')).toBe(3);
  });
});

describe('shouldPage', () => {
  const longText = Array(100).fill('line').join('\n');
  const shortText = Array(5).fill('line').join('\n');

  it('returns true when force is set', () => {
    expect(shouldPage(shortText, { force: true })).toBe(true);
  });

  it('returns false for short text below threshold', () => {
    expect(shouldPage(shortText, { threshold: 50 })).toBe(false);
  });

  it('returns true for text exceeding threshold', () => {
    expect(shouldPage(longText, { threshold: 20 })).toBe(true);
  });

  it('uses terminal height when no threshold given', () => {
    const origRows = process.stdout.rows;
    Object.defineProperty(process.stdout, 'rows', { value: 200, configurable: true });
    expect(shouldPage(shortText)).toBe(false);
    Object.defineProperty(process.stdout, 'rows', { value: origRows, configurable: true });
  });
});

describe('getPager', () => {
  const origEnv = process.env.PAGER;

  afterEach(() => {
    if (origEnv === undefined) delete process.env.PAGER;
    else process.env.PAGER = origEnv;
  });

  it('returns PAGER env var when set', () => {
    process.env.PAGER = 'more';
    expect(getPager()).toBe('more');
  });

  it('returns less on non-windows when PAGER not set', () => {
    delete process.env.PAGER;
    const platform = process.platform;
    if (platform !== 'win32') {
      expect(getPager()).toBe('less');
    }
  });
});
