// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalAny: any = global;

// setup(): spyOn/mock console messages, stderr, stdout, and process.exit
function setup(): void {
  globalAny.consoleSpyLog = jest.spyOn(console, `log`).mockImplementation();
  globalAny.stdoutSpy = jest.spyOn(process.stdout, `write`).mockImplementation();
  globalAny.consoleSpyErr = jest.spyOn(console, `error`).mockImplementation();
  globalAny.stderrSpy = jest.spyOn(process.stderr, `write`).mockImplementation();
  globalAny.mockExit = jest.spyOn(process, `exit`).mockImplementation((): never => {
    throw new Error(`exit`);
  });
}

// clear(): clean up mocked spy functions
function clear(): void {
  globalAny.consoleSpyLog.mockClear();
  globalAny.consoleSpyErr.mockClear();
  globalAny.stdoutSpy.mockClear();
  globalAny.stderrSpy.mockClear();
  globalAny.mockExit.mockClear();
}

export { setup, clear };
