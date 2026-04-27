import { formatFrame } from './formatter.js';

const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const DIM = '\x1b[2m';
const BOLD = '\x1b[1m';
const CYAN = '\x1b[36m';

export function colorize(type, text) {
  switch (type) {
    case 'added':
      return `${GREEN}+ ${text}${RESET}`;
    case 'removed':
      return `${RED}- ${text}${RESET}`;
    case 'unchanged':
    default:
      return `${DIM}  ${text}${RESET}`;
  }
}

export function renderDiffEntry(entry) {
  const { type, frame } = entry;
  const text = formatFrame ? formatFrame(frame) : (frame.raw || String(frame));
  return colorize(type, text);
}

export function renderHeader(headerA, headerB) {
  const lineA = `${RED}- ${headerA}${RESET}`;
  const lineB = `${GREEN}+ ${headerB}${RESET}`;
  const divider = `${DIM}${'─'.repeat(60)}${RESET}`;
  return [divider, lineA, lineB, divider].join('\n');
}

export function renderSummary(summary) {
  const { added = 0, removed = 0, unchanged = 0 } = summary;
  const parts = [
    `${GREEN}${added} added${RESET}`,
    `${RED}${removed} removed${RESET}`,
    `${DIM}${unchanged} unchanged${RESET}`
  ];
  return `${BOLD}${CYAN}~${RESET} ${parts.join(', ')}`;
}

export function renderDiff(diffResult) {
  const { headerA = '', headerB = '', entries = [], summary = {} } = diffResult;
  const lines = [];

  lines.push(renderHeader(headerA, headerB));
  lines.push('');

  for (const entry of entries) {
    lines.push(renderDiffEntry(entry));
  }

  lines.push('');
  lines.push(renderSummary(summary));

  return lines.join('\n');
}
