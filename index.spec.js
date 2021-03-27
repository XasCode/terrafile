const path = require('path');
const exec = require('child_process').exec;
test(`Code should be 0`, async () => {
  const result = await cli(['run'], '.');
  expect(result.code).toBe(0);
});

test(`output should be ...`, async () => {
  const result = await cli(['run'], '.');
  expect(result.stdout).toBe(`Hello World!\nThis is a test of requiring another file.\n`);
});

test(`output should be !!!`, async () => {
  const result = await cli(['run'], '.', `./include.mock.js`);
  expect(result.stdout).toBe(`Hello World!\n!!!\n`);
});


function cli(args, cwd, api='./include.js') {
  return new Promise(resolve => { 
    exec(
      `node ${path.resolve('./index')} ${args.join(' ')}`,
      { env: { ...process.env, terrafile_be_api: api }, cwd },
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
