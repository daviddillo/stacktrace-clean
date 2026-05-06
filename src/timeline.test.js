'use strict';

const { indexFrames, bucketByCategory, buildTimeline, formatTimeline } = require('./timeline');

const frames = [
  { name: 'doWork', file: 'src/app.js', line: 10, category: 'app' },
  { name: 'readFile', file: 'node_modules/fs-extra/index.js', line: 42, category: 'module' },
  { name: 'Module._compile', file: 'internal/modules/cjs.js', line: 1, category: 'internal' },
];

test('indexFrames attaches timelineIndex to each frame', () => {
  const result = indexFrames(frames);
  expect(result[0].timelineIndex).toBe(0);
  expect(result[1].timelineIndex).toBe(1);
  expect(result[2].timelineIndex).toBe(2);
  // original frame objects are not mutated
  expect(frames[0].timelineIndex).toBeUndefined();
});

test('bucketByCategory groups frames correctly', () => {
  const buckets = bucketByCategory(frames);
  expect(buckets.app).toHaveLength(1);
  expect(buckets.module).toHaveLength(1);
  expect(buckets.internal).toHaveLength(1);
  expect(buckets.app[0].name).toBe('doWork');
});

test('bucketByCategory returns empty object for empty input', () => {
  const buckets = bucketByCategory([]);
  expect(Object.keys(buckets)).toHaveLength(0);
});

test('buildTimeline excludes internal frames by default', () => {
  const tl = buildTimeline(frames);
  expect(tl).toHaveLength(2);
  expect(tl.every(e => e.category !== 'internal')).toBe(true);
});

test('buildTimeline includes internal frames when requested', () => {
  const tl = buildTimeline(frames, { includeInternal: true });
  expect(tl).toHaveLength(3);
});

test('buildTimeline entries have expected shape', () => {
  const [entry] = buildTimeline(frames);
  expect(entry).toMatchObject({
    position: 0,
    originalIndex: 0,
    file: 'src/app.js',
    line: 10,
    name: 'doWork',
    category: 'app',
  });
});

test('buildTimeline returns empty array for empty input', () => {
  expect(buildTimeline([])).toEqual([]);
});

test('formatTimeline returns readable string', () => {
  const tl = buildTimeline(frames);
  const output = formatTimeline(tl);
  expect(output).toContain('doWork');
  expect(output).toContain('src/app.js:10');
  expect(output).toContain('[0]');
});

test('formatTimeline handles empty timeline', () => {
  expect(formatTimeline([])).toBe('(empty timeline)');
});
