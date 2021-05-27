import { execFile } from 'child_process';
import { ExecResult, Path } from 'src/types';

async function git(args: string[], cwd?: Path): Promise<ExecResult> {
  console.error(JSON.stringify(args));
  console.error(JSON.stringify(cwd));
  return new Promise((resolve) => {
    execFile(
      `git`,
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
      },
    );
  });
}

export { git };
