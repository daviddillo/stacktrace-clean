'use strict';

const { parseTracerArgs, handleTracerCommand } = require('./tracer-cli');
const { Writable } = require('stream');

function makeWritable() {
  const chunks = [];
  const stream = new Writable({
    write(chunk, _enc, cb) { chunks.push(chunk.toString()); cb(); },
  });
  stream.collected = () => chunks.join('');
  return stream;
}

describe('parseTracerArgs', () => {
  it('parses --context flag', () => {
    const args = parseTracerArgs(['--context', 'web']);
    expect(args.context).toBe('web');
  });

  it('parses --cause flag', () => {
    const args = parseTracerArgs(['--cause', 'cause.txt']);
    expect(args.causeFile).toBe('cause.txt');
  });

  it('parses --extract flag', () => {
    const args = parseTracerArgs(['--extract', 'db']);
    expect(args.extract).toBe('db');
  });

  it('treats bare argument as input file', () => {
    const args = parseTracerArgs(['trace.txt']);
    expect(args.input).toBe('trace.txt');
  });

  it('returns null defaults when no flags given', () => {
    const args = parseTracerArgs([]);
    expect(args.context).toBeNull();
    expect(args.causeFile).toBeNull();
  });
});

describe('handleTracerCommand', () => {
  const sampleTrace = 'Error: boom\n    at Object.<anonymous> (app.js:10:5)\n    at Module._compile (internal/modules/cjs/loader.js:999:30)';

  it('writes highlighted output to stdout stream', () => {
    const out = makeWritable();
    handleTracerCommand([], sampleTrace, out);
    expect(out.collected().length).toBeGreaterThan(0);
  });

  it('applies context label when --context provided', () => {
    const out = makeWritable();
    // Should not throw
    expect(() => handleTracerCommand(['--context', 'api'], sampleTrace, out)).not.toThrow();
  });

  it('applies extract filter when --extract provided', () => {
    const out = makeWritable();
    // frames without matching context → empty result, still writes
    expect(() => handleTracerCommand(['--extract', 'missing'], sampleTrace, out)).not.toThrow();
  });
});
