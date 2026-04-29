import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validateFormat,
  serializeAs,
  getExtension,
  exportToFile,
  exportToStream,
  listFormats,
} from './exporter.js';

vi.mock('./serializer.js', () => ({
  toJSON:      (st) => JSON.stringify({ frames: st.frames }),
  toPlainText: (st) => st.frames.map(f => f.raw).join('\n'),
  toMarkdown:  (st) => `## Stack\n${st.frames.map(f => `- ${f.raw}`).join('\n')}`,
}));

vi.mock('./output.js', () => ({
  writeToFile:   vi.fn().mockResolvedValue(undefined),
  writeToStream: vi.fn().mockResolvedValue(undefined),
}));

import { writeToFile, writeToStream } from './output.js';

const mockTrace = { frames: [{ raw: 'at foo (foo.js:1:1)' }] };

describe('validateFormat', () => {
  it('accepts valid formats', () => {
    expect(() => validateFormat('json')).not.toThrow();
    expect(() => validateFormat('text')).not.toThrow();
    expect(() => validateFormat('markdown')).not.toThrow();
  });

  it('throws on unknown format', () => {
    expect(() => validateFormat('xml')).toThrow('Unsupported export format');
  });
});

describe('serializeAs', () => {
  it('serializes to json', () => {
    expect(serializeAs(mockTrace, 'json')).toContain('frames');
  });

  it('serializes to text', () => {
    expect(serializeAs(mockTrace, 'text')).toContain('at foo');
  });

  it('serializes to markdown', () => {
    expect(serializeAs(mockTrace, 'markdown')).toContain('## Stack');
  });
});

describe('getExtension', () => {
  it('returns correct extensions', () => {
    expect(getExtension('json')).toBe('.json');
    expect(getExtension('text')).toBe('.txt');
    expect(getExtension('markdown')).toBe('.md');
  });
});

describe('exportToFile', () => {
  beforeEach(() => vi.clearAllMocks());

  it('appends extension if missing', async () => {
    const path = await exportToFile(mockTrace, 'json', '/out/trace');
    expect(path).toBe('/out/trace.json');
    expect(writeToFile).toHaveBeenCalledWith('/out/trace.json', expect.any(String));
  });

  it('does not double-append extension', async () => {
    const path = await exportToFile(mockTrace, 'text', '/out/trace.txt');
    expect(path).toBe('/out/trace.txt');
  });
});

describe('exportToStream', () => {
  it('writes serialized content to stream', async () => {
    const stream = {};
    await exportToStream(mockTrace, 'markdown', stream);
    expect(writeToStream).toHaveBeenCalledWith(stream, expect.stringContaining('## Stack'));
  });
});

describe('listFormats', () => {
  it('returns all supported formats', () => {
    expect(listFormats()).toEqual(['json', 'text', 'markdown']);
  });
});
