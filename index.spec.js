const path = require('path');
const exec = require('child_process').exec;

test('Code should be 0', async () => {
  let result = await cli(['run'], '.');
  expect(result.code).toBe(0);
});

test('output should be ...', async () => {
  let result = await cli(['run'], '.');
  expect(result.stdout).toBe(`Hello World!\nThis is a test of requiring another file.\n`);
});

function cli(args, cwd) {
  return new Promise(resolve => { 
    exec(
      `node ${path.resolve('./index')} ${args.join(' ')}`,
      { cwd },
      (error, stdout, stderr) => {
        resolve({
          code: error && error.code ? error.code : 0,
          error,
          stdout,
          stderr
        });
      }
    );
  });
}
