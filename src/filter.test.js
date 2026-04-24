const { matchesPattern, shouldExclude, filterFrames } = require('./filter');

describe('matchesPattern', () => {
  it('returns false for empty patterns', () => {
    expect(matchesPattern('/some/file.js', [])).toBe(false);
  });

  it('matches substring patterns', () => {
    expect(matchesPattern('/app/node_modules/lodash/index.js', ['node_modules'])).toBe(true);
  });

  it('matches regex patterns', () => {
    expect(matchesPattern('/app/src/utils.js', ['/src\/utils/'])).toBe(true);
  });

  it('returns false when no pattern matches', () => {
    expect(matchesPattern('/app/src/index.js', ['node_modules', 'dist'])).toBe(false);
  });
});

describe('shouldExclude', () => {
  const nodeModuleFrame = { file: '/app/node_modules/express/index.js', isInternal: false };
  const internalFrame = { file: 'internal/process/task_queues.js', isInternal: true };
  const appFrame = { file: '/app/src/server.js', isInternal: false };

  it('excludes node_modules when hideNodeModules is true', () => {
    expect(shouldExclude(nodeModuleFrame, { hideNodeModules: true })).toBe(true);
  });

  it('keeps node_modules when hideNodeModules is false', () => {
    expect(shouldExclude(nodeModuleFrame, { hideNodeModules: false })).toBe(false);
  });

  it('excludes internal frames when hideInternal is true', () => {
    expect(shouldExclude(internalFrame, { hideInternal: true })).toBe(true);
  });

  it('excludes frames matching exclude patterns', () => {
    expect(shouldExclude(appFrame, { exclude: ['src/server'] })).toBe(true);
  });

  it('include patterns override exclude', () => {
    expect(shouldExclude(nodeModuleFrame, {
      hideNodeModules: true,
      include: ['node_modules/express'],
    })).toBe(false);
  });
});

describe('filterFrames', () => {
  const frames = [
    { file: '/app/src/index.js', isInternal: false },
    { file: '/app/node_modules/chalk/index.js', isInternal: false },
    { file: 'internal/timers.js', isInternal: true },
  ];

  it('returns all frames with default options', () => {
    expect(filterFrames(frames)).toHaveLength(3);
  });

  it('filters node_modules and internal frames', () => {
    const result = filterFrames(frames, { hideNodeModules: true, hideInternal: true });
    expect(result).toHaveLength(1);
    expect(result[0].file).toBe('/app/src/index.js');
  });

  it('returns empty array when all frames excluded', () => {
    const result = filterFrames(frames, { exclude: ['/app', 'internal'] });
    expect(result).toHaveLength(0);
  });
});
