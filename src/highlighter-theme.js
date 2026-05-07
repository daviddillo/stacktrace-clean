/**
 * highlighter-theme.js
 * Applies theme styles to highlighted stack trace output.
 */

const { getStyle, resolveTheme } = require('./theme');
const { highlightErrorHeader, highlightFrame } = require('./highlighter');

/**
 * Wrap a string with ANSI codes from the resolved theme style.
 */
function applyStyle(text, styleName, theme) {
  const style = getStyle(styleName, theme);
  if (!style) return text;
  return style(text);
}

/**
 * Highlight an error header using the active theme.
 */
function highlightHeaderWithTheme(header, themeName) {
  const theme = resolveTheme(themeName);
  const [errorType, ...rest] = header.split(':');
  const message = rest.join(':');
  const styledType = applyStyle(errorType, 'errorType', theme);
  const styledMsg = message ? applyStyle(':' + message, 'errorMessage', theme) : '';
  return styledType + styledMsg;
}

/**
 * Highlight a single frame using the active theme.
 */
function highlightFrameWithTheme(frame, themeName) {
  const theme = resolveTheme(themeName);
  const prefix = applyStyle('  at ', 'frameAt', theme);
  const name = frame.name
    ? applyStyle(frame.name, frame.internal ? 'internalName' : 'frameName', theme)
    : applyStyle('<anonymous>', 'anonymous', theme);
  const location = frame.file
    ? applyStyle(`${frame.file}:${frame.line}:${frame.column}`, 'frameLocation', theme)
    : '';
  if (location) {
    return `${prefix}${name} (${location})`;
  }
  return `${prefix}${name}`;
}

/**
 * Highlight a full stack trace using the active theme.
 */
function highlightStackTraceWithTheme(stackTrace, themeName) {
  const lines = [];
  if (stackTrace.header) {
    lines.push(highlightHeaderWithTheme(stackTrace.header, themeName));
  }
  for (const frame of stackTrace.frames || []) {
    lines.push(highlightFrameWithTheme(frame, themeName));
  }
  return lines.join('\n');
}

module.exports = {
  applyStyle,
  highlightHeaderWithTheme,
  highlightFrameWithTheme,
  highlightStackTraceWithTheme,
};
