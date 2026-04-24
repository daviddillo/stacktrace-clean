import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { vol } from 'memfs';

vi.mock('fs', () => require('memfs').fs);

import {
  DEFAULT_CONFIG,
  findConfigFile,
  loadConfigFile,
  mergeConfig,
  resolveConfig,
} from './config.js';

describe('DEFAULT_CONFIG', () => {
  it('has expected default keys', () => {
    expect(DEFAULT_CONFIG).toMatchObject({
      colors: true,
      internalFrames: false,
      sourceMaps: true,
      contextLines: 3,
      outputFormat: 'pretty',
    });
  });
});

describe('mergeConfig', () => {
  it('merges known keys from overrides', () => {
    const result = mergeConfig(DEFAULT_CONFIG, { colors: false, contextLines: 5 });
    expect(result.colors).toBe(false);
    expect(result.contextLines).toBe(5);
    expect(result.sourceMaps).toBe(true);
  });

  it('ignores unknown keys', () => {
    const result = mergeConfig(DEFAULT_CONFIG, { unknownKey: 'oops' });
    expect(result).not.toHaveProperty('unknownKey');
  });

  it('does not mutate base config', () => {
    const base = { ...DEFAULT_CONFIG };
    mergeConfig(base, { colors: false });
    expect(base.colors).toBe(true);
  });
});

describe('loadConfigFile', () => {
  beforeEach(() => {
    vol.fromJSON({ '/project/.stacktrace-clean.json': JSON.stringify({ colors: false }) });
  });

  afterEach(() => vol.reset());

  it('parses a valid config file', () => {
    const config = loadConfigFile('/project/.stacktrace-clean.json');
    expect(config).toEqual({ colors: false });
  });

  it('throws on invalid JSON', () => {
    vol.fromJSON({ '/project/bad.json': 'not json' });
    expect(() => loadConfigFile('/project/bad.json')).toThrow('Failed to parse config file');
  });
});

describe('resolveConfig', () => {
  it('returns defaults when no flags or config file', () => {
    const config = resolveConfig();
    expect(config.outputFormat).toBe('pretty');
    expect(config.sourceMaps).toBe(true);
  });

  it('applies cli flags over defaults', () => {
    const config = resolveConfig({ colors: false, outputFormat: 'json' });
    expect(config.colors).toBe(false);
    expect(config.outputFormat).toBe('json');
  });
});
