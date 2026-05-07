'use strict';

const {
  extractByFile,
  extractByLineRange,
  extractHead,
  extractTail,
  extractSlice,
  extractByCategory,
} = require('./extractor');

const frames = [
  { file: '/app/src/index.js',   line: 10, category: 'user'   },
  { file: '/app/src/utils.js',   line: 22, category: 'user'   },
  { file: '/app/node_modules/x', line: 5,  category: 'module' },
  { file: 'internal/stream.js',  line: 99, category: 'node'   },
  { file: '/app/src/router.js',  line: 44, category: 'user'   },
];

describe('extractByFile', () => {
  test('returns frames whose file includes the substring', () => {
    const result = extractByFile(frames, 'src/');
    expect(result).toHaveLength(3);
    expect(result.every(f => f.file.includes('src/'))).toBe(true);
  });

  test('returns empty array when no match', () => {
    expect(extractByFile(frames, 'nonexistent')).toEqual([]);
  });
});

describe('extractByLineRange', () => {
  test('returns frames within inclusive range', () => {
    const result = extractByLineRange(frames, 10, 44);
    expect(result.map(f => f.line)).toEqual([10, 22, 44]);
  });

  test('handles frames without line gracefully', () => {
    const mixed = [{ file: 'a.js' }, { file: 'b.js', line: 15 }];
    expect(extractByLineRange(mixed, 1, 20)).toEqual([{ file: 'b.js', line: 15 }]);
  });
});

describe('extractHead', () => {
  test('returns first N frames', () => {
    expect(extractHead(frames, 2)).toEqual(frames.slice(0, 2));
  });

  test('defaults to 5', () => {
    expect(extractHead(frames)).toHaveLength(5);
  });
});

describe('extractTail', () => {
  test('returns last N frames', () => {
    expect(extractTail(frames, 2)).toEqual(frames.slice(-2));
  });

  test('defaults to 5', () => {
    expect(extractTail(frames)).toHaveLength(5);
  });
});

describe('extractSlice', () => {
  test('returns frames between indices', () => {
    expect(extractSlice(frames, 1, 3)).toEqual(frames.slice(1, 3));
  });
});

describe('extractByCategory', () => {
  test('filters by category', () => {
    const result = extractByCategory(frames, 'user');
    expect(result).toHaveLength(3);
    expect(result.every(f => f.category === 'user')).toBe(true);
  });

  test('returns empty when category absent', () => {
    expect(extractByCategory(frames, 'native')).toEqual([]);
  });
});
