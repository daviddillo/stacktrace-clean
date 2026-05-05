const { deriveLabel, labelFrames, filterByLabel, listLabels } = require('./labeler');

function frame(file, extra = {}) {
  return { file, name: 'fn', line: 1, col: 1, ...extra };
}

describe('deriveLabel', () => {
  test('marks node: builtins as node-internal', () => {
    expect(deriveLabel(frame('node:fs'))).toBe('node-internal');
  });

  test('marks internal/ paths as node-internal', () => {
    expect(deriveLabel(frame('internal/bootstrap/node.js'))).toBe('node-internal');
  });

  test('detects express framework', () => {
    expect(deriveLabel(frame('/app/node_modules/express/lib/router/index.js'))).toBe('express');
  });

  test('detects jest framework', () => {
    expect(deriveLabel(frame('/app/node_modules/jest-circus/build/run.js'))).toBe('jest');
  });

  test('marks unknown node_modules as dependency', () => {
    expect(deriveLabel(frame('/app/node_modules/some-lib/index.js'))).toBe('dependency');
  });

  test('marks test files', () => {
    expect(deriveLabel(frame('/app/src/utils.test.js'))).toBe('test');
    expect(deriveLabel(frame('/app/src/utils.spec.ts'))).toBe('test');
  });

  test('marks regular app files', () => {
    expect(deriveLabel(frame('/app/src/server.js'))).toBe('app');
  });

  test('prefers resolvedFile over file when present', () => {
    const f = frame('/app/node_modules/express/lib/router/index.js', {
      resolvedFile: '/app/src/routes.js',
    });
    expect(deriveLabel(f)).toBe('app');
  });
});

describe('labelFrames', () => {
  test('attaches label to every frame', () => {
    const frames = [
      frame('node:events'),
      frame('/app/src/index.js'),
      frame('/app/node_modules/express/lib/application.js'),
    ];
    const labeled = labelFrames(frames);
    expect(labeled.map((f) => f.label)).toEqual(['node-internal', 'app', 'express']);
  });

  test('does not mutate original frames', () => {
    const original = [frame('/app/src/index.js')];
    labelFrames(original);
    expect(original[0].label).toBeUndefined();
  });
});

describe('filterByLabel', () => {
  test('returns only frames with matching label', () => {
    const frames = labelFrames([
      frame('/app/src/a.js'),
      frame('/app/node_modules/lodash/index.js'),
      frame('/app/src/b.test.js'),
    ]);
    expect(filterByLabel(frames, 'app')).toHaveLength(1);
    expect(filterByLabel(frames, 'dependency')).toHaveLength(1);
    expect(filterByLabel(frames, 'test')).toHaveLength(1);
  });
});

describe('listLabels', () => {
  test('returns unique labels', () => {
    const frames = labelFrames([
      frame('/app/src/a.js'),
      frame('/app/src/b.js'),
      frame('node:fs'),
    ]);
    const labels = listLabels(frames);
    expect(labels.sort()).toEqual(['app', 'node-internal']);
  });
});
