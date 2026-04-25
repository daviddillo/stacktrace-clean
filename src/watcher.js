/**
 * watcher.js — watches stdin or a file for new stack trace input
 * and triggers re-processing on change.
 */

const fs = require('fs');
const { EventEmitter } = require('events');

class Watcher extends EventEmitter {
  constructor(options = {}) {
    super();
    this.interval = options.interval || 300;
    this._watcher = null;
    this._buffer = '';
    this._debounceTimer = null;
  }

  watchFile(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    this._watcher = fs.watch(filePath, { persistent: false }, (eventType) => {
      if (eventType === 'change') {
        clearTimeout(this._debounceTimer);
        this._debounceTimer = setTimeout(() => {
          try {
            const content = fs.readFileSync(filePath, 'utf8');
            this.emit('data', content);
          } catch (err) {
            this.emit('error', err);
          }
        }, this.interval);
      }
    });

    this.emit('ready', filePath);
    return this;
  }

  watchStream(stream) {
    stream.setEncoding('utf8');

    stream.on('data', (chunk) => {
      this._buffer += chunk;
    });

    stream.on('end', () => {
      if (this._buffer.trim()) {
        this.emit('data', this._buffer);
        this._buffer = '';
      }
      this.emit('end');
    });

    stream.on('error', (err) => {
      this.emit('error', err);
    });

    return this;
  }

  stop() {
    if (this._watcher) {
      this._watcher.close();
      this._watcher = null;
    }
    clearTimeout(this._debounceTimer);
    this.emit('stopped');
  }
}

function createWatcher(options) {
  return new Watcher(options);
}

module.exports = { Watcher, createWatcher };
