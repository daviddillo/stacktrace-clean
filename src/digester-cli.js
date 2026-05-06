#!/usr/bin/env node
/**
 * digester-cli.js — CLI wrapper for stack trace fingerprinting
 *
 * Usage:
 *   cat trace.txt | stacktrace-clean digest [--depth N] [--hash-length N] [--with-header]
 */

const { digestStackTrace, digestWithHeader, groupByFingerprint } = require('./digester');

function parseDigesterArgs(argv) {
  const opts = { depth: 5, hashLength: 12, withHeader: false, group: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--depth' && argv[i + 1]) opts.depth = parseInt(argv[++i], 10);
    else if (argv[i] === '--hash-length' && argv[i + 1]) opts.hashLength = parseInt(argv[++i], 10);
    else if (argv[i] === '--with-header') opts.withHeader = true;
    else if (argv[i] === '--group') opts.group = true;
  }
  return opts;
}

/**
 * Handle the `digest` sub-command.
 * @param {object[]} traces   - parsed stack trace objects
 * @param {string[]} argv     - raw CLI args after the sub-command
 * @param {object}  streams   - { stdout, stderr }
 */
function handleDigestCommand(traces, argv, streams = {}) {
  const out = streams.stdout || process.stdout;
  const err = streams.stderr || process.stderr;

  if (!traces || traces.length === 0) {
    err.write('digester: no traces provided\n');
    return;
  }

  const opts = parseDigesterArgs(argv);
  const digestFn = opts.withHeader ? digestWithHeader : digestStackTrace;

  if (opts.group) {
    const groups = groupByFingerprint(traces, opts);
    groups.forEach((members, fp) => {
      out.write(`${fp}  (${members.length} occurrence${members.length === 1 ? '' : 's'})\n`);
    });
    out.write(`\n${groups.size} unique fingerprint${groups.size === 1 ? '' : 's'}\n`);
    return;
  }

  for (const trace of traces) {
    const fp = digestFn(trace, opts);
    const label = trace.header ? trace.header.split('\n')[0].trim() : '(no header)';
    out.write(`${fp}  ${label}\n`);
  }
}

module.exports = { parseDigesterArgs, handleDigestCommand };
