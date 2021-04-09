exports.setup = function () {
  global.consoleSpyLog = jest.spyOn(console, "log").mockImplementation();
  global.stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation();
  global.consoleSpyErr = jest.spyOn(console, "error").mockImplementation();
  global.stderrSpy = jest.spyOn(process.stderr, "write").mockImplementation();
  global.mockExit = jest.spyOn(process, "exit").mockImplementation(() => {});
};

exports.beforeEach = function () {
  global.consoleSpyLog.mockClear();
  global.consoleSpyErr.mockClear();
  global.stdoutSpy.mockClear();
  global.stderrSpy.mockClear();
  global.mockExit.mockClear();
};
