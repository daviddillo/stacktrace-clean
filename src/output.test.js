import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Writable } from 'stream';
import { writeToStream, stripAnsi, prepareOutput } from './output.js';

function makeWritable() {
  const chunks = [];
  const stream = new Writable({
    write(chunk, _enc, cb) {
      chunks.push(chunk.toString());
      cb();
    },
  });
  stream.chunks = chunks;
  return stream;
}

describe('writeToStream', () => {
  it('writes text to the stream', async () => {
    const stream = makeWritable();
    await writeToStream('hello world', stream);
    expect(stream.chunks.join('')).toBe('hello world\n');
  });

  it('does not double-add newline if already present', async () => {
    const stream = makeWritable();
    await writeToStream('hello\n', stream);
    expect(stream.chunks.join('')).toBe('hello\n');
  });

  it('rejects on stream error', async () => {
    const stream = new Writable({
      write(_chunk, _enc, cb) {
        cb(new Error('write failed'));
      },
    });
    await expect(writeToStream('oops', stream)).rejects.toThrow('write failed');
  });
});

describe('stripAnsi', () => {
  it('removes ANSI color codes', () => {
    const colored = '\x1B[31mError\x1B[0m: something went wrong';
    expect(stripAnsi(colored)).toBe('Error: something went wrong');
  });

  it('returns plain text unchanged', () => {
    expect(stripAnsi('plain text')).toBe('plain text');
  });

  it('handles multiple codes in sequence', () => {
    const text = '\x1B[1m\x1B[33mWarn\x1B[0m';
    expect(stripAnsi(text)).toBe('Warn');
  });
});

describe('prepareOutput', () => {
  it('returns text as-is when noColor is false', () => {
    const text = '\x1B[32mok\x1B[0m';
    expect(prepareOutput(text, { noColor: false })).toBe(text);
  });

  it('strips ANSI codes when noColor is true', () => {
    const text = '\x1B[32mok\x1B[0m';
    expect(prepareOutput(text, { noColor: true })).toBe('ok');
  });

  it('defaults to keeping color when no options provided', () => {
    const text = '\x1B[32mok\x1B[0m';
    expect(prepareOutput(text)).toBe(text);
  });
});
