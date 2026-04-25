'use strict';

const {
  serializeFrame,
  serializeStackTrace,
  toJSON,
  toPlainText,
  toMarkdown,
} = require('./serializer');

const sampleFrame = {
  raw: '    at doSomething (/app/src/index.js:10:5)',
  name: 'doSomething',
  file: '/app/src/index.js',
  line: 10,
  column: 5,
  isInternal: false,
  isNative: false,
  resolved: null,
};

const sampleTrace = {
  header: 'Error: something went wrong',
  message: 'something went wrong',
  frames: [sampleFrame],
};

describe('serializeFrame', () => {
  it('returns a plain object with expected keys', () => {
    const result = serializeFrame(sampleFrame);
    expect(result).toHaveProperty('name', 'doSomething');
    expect(result).toHaveProperty('file', '/app/src/index.js');
    expect(result).toHaveProperty('line', 10);
    expect(result).toHaveProperty('column', 5);
    expect(result.isInternal).toBe(false);
  });

  it('defaults missing fields gracefully', () => {
    const result = serializeFrame({});
    expect(result.name).toBe('<anonymous>');
    expect(result.file).toBeNull();
    expect(result.line).toBeNull();
  });
});

describe('serializeStackTrace', () => {
  it('serializes header and frames', () => {
    const result = serializeStackTrace(sampleTrace);
    expect(result.header).toBe('Error: something went wrong');
    expect(result.frames).toHaveLength(1);
    expect(result.frames[0].name).toBe('doSomething');
  });

  it('handles missing frames', () => {
    const result = serializeStackTrace({ header: 'Error: oops' });
    expect(result.frames).toEqual([]);
  });
});

describe('toJSON', () => {
  it('produces valid JSON', () => {
    const json = toJSON(sampleTrace);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('pretty prints when flag is set', () => {
    const json = toJSON(sampleTrace, true);
    expect(json).toContain('\n');
  });
});

describe('toPlainText', () => {
  it('includes the header', () => {
    const text = toPlainText(sampleTrace);
    expect(text).toContain('Error: something went wrong');
  });

  it('includes frame info', () => {
    const text = toPlainText(sampleTrace);
    expect(text).toContain('doSomething');
    expect(text).toContain('/app/src/index.js:10:5');
  });
});

describe('toMarkdown', () => {
  it('wraps output in a code block', () => {
    const md = toMarkdown(sampleTrace);
    expect(md).toMatch(/^```/);
    expect(md).toMatch(/```$/);
  });
});
