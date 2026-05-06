'use strict';

const fs = require('fs');
const { buildTransformer, stripUnresolved, limitFrames, identity } = require('./transformer');

const BUILTIN_REGISTRY = {
  identity,
  stripUnresolved,
  'limit:10': limitFrames(10),
  'limit:20': limitFrames(20),
  'limit:50': limitFrames(50),
};

/**
 * Parse transformer CLI args.
 * --transform <name,...>   comma-separated list of builtin transform names
 */
function parseTransformerArgs(argv) {
  const opts = { transforms: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--transform' && argv[i + 1]) {
      opts.transforms = argv[++i].split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  return opts;
}

/**
 * Handle the --transform pipeline step in the CLI.
 *
 * @param {object} trace   - parsed stack trace object
 * @param {string[]} argv
 * @returns {object}       - transformed trace
 */
function handleTransformCommand(trace, argv) {
  const { transforms } = parseTransformerArgs(argv);
  if (transforms.length === 0) return trace;

  const fns = transforms.map((name) => {
    if (!BUILTIN_REGISTRY[name]) {
      process.stderr.write(`transformer: unknown transform "${name}"\n`);
      process.exit(1);
    }
    return BUILTIN_REGISTRY[name];
  });

  const transformer = buildTransformer(fns);
  return transformer(trace);
}

module.exports = { parseTransformerArgs, handleTransformCommand };
