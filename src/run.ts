import { execFile } from "child_process";
import { ExecResult, Path } from "./types";

async function run(args: string[], cwd: Path): Promise<ExecResult> {
  return new Promise((resolve) => {
    execFile(
      "git",
      [...args],
      {
        cwd,
      },
      (error, stdout, stderr) => {
        resolve({
          code: error?.code || 0,
          error,
          stdout,
          stderr,
        });
      }
    );
  });
}

export { run };
