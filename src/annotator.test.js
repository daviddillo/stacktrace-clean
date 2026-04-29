const { extractSnippet, annotateFrame, annotateStackTrace } = require('./annotator');

const LINES = [
  'function foo() {',
  '  const x = 1;',
  '  return bar(x);',  // line 3 — target
  '}',
  '',
  'function bar(n) {',
  '  throw new Error(n);',
];

describe('extractSnippet', () => {
  it('returns lines around the target', () => {
    const snippet = extractSnippet(LINES, 3, 2);
    expect(snippet).toHaveLength(5);
    expect(snippet[2].isTarget).toBe(true);
    expect(snippet[2].line).toBe(3);
  });

  it('clamps at start of file', () => {
    const snippet = extractSnippet(LINES, 1, 2);
    expect(snippet[0].line).toBe(1);
    expect(snippet.some((s) => s.line < 1)).toBe(false);
  });

  it('clamps at end of file', () => {
    const snippet = extractSnippet(LINES, 7, 2);
    expect(snippet[snippet.length - 1].line).toBe(7);
  });

  it('returns null for invalid line number', () => {
    expect(extractSnippet(LINES, 0)).toBeNull();
    expect(extractSnippet(null, 3)).toBeNull();
  });
});

describe('annotateFrame', () => {
  const mockRead = () => LINES;

  it('attaches snippet to a frame', () => {
    const frame = { file: 'foo.js', line: 3, column: 5, name: 'foo' };
    const result = annotateFrame(frame, { readLines: mockRead });
    expect(result.snippet).not.toBeNull();
    expect(result.snippet.find((s) => s.isTarget).line).toBe(3);
  });

  it('returns null snippet when file is missing', () => {
    const frame = { file: null, line: 3, name: 'anon' };
    const result = annotateFrame(frame, { readLines: mockRead });
    expect(result.snippet).toBeNull();
  });

  it('preserves original frame properties', () => {
    const frame = { file: 'foo.js', line: 2, column: 1, name: 'bar' };
    const result = annotateFrame(frame, { readLines: mockRead });
    expect(result.name).toBe('bar');
    expect(result.column).toBe(1);
  });
});

describe('annotateStackTrace', () => {
  const mockRead = () => LINES;

  it('annotates all frames', () => {
    const st = {
      message: 'Error: oops',
      frames: [
        { file: 'a.js', line: 1, name: 'a' },
        { file: 'b.js', line: 6, name: 'b' },
      ],
    };
    const result = annotateStackTrace(st, { readLines: mockRead });
    expect(result.frames).toHaveLength(2);
    result.frames.forEach((f) => expect(f).toHaveProperty('snippet'));
  });

  it('returns input unchanged if no frames array', () => {
    const st = { message: 'Error', frames: null };
    expect(annotateStackTrace(st)).toBe(st);
  });
});
