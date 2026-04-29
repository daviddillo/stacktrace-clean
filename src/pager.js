/**
 * pager.js — paginate long stack trace output for terminal display
 */

const { spawn } = require('child_process');
const os = require('os');

const DEFAULT_PAGE_SIZE = 40;

function getTerminalHeight() {
  return process.stdout.rows || DEFAULT_PAGE_SIZE;
}

function countLines(text) {
  return text.split('\n').length;
}

function shouldPage(text, options = {}) {
  const { force = false, threshold = 0 } = options;
  if (force) return true;
  const termHeight = getTerminalHeight();
  const limit = threshold > 0 ? threshold : termHeight;
  return countLines(text) > limit;
}

function getPager() {
  const envPager = process.env.PAGER;
  if (envPager) return envPager;
  if (os.platform() === 'win32') return null;
  return 'less';
}

function pageText(text, options = {}) {
  return new Promise((resolve, reject) => {
    const pager = options.pager || getPager();

    if (!pager) {
      process.stdout.write(text);
      return resolve();
    }

    const args = pager === 'less' ? ['-R', '-F', '-X'] : [];
    const child = spawn(pager, args, { stdio: ['pipe', 'inherit', 'inherit'] });

    child.stdin.on('error', (err) => {
      if (err.code !== 'EPIPE') reject(err);
    });

    child.on('close', resolve);
    child.on('error', (err) => {
      // fallback to stdout if pager not available
      process.stdout.write(text);
      resolve();
    });

    child.stdin.write(text);
    child.stdin.end();
  });
}

async function maybePageOutput(text, options = {}) {
  if (!process.stdout.isTTY) {
    process.stdout.write(text);
    return;
  }
  if (shouldPage(text, options)) {
    await pageText(text, options);
  } else {
    process.stdout.write(text);
  }
}

module.exports = { shouldPage, getPager, pageText, maybePageOutput, countLines, getTerminalHeight };
