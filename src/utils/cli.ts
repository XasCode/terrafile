import { resolve } from 'path';
import { execFile } from 'child_process';
import { ExecResult, Path } from '@jestaubach/terrafile-backend-lib';

// cli() is used by tests to execute the terrafile application
async function cli(script, args: string[], cwd?: Path): Promise<ExecResult> {
  return new Promise((resolvePromise) => {
    execFile(
      `node`,
      [`${resolve(script)}`, ...args],
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
