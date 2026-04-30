const { sortFrames, listStrategies, byFile, byLine, byCategory, byName } = require('./sorter');

const frames = [
  { name: 'zoo',  file: '/app/zoo.js',  line: 10, category: 'user'       },
  { name: 'bar',  file: '/app/bar.js',  line: 5,  category: 'dependency' },
  { name: 'foo',  file: '/app/foo.js',  line: 20, category: 'user'       },
  { name: 'core', file: 'node:events', line: 1,  category: 'node'       },
];

describe('byFile', () => {
  test('sorts alphabetically by file path', () => {
    const sorted = [...frames].sort(byFile);
    expect(sorted[0].file).toBe('/app/bar.js');
    expect(sorted[1].file).toBe('/app/foo.js');
  });
});

describe('byLine', () => {
  test('sorts by line number ascending', () => {
    const sorted = [...frames].sort(byLine);
    expect(sorted[0].line).toBe(1);
    expect(sorted[3].line).toBe(20);
  });
});

describe('byCategory', () => {
  test('puts user frames first, then dependency, then node', () => {
    const sorted = [...frames].sort(byCategory);
    expect(sorted[0].category).toBe('user');
    expect(sorted[2].category).toBe('node');
  });
});

describe('byName', () => {
  test('sorts alphabetically by function name', () => {
    const sorted = [...frames].sort(byName);
    expect(sorted[0].name).toBe('bar');
    expect(sorted[3].name).toBe('zoo');
  });
});

describe('sortFrames', () => {
  test('sorts by category by default', () => {
    const sorted = sortFrames(frames);
    expect(sorted[0].category).toBe('user');
  });

  test('sorts descending when flag is set', () => {
    const sorted = sortFrames(frames, 'line', true);
    expect(sorted[0].line).toBe(20);
  });

  test('does not mutate original array', () => {
    const original = [...frames];
    sortFrames(frames, 'name');
    expect(frames).toEqual(original);
  });

  test('throws on unknown strategy', () => {
    expect(() => sortFrames(frames, 'bogus')).toThrow(/Unknown sort strategy/);
  });

  test('stable sort preserves relative order of equal elements', () => {
    const dupes = [
      { name: 'a', file: 'x.js', line: 1, category: 'user' },
      { name: 'b', file: 'x.js', line: 1, category: 'user' },
    ];
    const sorted = sortFrames(dupes, 'line');
    expect(sorted[0].name).toBe('a');
  });
});

describe('listStrategies', () => {
  test('returns all strategy names', () => {
    expect(listStrategies()).toEqual(expect.arrayContaining(['file', 'line', 'category', 'name']));
  });
});
