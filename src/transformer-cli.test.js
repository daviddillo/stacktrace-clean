'use strict';

const { parseTransformerArgs, handleTransformCommand } = require('./transformer-cli');

const trace = {
  header: 'Error: test',
  frames: [
    { name: 'fn1', resolved: true },
    { name: 'fn2', resolved: false },
    { name: 'fn3', resolved: true },
    { name: 'fn4', resolved: true },
  ],
};

test('parseTransformerArgs returns empty list when no flag given', () => {
  const opts = parseTransformerArgs([]);
  expect(opts.transforms).toEqual([]);
});

test('parseTransformerArgs parses single transform', () => {
  const opts = parseTransformerArgs(['--transform', 'stripUnresolved']);
  expect(opts.transforms).toEqual(['stripUnresolved']);
});

test('parseTransformerArgs parses comma-separated transforms', () => {
  const opts = parseTransformerArgs(['--transform', 'stripUnresolved,limit:10']);
  expect(opts.transforms).toEqual(['stripUnresolved', 'limit:10']);
});

test('handleTransformCommand returns trace unchanged when no transforms', () => {
  const result = handleTransformCommand(trace, []);
  expect(result).toBe(trace);
});

test('handleTransformCommand applies stripUnresolved', () => {
  const result = handleTransformCommand(trace, ['--transform', 'stripUnresolved']);
  expect(result.frames.every((f) => f.resolved !== false)).toBe(true);
});

test('handleTransformCommand applies limit:10', () => {
  const big = { ...trace, frames: Array.from({ length: 20 }, (_, i) => ({ name: `fn${i}`, resolved: true })) };
  const result = handleTransformCommand(big, ['--transform', 'limit:10']);
  expect(result.frames).toHaveLength(10);
});

test('handleTransformCommand chains multiple transforms', () => {
  const result = handleTransformCommand(trace, ['--transform', 'stripUnresolved,limit:10']);
  expect(result.frames.length).toBeLessThanOrEqual(10);
  expect(result.frames.every((f) => f.resolved !== false)).toBe(true);
});
