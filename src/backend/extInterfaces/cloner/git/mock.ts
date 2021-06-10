import { ExecFileException } from 'child_process';
import { ExecResult, Path } from 'src/shared/types';

const mock = jest.fn().mockImplementation(async (args: string[], cwd?: Path): Promise<ExecResult> => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fsHelpersLocal = require(`src/backend/extInterfaces/fs/fs-extra/fsHelpers`);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pathLocal = require(`path`);
  const fullDest = fsHelpersLocal.getAbsolutePath(cwd || args.slice(-1)[0]);
  const usePath: string =
    args.filter((cur: string) => cur === 'sparse-checkout').length > 0
      ? pathLocal.resolve(fsHelpersLocal.getAbsolutePath(fullDest), args.slice(-1)[0].slice(1))
      : fullDest;
  if (!fsHelpersLocal.checkIfDirExists(usePath)) {
    await fsHelpersLocal.createDir(fsHelpersLocal.getAbsolutePath(usePath));
    await fsHelpersLocal.touchFile(`${usePath}${pathLocal.sep}main.tf`);
  }
  return Promise.resolve({
    error: null,
    stdout: ``,
    stderr: ``,
  });
});

//Mock running a cli command and recieving an error
// useful for actions like `git clone`, etc...
const mockError = jest.fn().mockImplementation(async (args: string[], cwd?: Path): Promise<ExecResult> => {
  return Promise.resolve({
    error: { name: ``, message: `oops!`, code: -1 } as ExecFileException,
    stdout: ``,
    stderr: ``,
  });
});

export default { mock, mockError };
