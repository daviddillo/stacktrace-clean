'use strict';

const {
  buildTransformer,
  applyNamed,
  applyNamed_sequence,
  identity,
  stripUnresolved,
  limitFrames,
} = require('./transformer');

const baseTrace = {
  header: 'Error: boom',
  frames: [
    { name: 'a', resolved: true },
    { name: 'b', resolved: false },
    { name: 'c', resolved: true },
  ],
};

test('identity returns trace unchanged', () => {
  expect(identity(baseTrace)).toBe(baseTrace);
});

test('buildTransformer with empty list is identity', () => {
  const t = buildTransformer([]);
  expect(t(baseTrace)).toBe(baseTrace);
});

test('buildTransformer chains transforms', () => {
  const addX = (tr) => ({ ...tr, x: 1 });
  const addY = (tr) => ({ ...tr, y: 2 });
  const t = buildTransformer([addX, addY]);
  const result = t(baseTrace);
  expect(result.x).toBe(1);
  expect(result.y).toBe(2);
});

test('stripUnresolved removes frames where resolved is false', () => {
  const result = stripUnresolved(baseTrace);
  expect(result.frames).toHaveLength(2);
  expect(result.frames.every((f) => f.resolved !== false)).toBe(true);
});

test('limitFrames restricts frame count', () => {
  const limiter = limitFrames(2);
  const result = limiter(baseTrace);
  expect(result.frames).toHaveLength(2);
  expect(result.frames[0].name).toBe('a');
});

test('applyNamed applies a registered transform', () => {
  const registry = { strip: stripUnresolved };
  const result = applyNamed(registry, 'strip', baseTrace);
  expect(result.frames).toHaveLength(2);
});

test('applyNamed throws on unknown transform', () => {
  expect(() => applyNamed({}, 'nope', baseTrace)).toThrow('Unknown transform: "nope"');
});

test('applyNamed_sequence applies multiple named transforms', () => {
  const registry = {
    strip: stripUnresolved,
    limit: limitFrames(1),
  };
  const result = applyNamed_sequence(registry, ['strip', 'limit'], baseTrace);
  expect(result.frames).toHaveLength(1);
  expect(result.frames[0].name).toBe('a');
});
