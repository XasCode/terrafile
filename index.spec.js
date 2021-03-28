const path = require('path');
const exec = require('child_process').exec;

const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

describe.each`
  backend                    | args           | code    | expected
  ${""}                      | ${"install"}   | ${0}    | ${`Perform install.`}
  ${"./include.js"}          | ${"install"}   | ${0}    | ${`Perform install.`}
  ${"./include.mock.js"}     | ${"install"}   | ${0}    | ${`Perform install.`}
`('$backend $args', ({backend, args, code, expected}) => {

  beforeEach(() => {
    consoleSpy.mockClear()
  });

  test(`included output should be ${expected}`, async () => {
    const { install } = require(backend.length > 0 ? backend : './include');
    install();
    expect(console.log).toBeCalledTimes(1);
    expect(console.log).toHaveBeenLastCalledWith(expected);
  });

  test(`output should be ${expected}`, async () => {
    const result = await cli(args.split(' '), '.', backend);
    expect(result.stdout).toBe(`${expected}\n`);
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
