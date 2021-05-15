import { execFile } from 'child_process';
import { ExecResult, Path } from './types';

async function git(args: string[], cwd?: Path): Promise<ExecResult> {
  return new Promise((resolve) => {
    execFile(
      'git',
      [...args],
      {
        cwd,
      },
      (error, stdout, stderr) => {
        resolve({
          error,
          stdout,
          stderr,
        });
      }
    );
  });
}

export { git };
