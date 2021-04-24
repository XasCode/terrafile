exports.setup = function () {
  global.consoleSpyLog = jest.spyOn(console, "log").mockImplementation();
  global.stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation();
  global.consoleSpyErr = jest.spyOn(console, "error").mockImplementation();
  global.stderrSpy = jest.spyOn(process.stderr, "write").mockImplementation();
  global.mockExit = jest.spyOn(process, "exit").mockImplementation(() => {});

  global.axios = require("axios");

  jest.mock("axios", () => ({
    default: jest.fn((opts) => {
      //console.log(opts);
      return {
        status: 204,
        headers: {
          "x-terraform-get":
            "git::https://github.com/xascode/terraform-aws-modules/terraform-aws-vpc.git?ref=2.78.0",
        },
      };
    }),
  }));

  global.run = require("../src/run");
  jest.mock("../src/run", () => {
    return {
      run: jest.fn().mockImplementation((args, cwd) => {
        const fsHelpers = require("../src/fsHelpers");
        const path = require("path");
        const fullDest = fsHelpers.getAbsolutePath(cwd || args.slice(-1)[0]);
        if (!fsHelpers.checkIfDirExists(fullDest)) {
          fsHelpers.createDir(fullDest);
          fsHelpers.touchFile(`${fullDest}${path.sep}main.tf`);
        }
        return {
          code: 0,
          error: null,
          stdout: "",
          stderr: "",
        };
      }),
    };
  });
};

exports.beforeEach = function () {
  global.consoleSpyLog.mockClear();
  global.consoleSpyErr.mockClear();
  global.stdoutSpy.mockClear();
  global.stderrSpy.mockClear();
  global.mockExit.mockClear();
};
