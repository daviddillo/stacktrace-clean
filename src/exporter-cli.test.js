import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runExportCLI } from './exporter-cli.js';

vi.mock('./pipeline.js', () => ({
  pipeline: vi.fn().mockResolvedValue({ frames: [{ raw: 'at foo (foo.js:1:1)' }] }),
}));

vi.mock('./exporter.js', () => ({
  validateFormat:  vi.fn(),
  listFormats:     vi.fn(() => ['json', 'text', 'markdown']),
  exportToFile:    vi.fn().mockResolvedValue('/out/trace.json'),
  exportToStream:  vi.fn().mockResolvedValue(undefined),
}));

vi.mock('node:fs', () => ({
  createReadStream: vi.fn(() => {
    const { Readable } = require('node:stream');
    return Readable.from(['at foo (foo.js:1:1)']);
  }),
}));

import { validateFormat, exportToFile, exportToStream } from './exporter.js';

const writeOut = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
const writeErr = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);

beforeEach(() => {
  vi.clearAllMocks();
  process.exitCode = 0;
});

describe('runExportCLI', () => {
  it('prints help when --help is passed', async () => {
    await runExportCLI(['--help']);
    expect(writeOut).toHaveBeenCalledWith(expect.stringContaining('Usage'));
  });

  it('writes error and sets exitCode on bad format', async () => {
    validateFormat.mockImplementationOnce(() => { throw new Error('Unsupported export format: "xml"'); });
    await runExportCLI(['--format', 'xml']);
    expect(writeErr).toHaveBeenCalledWith(expect.stringContaining('Unsupported'));
    expect(process.exitCode).toBe(1);
  });

  it('exports to file when --out is provided', async () => {
    await runExportCLI(['--format', 'json', '--out', '/out/trace']);
    expect(exportToFile).toHaveBeenCalledWith(expect.any(Object), 'json', '/out/trace');
    expect(writeOut).toHaveBeenCalledWith(expect.stringContaining('Exported to'));
  });

  it('exports to stdout when --out is omitted', async () => {
    await runExportCLI(['--format', 'text']);
    expect(exportToStream).toHaveBeenCalledWith(expect.any(Object), 'text', process.stdout);
  });
});
