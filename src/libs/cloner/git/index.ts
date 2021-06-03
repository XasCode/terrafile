import { execFile } from 'child_process';
import { ExecResult, Path } from 'src/types';

async function git(args: string[], cwd?: Path): Promise<ExecResult> {
  return new Promise((resolve) => {
    execFile(`git`, [...args], { cwd }, (error, stdout, stderr) => {
      resolve({ error, stdout, stderr });
    });
  });
}

function use(
  cloneLibrary: (_: string[], __?: Path) => Promise<ExecResult>,
): (args: string[], cwd?: Path) => Promise<ExecResult> {
  return async function cloner(args: string[], cwd?: Path): Promise<ExecResult> {
    return cloneLibrary(args, cwd);
  };
}

const mock = jest.fn().mockImplementation(async (args: string[], cwd?: Path): Promise<ExecResult> => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fsHelpersLocal = require(`src/fsHelpers`);
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

export default { use, mock, default: git };
