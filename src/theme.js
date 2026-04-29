/**
 * theme.js — Manages color theme configuration for stack trace output.
 * Supports built-in themes and custom overrides via config.
 */

const THEMES = {
  default: {
    error: ['red', 'bold'],
    errorMessage: ['white', 'bold'],
    internalFrame: ['gray'],
    userFrame: ['cyan'],
    nodeFrame: ['dim'],
    filePath: ['yellow'],
    lineNumber: ['green'],
    columnNumber: ['green'],
    functionName: ['white'],
    anonymous: ['dim'],
    prefix: ['dim'],
    summary: ['magenta'],
  },
  minimal: {
    error: ['red'],
    errorMessage: ['white'],
    internalFrame: ['dim'],
    userFrame: ['white'],
    nodeFrame: ['dim'],
    filePath: ['dim'],
    lineNumber: ['dim'],
    columnNumber: ['dim'],
    functionName: ['dim'],
    anonymous: ['dim'],
    prefix: ['dim'],
    summary: ['dim'],
  },
  none: {},
};

const BUILT_IN_NAMES = Object.keys(THEMES);

function resolveTheme(nameOrObject) {
  if (!nameOrObject || nameOrObject === 'none') return THEMES.none;
  if (typeof nameOrObject === 'string') {
    if (!THEMES[nameOrObject]) {
      throw new Error(`Unknown theme: "${nameOrObject}". Available: ${BUILT_IN_NAMES.join(', ')}`);
    }
    return THEMES[nameOrObject];
  }
  if (typeof nameOrObject === 'object') {
    return { ...THEMES.default, ...nameOrObject };
  }
  return THEMES.default;
}

function getStyle(theme, key) {
  if (!theme || !theme[key]) return null;
  return theme[key];
}

function listThemes() {
  return BUILT_IN_NAMES;
}

module.exports = { resolveTheme, getStyle, listThemes, THEMES };
