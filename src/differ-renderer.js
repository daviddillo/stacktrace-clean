'use strict';

/**
 * differ-renderer.js — renders a differ result as coloured CLI output
 */

const { formatFrame } = require('./formatter');

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  yellow: '\x1b[33m',
};

function colorize(color, text) {
  return `${COLORS[color]}${text}${COLORS.reset}`;
}

function renderDiffEntry(entry, { color = true } = {}) {
  const formatted = formatFrame(entry.frame);
  if (!color) {
    const prefix = entry.type === 'added' ? '+ ' : entry.type === 'removed' ? '- ' : '  ';
    return `${prefix}${formatted}`;
  }
  switch (entry.type) {
    case 'added':
      return colorize('green', `+ ${formatted}`);
    case 'removed':
      return colorize('red', `- ${formatted}`);
    default:
      return colorize('dim', `  ${formatted}`);
  }
}

function renderHeader(headerChanged, traceB, { color = true } = {}) {
  const prefix = headerChanged ? (color ? colorize('yellow', '~ ') : '~ ') : '  ';
  return `${prefix}${traceB.header || ''}`;
}

function renderSummary(summary, { color = true } = {}) {
  const parts = [];
  if (summary.added) parts.push(color ? colorize('green', `+${summary.added}`) : `+${summary.added}`);
  if (summary.removed) parts.push(color ? colorize('red', `-${summary.removed}`) : `-${summary.removed}`);
  if (summary.same) parts.push(color ? colorize('dim', `=${summary.same}`) : `=${summary.same}`);
  return parts.join('  ');
}

function renderDiff(traceA, traceB, compareResult, options = {}) {
  const lines = [];
  lines.push(renderHeader(compareResult.headerChanged, traceB, options));
  for (const entry of compareResult.diff) {
    lines.push(renderDiffEntry(entry, options));
  }
  lines.push('');
  lines.push(renderSummary(compareResult.summary, options));
  return lines.join('\n');
}

module.exports = { renderDiffEntry, renderHeader, renderSummary, renderDiff };
