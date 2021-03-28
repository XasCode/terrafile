const path = require('path');
const exec = require('child_process').exec;

const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

describe.each`
  backend                    | args       | code    | expected
  ${""}                      | ${"run"}   | ${0}    | ${`Hello World!\nThis is a test of requiring another file.\n`}
  ${"./include.js"}          | ${"run"}   | ${0}    | ${`Hello World!\nThis is a test of requiring another file.\n`}
  ${"./include.mock.js"}     | ${'run'}   | ${0}    | ${`Hello World!\n!!!\n`}
`('$backend $args', ({backend, args, code, expected}) => {

  beforeEach(() => {
    consoleSpy.mockClear()
  });

  test('included output should be ...', async () => {
    const { printMsg } = require(backend.length > 0 ? backend : './include');
    printMsg();
    expect(console.log).toBeCalledTimes(1)
    expect(console.log).toHaveBeenLastCalledWith(expected.split('\n')[1])
  });

  test(`output should be ${expected}`, async () => {
    const result = await cli(args.split(' '), '.', backend);
    expect(result.stdout).toBe(expected);
    expect(result.code).toBe(code);
  });

});

function cli(args, cwd, api) {
  return new Promise(resolve => { 
    exec(
      `node ${path.resolve('./index')} ${args.join(' ')}`,
      {
        env: api.length > 0 ? { ...process.env, terrafile_be_api: api } : { ...process.env },
        cwd
      },
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
