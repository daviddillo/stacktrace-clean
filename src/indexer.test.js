const { indexByFile, indexByName, indexByLocation, buildIndex, lookup } = require('./indexer');

const frames = [
  { file: 'app.js', line: 10, col: 5, name: 'main' },
  { file: 'app.js', line: 22, col: 3, name: 'helper' },
  { file: 'utils.js', line: 5, col: 1, name: 'main' },
  { file: null, line: null, col: null, name: null },
];

describe('indexByFile', () => {
  it('groups frames by file', () => {
    const idx = indexByFile(frames);
    expect(idx.get('app.js')).toHaveLength(2);
    expect(idx.get('utils.js')).toHaveLength(1);
    expect(idx.get('<unknown>')).toHaveLength(1);
  });

  it('returns empty map for no frames', () => {
    expect(indexByFile([]).size).toBe(0);
  });
});

describe('indexByName', () => {
  it('groups frames by function name', () => {
    const idx = indexByName(frames);
    expect(idx.get('main')).toHaveLength(2);
    expect(idx.get('helper')).toHaveLength(1);
    expect(idx.get('<anonymous>')).toHaveLength(1);
  });
});

describe('indexByLocation', () => {
  it('keys frames by file:line', () => {
    const idx = indexByLocation(frames);
    expect(idx.get('app.js:10')).toHaveLength(1);
    expect(idx.get('app.js:22')).toHaveLength(1);
    expect(idx.get('<unknown>:?')).toHaveLength(1);
  });
});

describe('buildIndex', () => {
  it('returns all three indexes', () => {
    const idx = buildIndex(frames);
    expect(idx).toHaveProperty('byFile');
    expect(idx).toHaveProperty('byName');
    expect(idx).toHaveProperty('byLocation');
  });

  it('indexes are consistent with individual functions', () => {
    const idx = buildIndex(frames);
    expect(idx.byFile.get('app.js')).toHaveLength(2);
    expect(idx.byName.get('main')).toHaveLength(2);
  });
});

describe('lookup', () => {
  const idx = buildIndex(frames);

  it('looks up by file', () => {
    expect(lookup(idx, 'file', 'utils.js')).toHaveLength(1);
  });

  it('looks up by name', () => {
    expect(lookup(idx, 'name', 'helper')).toHaveLength(1);
  });

  it('looks up by location', () => {
    expect(lookup(idx, 'location', 'app.js:10')).toHaveLength(1);
  });

  it('returns empty array for missing key', () => {
    expect(lookup(idx, 'file', 'missing.js')).toEqual([]);
  });
});
