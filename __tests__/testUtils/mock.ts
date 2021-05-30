//Mock running a cli command and recieving an error
// useful for actions like `git clone`, etc...
// function mockCliError(): void {
//   jest.mock(`../../src/run`, () => ({
//     git:
const mockCliError = jest.fn().mockImplementation(() => ({
  error: { name: ``, message: `oops!`, code: -1 },
  stdout: ``,
  stderr: ``,
}));

export { mockCliError };
