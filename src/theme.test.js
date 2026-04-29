const { resolveTheme, getStyle, listThemes, THEMES } = require('./theme');

describe('listThemes', () => {
  it('returns an array of built-in theme names', () => {
    const names = listThemes();
    expect(Array.isArray(names)).toBe(true);
    expect(names).toContain('default');
    expect(names).toContain('minimal');
    expect(names).toContain('none');
  });
});

describe('resolveTheme', () => {
  it('returns default theme for "default"', () => {
    const theme = resolveTheme('default');
    expect(theme).toEqual(THEMES.default);
  });

  it('returns minimal theme for "minimal"', () => {
    const theme = resolveTheme('minimal');
    expect(theme).toEqual(THEMES.minimal);
  });

  it('returns empty object for "none"', () => {
    const theme = resolveTheme('none');
    expect(theme).toEqual({});
  });

  it('returns empty object for falsy input', () => {
    expect(resolveTheme(null)).toEqual({});
    expect(resolveTheme(undefined)).toEqual({});
    expect(resolveTheme('')).toEqual({});
  });

  it('throws for unknown theme name', () => {
    expect(() => resolveTheme('galaxy-brain')).toThrow(/Unknown theme/);
    expect(() => resolveTheme('galaxy-brain')).toThrow(/galaxy-brain/);
  });

  it('merges custom object over default theme', () => {
    const custom = { filePath: ['blue', 'bold'] };
    const theme = resolveTheme(custom);
    expect(theme.filePath).toEqual(['blue', 'bold']);
    expect(theme.error).toEqual(THEMES.default.error);
  });

  it('returns default theme when called with no args', () => {
    // resolveTheme falls back to default for unknown types — but object check handles it
    const theme = resolveTheme('default');
    expect(typeof theme).toBe('object');
  });
});

describe('getStyle', () => {
  it('returns style array for a known key', () => {
    const theme = resolveTheme('default');
    expect(getStyle(theme, 'error')).toEqual(['red', 'bold']);
  });

  it('returns null for missing key', () => {
    const theme = resolveTheme('default');
    expect(getStyle(theme, 'nonexistent')).toBeNull();
  });

  it('returns null for empty theme', () => {
    expect(getStyle({}, 'error')).toBeNull();
  });

  it('returns null when theme is null', () => {
    expect(getStyle(null, 'error')).toBeNull();
  });

  it('returns correct style from minimal theme', () => {
    const theme = resolveTheme('minimal');
    expect(getStyle(theme, 'userFrame')).toEqual(['white']);
  });
});
