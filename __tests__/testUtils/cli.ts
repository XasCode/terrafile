import { resolve } from 'path';
import { execFile } from 'child_process';
import { ExecResult, Path } from 'src/types';

// cli() is used by tests to execute the terrafile application
async function cli(args: string[], cwd?: Path): Promise<ExecResult> {
  return new Promise((resolvePromise) => {
    execFile(
      `node`,
      [`${resolve(`./dist/src/terrafile`)}`, ...args],
      {
        cwd,
      },
      (error, stdout, stderr) => {
        resolvePromise({
          error,
          stdout,
          stderr,
        });
      },
    );
  });
}

export { cli };
