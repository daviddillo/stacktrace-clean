import { parseArgs } from 'node:util';
import { createReadStream } from 'node:fs';
import { pipeline } from './pipeline.js';
import { exportToFile, exportToStream, validateFormat, listFormats } from './exporter.js';

const USAGE = `
Usage: stacktrace-clean export [options] <input>

Options:
  --format, -f   Output format: json | text | markdown  (default: json)
  --out,    -o   Output file path (stdout if omitted)
  --help,   -h   Show this help message
`.trim();

export async function runExportCLI(argv = process.argv.slice(2)) {
  const { values, positionals } = parseArgs({
    args: argv,
    options: {
      format: { type: 'string', short: 'f', default: 'json' },
      out:    { type: 'string', short: 'o' },
      help:   { type: 'boolean', short: 'h', default: false },
    },
    allowPositionals: true,
  });

  if (values.help) {
    process.stdout.write(USAGE + '\n');
    return;
  }

  const format = values.format;
  try {
    validateFormat(format);
  } catch (err) {
    process.stderr.write(`Error: ${err.message}\n`);
    process.stderr.write(`Supported formats: ${listFormats().join(', ')}\n`);
    process.exitCode = 1;
    return;
  }

  const inputPath = positionals[0];
  const source = inputPath ? createReadStream(inputPath) : process.stdin;

  let raw = '';
  for await (const chunk of source) raw += chunk;

  const stackTrace = await pipeline(raw);

  if (values.out) {
    const resolved = await exportToFile(stackTrace, format, values.out);
    process.stdout.write(`Exported to ${resolved}\n`);
  } else {
    await exportToStream(stackTrace, format, process.stdout);
  }
}
