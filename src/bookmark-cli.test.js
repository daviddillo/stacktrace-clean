const { handleBookmarkCommand } = require('./bookmark-cli');
const bookmark = require('./bookmark');

jest.mock('./bookmark');
jest.mock('./formatter', () => ({ formatStackTrace: (t) => t }));
jest.mock('./highlighter', () => ({ highlightStackTrace: (t) => String(t) }));

const fakeTrace = { message: 'Err', frames: [{ file: 'x.js', line: 1 }] };

beforeEach(() => jest.clearAllMocks());

test('save calls addBookmark with name and input', () => {
  bookmark.addBookmark.mockReturnValue({ savedAt: '2024-01-01' });
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  handleBookmarkCommand(['save', 'myErr'], fakeTrace);
  expect(bookmark.addBookmark).toHaveBeenCalledWith('myErr', fakeTrace);
  spy.mockRestore();
});

test('save warns when no name given', () => {
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  handleBookmarkCommand(['save'], fakeTrace);
  expect(bookmark.addBookmark).not.toHaveBeenCalled();
  spy.mockRestore();
});

test('show prints bookmark when found', () => {
  bookmark.getBookmark.mockReturnValue({ savedAt: '2024-01-01', stackTrace: fakeTrace });
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  handleBookmarkCommand(['show', 'myErr'], null);
  expect(bookmark.getBookmark).toHaveBeenCalledWith('myErr');
  spy.mockRestore();
});

test('show warns when bookmark not found', () => {
  bookmark.getBookmark.mockReturnValue(null);
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  handleBookmarkCommand(['show', 'ghost'], null);
  expect(spy).toHaveBeenCalled();
  spy.mockRestore();
});

test('list prints items', () => {
  bookmark.listBookmarks.mockReturnValue([{ name: 'a', savedAt: '2024-01-01', frameCount: 3 }]);
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  handleBookmarkCommand(['list'], null);
  expect(spy).toHaveBeenCalled();
  spy.mockRestore();
});

test('remove calls removeBookmark', () => {
  bookmark.removeBookmark.mockReturnValue(true);
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  handleBookmarkCommand(['remove', 'a'], null);
  expect(bookmark.removeBookmark).toHaveBeenCalledWith('a');
  spy.mockRestore();
});

test('clear calls clearBookmarks', () => {
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  handleBookmarkCommand(['clear'], null);
  expect(bookmark.clearBookmarks).toHaveBeenCalled();
  spy.mockRestore();
});
