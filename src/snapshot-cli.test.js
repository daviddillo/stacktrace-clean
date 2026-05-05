const fs = require('fs');
const os = require('os');
const path = require('path');
const { handleSnapshotCommand } = require('./snapshot-cli');
const { saveSnapshot } = require('./snapshot');

const tmpStore = path.join(os.tmpdir(), `snapshot-cli-test-${Date.now()}.json`);
const config = { snapshotStore: tmpStore };

const fakeTrace = {
  message: 'Error: boom',
  frames: [{ file: 'x.js', line: 1, column: 1, name: 'x' }],
};

afterEach(() => {
  if (fs.existsSync(tmpStore)) fs.unlinkSync(tmpStore);
});

test('save subcommand stores snapshot and returns message', () => {
  const result = handleSnapshotCommand(['save', 'test-snap'], fakeTrace, config);
  expect(result.message).toMatch(/test-snap/);
  expect(result.error).toBeUndefined();
});

test('save subcommand errors without name', () => {
  const result = handleSnapshotCommand(['save'], fakeTrace, config);
  expect(result.error).toBeDefined();
});

test('get subcommand returns snapshot', () => {
  saveSnapshot('get-test', fakeTrace, tmpStore);
  const result = handleSnapshotCommand(['get', 'get-test'], null, config);
  expect(result.snapshot).toBeDefined();
  expect(result.snapshot.stackTrace.message).toBe('Error: boom');
});

test('get subcommand errors on missing snapshot', () => {
  const result = handleSnapshotCommand(['get', 'missing'], null, config);
  expect(result.error).toMatch(/not found/);
});

test('remove subcommand removes snapshot', () => {
  saveSnapshot('rm-test', fakeTrace, tmpStore);
  const result = handleSnapshotCommand(['remove', 'rm-test'], null, config);
  expect(result.message).toMatch(/rm-test/);
});

test('list subcommand returns snapshot metadata', () => {
  saveSnapshot('a', fakeTrace, tmpStore);
  saveSnapshot('b', fakeTrace, tmpStore);
  const result = handleSnapshotCommand(['list'], null, config);
  expect(result.snapshots).toHaveLength(2);
});

test('unknown subcommand returns error', () => {
  const result = handleSnapshotCommand(['explode'], null, config);
  expect(result.error).toMatch(/Unknown snapshot subcommand/);
});
