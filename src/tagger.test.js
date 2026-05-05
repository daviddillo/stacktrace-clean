const { tagFrame, tagStackTrace, filterByTags, listTags } = require('./tagger');

describe('tagFrame', () => {
  test('tags a node_modules frame', () => {
    const frame = { name: 'fn', file: '/project/node_modules/express/index.js', raw: '' };
    expect(tagFrame(frame)).toContain('node_modules');
  });

  test('tags an async frame by name', () => {
    const frame = { name: 'async myFn', file: '/app/index.js', raw: '' };
    expect(tagFrame(frame)).toContain('async');
  });

  test('tags an eval frame', () => {
    const frame = { name: '', file: '', raw: 'at eval (eval at <anonymous>)' };
    expect(tagFrame(frame)).toContain('eval');
    expect(tagFrame(frame)).toContain('anonymous');
  });

  test('tags a test file frame', () => {
    const frame = { name: 'it', file: '/app/src/foo.test.js', raw: '' };
    expect(tagFrame(frame)).toContain('test');
  });

  test('tags an internal Node frame', () => {
    const frame = { name: '', file: 'node:internal/modules/cjs/loader', raw: '' };
    expect(tagFrame(frame)).toContain('internal');
  });

  test('returns empty array for plain user frame', () => {
    const frame = { name: 'myFunc', file: '/app/src/util.js', raw: '' };
    const tags = tagFrame(frame);
    expect(tags).not.toContain('node_modules');
    expect(tags).not.toContain('internal');
  });
});

describe('tagStackTrace', () => {
  test('adds tags to every frame', () => {
    const trace = {
      header: 'Error: boom',
      frames: [
        { name: 'fn', file: '/app/index.js', raw: '' },
        { name: '', file: '/app/node_modules/lib/x.js', raw: '' },
      ],
    };
    const result = tagStackTrace(trace);
    expect(result.frames[0]).toHaveProperty('tags');
    expect(result.frames[1].tags).toContain('node_modules');
  });

  test('preserves header and other fields', () => {
    const trace = { header: 'TypeError: x', frames: [] };
    expect(tagStackTrace(trace).header).toBe('TypeError: x');
  });
});

describe('filterByTags', () => {
  const frames = [
    { name: 'a', tags: ['async', 'node_modules'] },
    { name: 'b', tags: ['internal'] },
    { name: 'c', tags: [] },
  ];

  test('returns frames matching any wanted tag', () => {
    const result = filterByTags(frames, ['internal']);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('b');
  });

  test('returns all frames when no tags specified', () => {
    expect(filterByTags(frames, [])).toHaveLength(3);
  });

  test('handles frames without tags property', () => {
    const bare = [{ name: 'x' }];
    expect(filterByTags(bare, ['async'])).toHaveLength(0);
  });
});

describe('listTags', () => {
  test('returns a non-empty array of strings', () => {
    const tags = listTags();
    expect(Array.isArray(tags)).toBe(true);
    expect(tags.length).toBeGreaterThan(0);
    expect(tags).toContain('node_modules');
    expect(tags).toContain('async');
  });
});
