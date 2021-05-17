// Mock call to Axios to retrieve Terraform download URL,
// we don't want to hit the API repeatedly
function mockAxiosGetTerraformUrl(): void {
  jest.mock(`axios`, () => jest.fn(() => ({
    status: 204,
    headers: {
      'x-terraform-get':
            `git::https://github.com/xascode/terraform-aws-modules/terraform-aws-vpc.git?ref=2.78.0`,
    },
  })));
}

// Mock running a cli command and recieving an error
// useful for actions like `git clone`, etc...
function mockCliError(): void {
  jest.mock(`../../src/run`, () => ({
    git: jest.fn().mockImplementation(() => ({
      error: { name: ``, message: `oops!`, code: -1 },
      stdout: ``,
      stderr: ``,
    })),
  }));
}

// Mock running cli command and successfully fetching a module
function mockCliSuccess(): void {
  jest.mock(`../../src/run`, () => ({
    git: jest.fn().mockImplementation((args, cwd) => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const fsHelpersLocal = require(`../../src/fsHelpers`);
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pathLocal = require(`path`);
      const fullDest = fsHelpersLocal.getAbsolutePath(
        cwd || args.slice(-1)[0],
      );
      if (!fsHelpersLocal.checkIfDirExists(fullDest)) {
        fsHelpersLocal.createDir(fullDest);
        fsHelpersLocal.touchFile(`${fullDest}${pathLocal.sep}main.tf`);
      }
      return {
        error: null,
        stdout: ``,
        stderr: ``,
      };
    }),
  }));
}

export { mockAxiosGetTerraformUrl, mockCliError, mockCliSuccess };
