import path from 'path';

// Mock call to Axios to retrieve Terraform download URL,
// we don't want to hit the API repeatedly
// function mockAxiosGetTerraformUrl(): void {
//   jest.mock(`axios`, () =>
const mockAxiosGetTerraformUrl = () =>
  jest.fn(() => ({
    status: 204,
    headers: {
      'x-terraform-get': `git::https://github.com/xascode/terraform-aws-modules/terraform-aws-vpc.git?ref=2.78.0`,
    },
  }));

// Mock call to Axios to retrieve Terraform download URL,
// simulate non-204 response
// function mockAxiosGetTerraformUrl500Error(): void {
//   jest.mock(`axios`, () =>
const mockAxiosGetTerraformUrl500Error = () =>
  jest.fn(() => ({
    status: 500,
  }));

// Mock call to Axious to retrieve Terraform download URL,
// simulate 204 response, but no 'x-terraform-get' header
// function mockAxiosGetTerraformUrlNoXTFGetError(): void {
//  jest.mock(`axios`, () =>
const mockAxiosGetTerraformUrlNoXTFGetError = () =>
  jest.fn(() => ({
    status: 204,
    headers: {},
  }));

// Mock call to Axious to retrieve Terraform download URL,
// simulate 'x-terraform-get' doesn't contain git::
// function mockAxiosGetTerraformUrlFormatError(): void {
//   jest.mock(`axios`, () =>
const mockAxiosGetTerraformUrlFormatError = () =>
  jest.fn(() => ({
    status: 204,
    headers: {
      'x-terraform-get': `unexpectedformat`,
    },
  }));

// Mock running a cli command and recieving an error
// useful for actions like `git clone`, etc...
// function mockCliError(): void {
//   jest.mock(`../../src/run`, () => ({
//     git:
const mockCliError = jest.fn().mockImplementation(() => ({
  error: { name: ``, message: `oops!`, code: -1 },
  stdout: ``,
  stderr: ``,
}));

// Mock running cli command and successfully fetching a module
const mockCliSuccess = jest.fn().mockImplementation((args, cwd) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fsHelpersLocal = require(`../../src/fsHelpers`);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pathLocal = require(`path`);
  const fullDest = fsHelpersLocal.getAbsolutePath(cwd || args.slice(-1)[0]);
  const usePath: string =
    args.filter((cur: string) => cur === 'sparse-checkout').length > 0
      ? pathLocal.resolve(fsHelpersLocal.getAbsolutePath(fullDest), args.slice(-1)[0].slice(1))
      : fullDest;
  if (!fsHelpersLocal.checkIfDirExists(usePath)) {
    fsHelpersLocal.createDir(fsHelpersLocal.getAbsolutePath(usePath));
    fsHelpersLocal.touchFile(`${usePath}${pathLocal.sep}main.tf`);
  }
  return {
    error: null,
    stdout: ``,
    stderr: ``,
  };
});

export {
  mockAxiosGetTerraformUrl,
  mockAxiosGetTerraformUrl500Error,
  mockAxiosGetTerraformUrlNoXTFGetError,
  mockAxiosGetTerraformUrlFormatError,
  mockCliError,
  mockCliSuccess,
};
