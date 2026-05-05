const fs = require('fs');
const os = require('os');
const path = require('path');
const { saveSnapshot, getSnapshot, removeSnapshot, listSnapshots } = require('./snapshot');

const tmpStore = path.join(os.tmpdir(), `snapshot-test-${Date.now()}.json`);

const fakeTrace = {
  message: 'Error: something went wrong',
  frames: [
    { file: 'app.js', line: 10, column: 5, name: 'doThing' },
    { file: 'index.js', line: 3, column: 1, name: '<anonymous>' },
  ],
};

afterEach(() => {
  if (fs.existsSync(tmpStore)) fs.unlinkSync(tmpStore);
});

test('saveSnapshot stores entry with savedAt timestamp', () => {
  const entry = saveSnapshot('my-snap', fakeTrace, tmpStore);
  expect(entry.savedAt).toBeDefined();
  expect(entry.stackTrace).toEqual(fakeTrace);
});

test('getSnapshot returns saved entry', () => {
  saveSnapshot('alpha', fakeTrace, tmpStore);
  const entry = getSnapshot('alpha', tmpStore);
  expect(entry).not.toBeNull();
  expect(entry.stackTrace.message).toBe('Error: something went wrong');
});

test('getSnapshot returns null for unknown name', () => {
  expect(getSnapshot('nope', tmpStore)).toBeNull();
});

test('removeSnapshot deletes entry and returns true', () => {
  saveSnapshot('beta', fakeTrace, tmpStore);
  const result = removeSnapshot('beta', tmpStore);
  expect(result).toBe(true);
  expect(getSnapshot('beta', tmpStore)).toBeNull();
});

test('removeSnapshot returns false when not found', () => {
  expect(removeSnapshot('ghost', tmpStore)).toBe(false);
});

test('listSnapshots returns metadata for all entries', () => {
  saveSnapshot('one', fakeTrace, tmpStore);
  saveSnapshot('two', fakeTrace, tmpStore);
  const list = listSnapshots(tmpStore);
  expect(list).toHaveLength(2);
  expect(list[0]).toHaveProperty('name');
  expect(list[0]).toHaveProperty('savedAt');
  expect(list[0]).toHaveProperty('frameCount', 2);
});

test('saveSnapshot throws on missing name', () => {
  expect(() => saveSnapshot('', fakeTrace, tmpStore)).toThrow();
});
