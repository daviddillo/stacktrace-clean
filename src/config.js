import { readFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';

const DEFAULT_CONFIG = {
  colors: true,
  internalFrames: false,
  sourceMaps: true,
  contextLines: 3,
  outputFormat: 'pretty', // 'pretty' | 'json' | 'minimal'
  cwd: process.cwd(),
};

const CONFIG_FILE_NAMES = [
  '.stacktrace-clean.json',
  '.stacktrace-cleanrc',
  'stacktrace-clean.config.json',
];

export function findConfigFile(dir = process.cwd()) {
  for (const name of CONFIG_FILE_NAMES) {
    const filePath = join(dir, name);
    if (existsSync(filePath)) {
      return filePath;
    }
  }
  return null;
}

export function loadConfigFile(filePath) {
  try {
    const raw = readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Failed to parse config file at ${filePath}: ${err.message}`);
  }
}

export function mergeConfig(base, overrides) {
  const merged = { ...base };
  for (const [key, value] of Object.entries(overrides)) {
    if (key in DEFAULT_CONFIG) {
      merged[key] = value;
    }
  }
  return merged;
}

export function resolveConfig(cliFlags = {}) {
  let config = { ...DEFAULT_CONFIG };

  const configFilePath = cliFlags.config
    ? resolve(cliFlags.config)
    : findConfigFile();

  if (configFilePath) {
    const fileConfig = loadConfigFile(configFilePath);
    config = mergeConfig(config, fileConfig);
  }

  config = mergeConfig(config, cliFlags);

  return config;
}

export { DEFAULT_CONFIG };
