const fs = require('fs');
const path = require('path');
const os = require('os');
const {
  addBookmark, getBookmark, removeBookmark, listBookmarks, clearBookmarks,
} = require('./bookmark');

const STORE = path.join(os.tmpdir(), `bookmark-test-${Date.now()}.json`);

const fakeTrace = {
  message: 'Error: test',
  frames: [
    { file: 'app.js', line: 10, column: 5, name: 'doThing' },
    { file: 'index.js', line: 3, column: 1, name: '<anonymous>' },
  ],
};

afterEach(() => {
  try { fs.unlinkSync(STORE); } catch {}
});

test('addBookmark saves a named entry', () => {
  const entry = addBookmark('my-error', fakeTrace, STORE);
  expect(entry.stackTrace).toEqual(fakeTrace);
  expect(entry.savedAt).toBeTruthy();
});

test('getBookmark retrieves saved entry', () => {
  addBookmark('err1', fakeTrace, STORE);
  const result = getBookmark('err1', STORE);
  expect(result.stackTrace.message).toBe('Error: test');
});

test('getBookmark returns null for missing key', () => {
  expect(getBookmark('nope', STORE)).toBeNull();
});

test('removeBookmark deletes an entry', () => {
  addBookmark('temp', fakeTrace, STORE);
  expect(removeBookmark('temp', STORE)).toBe(true);
  expect(getBookmark('temp', STORE)).toBeNull();
});

test('removeBookmark returns false when entry missing', () => {
  expect(removeBookmark('ghost', STORE)).toBe(false);
});

test('listBookmarks returns summary of all entries', () => {
  addBookmark('a', fakeTrace, STORE);
  addBookmark('b', fakeTrace, STORE);
  const list = listBookmarks(STORE);
  expect(list).toHaveLength(2);
  expect(list[0]).toMatchObject({ name: 'a', frameCount: 2 });
});

test('clearBookmarks empties the store', () => {
  addBookmark('x', fakeTrace, STORE);
  clearBookmarks(STORE);
  expect(listBookmarks(STORE)).toHaveLength(0);
});

test('addBookmark throws on invalid name', () => {
  expect(() => addBookmark('', fakeTrace, STORE)).toThrow();
});
