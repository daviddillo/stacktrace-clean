# stacktrace-clean

A CLI tool that parses and prettifies Node.js stack traces with source map support and color-coded output.

## Installation

```bash
npm install -g stacktrace-clean
```

## Usage

Pipe a stack trace directly into `stacktrace-clean`:

```bash
node app.js 2>&1 | stacktrace-clean
```

Or pass a file containing a stack trace:

```bash
stacktrace-clean --file error.log
```

**Example output:**

```
TypeError: Cannot read properties of undefined (reading 'name')
  at getUserName    src/users.js:42:15
  at handleRequest  src/server.js:88:5
  at Layer.handle   node_modules/express/lib/router/layer.js:95:5
```

### Options

| Flag | Description |
|------|-------------|
| `--file <path>` | Read stack trace from a file |
| `--no-color` | Disable color output |
| `--source-maps` | Enable source map resolution (default: true) |
| `--compact` | Hide node_modules frames |

## Requirements

- Node.js >= 14.0.0

## License

[MIT](LICENSE)