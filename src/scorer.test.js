'use strict';

const { scoreFrame, scoreFrames, rankFrames } = require('./scorer');

describe('scoreFrame', () => {
  it('returns 0 for empty/null frame', () => {
    expect(scoreFrame(null)).toBe(0);
    expect(scoreFrame({})).toBe(0);
  });

  it('penalises internal frames', () => {
    const score = scoreFrame({ isInternal: true });
    expect(score).toBeLessThan(0);
  });

  it('penalises node_modules frames', () => {
    const score = scoreFrame({ file: '/project/node_modules/express/index.js' });
    expect(score).toBeLessThan(0);
  });

  it('rewards app-code frames', () => {
    const score = scoreFrame({ file: `${process.cwd()}/src/app.js` });
    expect(score).toBeGreaterThan(0);
  });

  it('rewards resolved source-map frames', () => {
    const base = scoreFrame({ file: `${process.cwd()}/src/app.js` });
    const resolved = scoreFrame({ file: `${process.cwd()}/src/app.js`, resolved: true });
    expect(resolved).toBeGreaterThan(base);
  });

  it('rewards named functions', () => {
    const anon = scoreFrame({ file: `${process.cwd()}/src/app.js` });
    const named = scoreFrame({ file: `${process.cwd()}/src/app.js`, name: 'handleRequest' });
    expect(named).toBeGreaterThan(anon);
  });

  it('penalises async frames', () => {
    const sync = scoreFrame({ name: 'doWork' });
    const async_ = scoreFrame({ name: 'doWork', isAsync: true });
    expect(async_).toBeLessThan(sync);
  });

  it('rewards frames with line and column info', () => {
    const noPos = scoreFrame({ name: 'fn' });
    const withPos = scoreFrame({ name: 'fn', line: 10, column: 5 });
    expect(withPos).toBeGreaterThan(noPos);
  });
});

describe('scoreFrames', () => {
  it('returns empty array for non-array input', () => {
    expect(scoreFrames(null)).toEqual([]);
  });

  it('attaches a score to each frame', () => {
    const frames = [{ name: 'a' }, { isInternal: true }];
    const result = scoreFrames(frames);
    expect(result).toHaveLength(2);
    result.forEach(f => expect(typeof f.score).toBe('number'));
  });

  it('does not mutate original frames', () => {
    const frames = [{ name: 'a' }];
    scoreFrames(frames);
    expect(frames[0]).not.toHaveProperty('score');
  });
});

describe('rankFrames', () => {
  it('returns empty array for non-array input', () => {
    expect(rankFrames(null)).toEqual([]);
  });

  it('sorts frames by score descending', () => {
    const frames = [
      { name: 'low', score: -5 },
      { name: 'high', score: 20 },
      { name: 'mid', score: 3 }
    ];
    const ranked = rankFrames(frames);
    expect(ranked[0].name).toBe('high');
    expect(ranked[1].name).toBe('mid');
    expect(ranked[2].name).toBe('low');
  });

  it('does not mutate the input array', () => {
    const frames = [{ score: 1 }, { score: 10 }];
    rankFrames(frames);
    expect(frames[0].score).toBe(1);
  });
});
