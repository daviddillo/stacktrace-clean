'use strict';

const {
  extractCauses,
  tagWithDepth,
  flattenCauses,
  flattenWithHeaders,
  deduplicateAcrossCauses,
} = require('./flattener');

const frame = (file, line, name = 'fn') => ({ file, line, column: 1, name });

const root = {
  header: 'Error: root',
  frames: [frame('a.js', 1), frame('b.js', 2)],
  cause: {
    header: 'Error: cause',
    frames: [frame('c.js', 3), frame('b.js', 2)],
    cause: null,
  },
};

describe('extractCauses', () => {
  it('returns single-element array when no cause', () => {
    const result = extractCauses({ header: 'E', frames: [] });
    expect(result).toHaveLength(1);
  });

  it('walks the full cause chain', () => {
    const result = extractCauses(root);
    expect(result).toHaveLength(2);
    expect(result[0].header).toBe('Error: root');
    expect(result[1].header).toBe('Error: cause');
  });
});

describe('tagWithDepth', () => {
  it('adds causeDepth to each frame', () => {
    const frames = [frame('x.js', 1)];
    const tagged = tagWithDepth(frames, 2);
    expect(tagged[0].causeDepth).toBe(2);
  });

  it('does not mutate original frames', () => {
    const frames = [frame('x.js', 1)];
    tagWithDepth(frames, 1);
    expect(frames[0].causeDepth).toBeUndefined();
  });
});

describe('flattenCauses', () => {
  it('returns all frames from all causes in order', () => {
    const result = flattenCauses(root);
    expect(result).toHaveLength(4);
    expect(result[0].file).toBe('a.js');
    expect(result[2].file).toBe('c.js');
  });

  it('tags root frames with depth 0', () => {
    const result = flattenCauses(root);
    expect(result[0].causeDepth).toBe(0);
    expect(result[2].causeDepth).toBe(1);
  });
});

describe('flattenWithHeaders', () => {
  it('returns one section per cause level', () => {
    const sections = flattenWithHeaders(root);
    expect(sections).toHaveLength(2);
    expect(sections[0].header).toBe('Error: root');
    expect(sections[1].depth).toBe(1);
  });
});

describe('deduplicateAcrossCauses', () => {
  it('removes duplicate frames by location and name', () => {
    const frames = flattenCauses(root);
    const deduped = deduplicateAcrossCauses(frames);
    expect(deduped).toHaveLength(3);
  });

  it('preserves order', () => {
    const frames = flattenCauses(root);
    const deduped = deduplicateAcrossCauses(frames);
    expect(deduped[0].file).toBe('a.js');
  });
});
