const execFile = require("child_process").execFile;

async function run(args, cwd) {
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

exports.run = run;
