const { parseFrame, parseStackTrace } = require('./parser');

describe('parseFrame', () => {
  test('parses a standard frame with function name', () => {
    const line = '    at myFunction (/home/user/project/index.js:10:5)';
    const frame = parseFrame(line);
    expect(frame).toEqual({
      functionName: 'myFunction',
      fileName: '/home/user/project/index.js',
      lineNumber: 10,
      columnNumber: 5,
      isNative: false,
      isEval: false,
    });
  });

  test('parses a frame without function name', () => {
    const line = '    at /home/user/project/index.js:42:3';
    const frame = parseFrame(line);
    expect(frame).toEqual({
      functionName: null,
      fileName: '/home/user/project/index.js',
      lineNumber: 42,
      columnNumber: 3,
      isNative: false,
      isEval: false,
    });
  });

  test('parses a native frame', () => {
    const line = '    at Array.forEach (native)';
    const frame = parseFrame(line);
    expect(frame).toEqual({
      functionName: 'Array.forEach',
      fileName: '<native>',
      lineNumber: 0,
      columnNumber: 0,
      isNative: true,
      isEval: false,
    });
  });

  test('parses an eval frame', () => {
    const line = '    at eval (eval at <anonymous> (repl:1:1):1:2)';
    const frame = parseFrame(line);
    expect(frame).not.toBeNull();
    expect(frame.isEval).toBe(true);
  });

  test('returns null for unrecognized lines', () => {
    expect(parseFrame('not a stack frame')).toBeNull();
    expect(parseFrame('')).toBeNull();
  });
});

describe('parseStackTrace', () => {
  test('extracts message and frames from a full stack trace', () => {
    const stack = [
      'TypeError: Cannot read property \'foo\' of undefined',
      '    at doSomething (/app/src/main.js:15:10)',
      '    at Object.<anonymous> (/app/src/main.js:30:1)',
    ].join('\n');

    const result = parseStackTrace(stack);
    expect(result.message).toBe("TypeError: Cannot read property 'foo' of undefined");
    expect(result.frames).toHaveLength(2);
    expect(result.frames[0].functionName).toBe('doSomething');
    expect(result.frames[0].lineNumber).toBe(15);
  });

  test('returns empty frames for empty input', () => {
    const result = parseStackTrace('');
    expect(result.frames).toHaveLength(0);
    expect(result.message).toBe('');
  });
});
