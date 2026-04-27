import { colorize, renderDiffEntry, renderHeader, renderSummary, renderDiff } from './differ-renderer.js';
import { stripAnsi } from './output.js';

const added = { type: 'added', frame: { raw: '    at foo (src/foo.js:10:5)', name: 'foo', file: 'src/foo.js', line: 10, col: 5 } };
const removed = { type: 'removed', frame: { raw: '    at bar (src/bar.js:20:3)', name: 'bar', file: 'src/bar.js', line: 20, col: 3 } };
const unchanged = { type: 'unchanged', frame: { raw: '    at baz (src/baz.js:5:1)', name: 'baz', file: 'src/baz.js', line: 5, col: 1 } };

describe('colorize', () => {
  it('prefixes added with green +', () => {
    const out = colorize('added', 'hello');
    expect(stripAnsi(out)).toBe('+ hello');
  });

  it('prefixes removed with red -', () => {
    const out = colorize('removed', 'hello');
    expect(stripAnsi(out)).toBe('- hello');
  });

  it('prefixes unchanged with space', () => {
    const out = colorize('unchanged', 'hello');
    expect(stripAnsi(out)).toBe('  hello');
  });
});

describe('renderDiffEntry', () => {
  it('renders an added entry', () => {
    const out = stripAnsi(renderDiffEntry(added));
    expect(out).toContain('+ ');
    expect(out).toContain('foo');
  });

  it('renders a removed entry', () => {
    const out = stripAnsi(renderDiffEntry(removed));
    expect(out).toContain('- ');
    expect(out).toContain('bar');
  });

  it('renders unchanged entry', () => {
    const out = stripAnsi(renderDiffEntry(unchanged));
    expect(out).toContain('baz');
  });
});

describe('renderHeader', () => {
  it('includes both error messages', () => {
    const out = stripAnsi(renderHeader('Error: A', 'Error: B'));
    expect(out).toContain('Error: A');
    expect(out).toContain('Error: B');
  });
});

describe('renderSummary', () => {
  it('shows added and removed counts', () => {
    const summary = { added: 3, removed: 1, unchanged: 5 };
    const out = stripAnsi(renderSummary(summary));
    expect(out).toContain('3');
    expect(out).toContain('1');
  });
});

describe('renderDiff', () => {
  it('renders full diff output', () => {
    const diffResult = {
      headerA: 'Error: A',
      headerB: 'Error: B',
      entries: [added, removed, unchanged],
      summary: { added: 1, removed: 1, unchanged: 1 }
    };
    const out = stripAnsi(renderDiff(diffResult));
    expect(out).toContain('Error: A');
    expect(out).toContain('foo');
    expect(out).toContain('bar');
    expect(out).toContain('baz');
  });
});
