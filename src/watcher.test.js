const fs = require('fs');
const path = require('path');
const os = require('os');
const { Watcher, createWatcher } = require('./watcher');
const { Readable } = require('stream');

describe('createWatcher', () => {
  it('returns a Watcher instance', () => {
    const w = createWatcher();
    expect(w).toBeInstanceOf(Watcher);
  });

  it('accepts interval option', () => {
    const w = createWatcher({ interval: 500 });
    expect(w.interval).toBe(500);
  });
});

describe('Watcher.watchFile', () => {
  let tmpFile;

  beforeEach(() => {
    tmpFile = path.join(os.tmpdir(), `watcher-test-${Date.now()}.txt`);
    fs.writeFileSync(tmpFile, 'initial content');
  });

  afterEach(() => {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  });

  it('emits ready with file path', (done) => {
    const w = createWatcher();
    w.on('ready', (fp) => {
      expect(fp).toBe(tmpFile);
      w.stop();
      done();
    });
    w.watchFile(tmpFile);
  });

  it('throws if file does not exist', () => {
    const w = createWatcher();
    expect(() => w.watchFile('/nonexistent/file.txt')).toThrow('File not found');
  });
});

describe('Watcher.watchStream', () => {
  it('emits data when stream ends', (done) => {
    const w = createWatcher();
    const stream = new Readable({ read() {} });

    w.on('data', (content) => {
      expect(content).toContain('Error: something went wrong');
      done();
    });

    w.watchStream(stream);
    stream.push('Error: something went wrong\n    at foo (bar.js:1:1)');
    stream.push(null);
  });

  it('emits end event after stream finishes', (done) => {
    const w = createWatcher();
    const stream = new Readable({ read() {} });

    w.on('end', done);
    w.watchStream(stream);
    stream.push(null);
  });

  it('does not emit data for empty stream', (done) => {
    const w = createWatcher();
    const stream = new Readable({ read() {} });
    const spy = jest.fn();

    w.on('data', spy);
    w.on('end', () => {
      expect(spy).not.toHaveBeenCalled();
      done();
    });

    w.watchStream(stream);
    stream.push(null);
  });
});

describe('Watcher.stop', () => {
  it('emits stopped event', (done) => {
    const w = createWatcher();
    w.on('stopped', done);
    w.stop();
  });
});
